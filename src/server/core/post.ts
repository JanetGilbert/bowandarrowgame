import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  console.log('createPost called with subredditName:', subredditName);
  
  if (!subredditName) {
    console.error('subredditName is missing from context');
    throw new Error('subredditName is required');
  }

  console.log('About to call submitCustomPost...');
  return await reddit.submitCustomPost({
    splash: {
      // Splash screen customization
      appDisplayName: 'ZenCrossbow',
      backgroundUri: 'default-splash.png',
      buttonLabel: 'Start Playing',
      description: 'A chilltastic archery game',
      heading: 'ZenCrossbow',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
    },
    subredditName: subredditName,
    title: 'ZenCrossbow',
  });
};
