import 'dotenv/config';
import mongoose from 'mongoose';
import Topic from '../src/models/Topic.js';
import Problem from '../src/models/Problem.js';
import Tutorial from '../src/models/Tutorial.js';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const topicCount = await Topic.countDocuments();
    const problemCount = await Problem.countDocuments();
    const tutorialCount = await Tutorial.countDocuments();
    console.log(`Topics: ${topicCount}`);
    console.log(`Problems: ${problemCount}`);
    console.log(`Tutorials: ${tutorialCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Verification failed', err.message);
    process.exit(1);
  }
})();
