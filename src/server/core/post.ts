import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash screen customization
      appDisplayName: 'ZenArcher',
      backgroundUri: 'default-splash.png',
      buttonLabel: 'Start Playing',
      description: 'A chilltastic archery game',
      entryUri: 'index.html',
      heading: 'ZenArcher',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
    },
    subredditName: subredditName,
    title: 'ZenArcher',
  });
};
