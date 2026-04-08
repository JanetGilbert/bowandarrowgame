export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
};
/*
export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};*/

export type HighScoreEntry = {
  name: string;
  score: number;
};

export type PostScoreRequest = {
  name: string;
  score: number;
};

export type PostScoreResponse = {
  type: 'post-score';
  success: boolean;
};

export type GetHighScoresResponse = {
  type: 'high-scores';
  scores: HighScoreEntry[];
};

export type UserRankResponse = {
  type: 'user-rank';
  rank: number | null;
  score: number | null;
};
