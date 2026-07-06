import express from 'express';
import { InitResponse, PostScoreRequest, PostScoreResponse, GetHighScoresResponse, HighScoreEntry, UserRankResponse } from '../shared/types/api';
import { redis, createServer, context, reddit } from '@devvit/web/server';
import { createPost } from './core/post';
import { sanitizeName } from './core/sanitizeName';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }
 
    try {
      const count = await redis.get('count');
      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);
/*
router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);*/

// High Score endpoints
const HIGH_SCORE_KEY = 'zencrossbow:highscores';

router.post<unknown, PostScoreResponse | { status: string; message: string }, PostScoreRequest>(
  '/api/post-highscore',
  async (req, res): Promise<void> => {
    try {
      const { name, score } = req.body;

      if (typeof score !== 'number' || !Number.isFinite(score)) {
        res.status(400).json({
          status: 'error',
          message: 'Name and score are required',
        });
        return;
      }

      // Prefer the authenticated Reddit username so the API can't be used to
      // store arbitrary names; fall back to the submitted name (sanitized)
      // only when no username is available.
      let username: string | undefined;
      try {
        username = await reddit.getCurrentUsername();
      } catch {
        username = undefined;
      }
      const safeName = sanitizeName(username || (typeof name === 'string' ? name : ''));

      if (!safeName) {
        res.status(400).json({
          status: 'error',
          message: 'Name and score are required',
        });
        return;
      }

      // Add score to sorted set (higher scores get higher rank)
      // Use name as member, score as the score value
      // If name exists, update with new score only if higher
      const existingScore = await redis.zScore(HIGH_SCORE_KEY, safeName);

      if (!existingScore || score > existingScore) {
        await redis.zAdd(HIGH_SCORE_KEY, { member: safeName, score });
      }

      res.json({
        type: 'post-score',
        success: true,
      });
    } catch (error) {
      console.error('Error posting high score:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to post high score',
      });
    }
  }
);

router.get<unknown, GetHighScoresResponse | { status: string; message: string }>(
  '/api/fetch-highscores',
  async (req, res): Promise<void> => {
    try {
      const rawLimitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
      const rawLimit = typeof rawLimitParam === 'string' ? rawLimitParam : undefined;
      const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : 5;
      const limit = Number.isFinite(parsedLimit)
        ? Math.max(1, Math.min(parsedLimit, 50))
        : 5;

      // Get top scores (reverse order - highest first)
      const topScores = await redis.zRange(HIGH_SCORE_KEY, 0, limit - 1, { reverse: true, by: 'rank' });

      // Sanitize on the way out too, so entries stored before validation
      // existed still display clean.
      const scores: HighScoreEntry[] = topScores.map((entry) => ({
        name: sanitizeName(entry.member) || 'Anonymous',
        score: entry.score,
      }));

      res.json({
        type: 'high-scores',
        scores,
      });
    } catch (error) {
      console.error('Error fetching high scores:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch high scores',
      });
    }
  }
);

router.get<unknown, UserRankResponse | { status: string; message: string }>(
  '/api/user-rank',
  async (_req, res): Promise<void> => {
    try {
      const rawUsername = await reddit.getCurrentUsername();
      // Scores are stored under the sanitized name, so look up the same way.
      const username = rawUsername ? sanitizeName(rawUsername) : '';
      if (!username) {
        res.json({ type: 'user-rank', rank: null, score: null });
        return;
      }

      const score = await redis.zScore(HIGH_SCORE_KEY, username);
      if (score === undefined || score === null) {
        res.json({ type: 'user-rank', rank: null, score: null });
        return;
      }

      // zRange in reverse to count how many scores are above the user's
      const allScores = await redis.zRange(HIGH_SCORE_KEY, 0, -1, { reverse: true, by: 'rank' });
      const rank = allScores.findIndex((e) => e.member === username) + 1;

      res.json({ type: 'user-rank', rank: rank > 0 ? rank : null, score });
    } catch (error) {
      console.error('Error fetching user rank:', error);
      res.json({ type: 'user-rank', rank: null, score: null });
    }
  }
);

router.get<unknown, { username: string } | { status: string; message: string }>(
  '/api/user',
  async (_req, res): Promise<void> => {
    try {
      const [username] = await Promise.all([
        reddit.getCurrentUsername()
      ]);

      res.json({ username: username || 'Anonymous' });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.json({ username: 'Anonymous' });
    }
  }
);


router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/clean-highscores', async (_req, res): Promise<void> => {
  try {
    const entries = await redis.zRange(HIGH_SCORE_KEY, 0, -1, { by: 'rank' });
    const vandalized = entries
      .map((e) => e.member)
      .filter((member) => sanitizeName(member) !== member);

    if (vandalized.length > 0) {
      await redis.zRem(HIGH_SCORE_KEY, vandalized);
    }

    res.json({
      showToast: `Removed ${vandalized.length} invalid high score entr${vandalized.length === 1 ? 'y' : 'ies'}.`,
    });
  } catch (error) {
    console.error('Error cleaning high scores:', error);
    res.status(400).json({
      status: 'error',
      message: 'Failed to clean high scores',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = process.env.WEBBIT_PORT || 3000;

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));
