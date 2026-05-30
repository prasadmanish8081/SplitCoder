import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Tutorial from '../models/Tutorial.js';

dotenv.config();

const tutorials = [
  {
    title: 'Python for Beginners - Full Course (freeCodeCamp.org)',
    description: 'Comprehensive Python full course for beginners.',
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    thumbnailUrl: 'https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg',
    order: 1
  },
  {
    title: 'Python Tutorial for Beginners (Programming with Mosh)',
    description: 'Beginner-friendly Python tutorial covering fundamentals.',
    videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    thumbnailUrl: 'https://i.ytimg.com/vi/kqtD5dpn9C8/maxresdefault.jpg',
    order: 2
  },
  {
    title: 'Python Tutorial (Corey Schafer)',
    description: 'Core concepts and examples from Corey Schafer.',
    videoUrl: 'https://www.youtube.com/user/schafer5',
    thumbnailUrl: 'https://i.ytimg.com/vi/YYXdXT2G2Cw/maxresdefault.jpg',
    order: 3
  },
  {
    title: 'Python for Absolute Beginners (CS Dojo)',
    description: 'CS Dojo Python walkthrough and practical examples.',
    videoUrl: 'https://www.youtube.com/watch?v=pkYVOmU3MgA',
    thumbnailUrl: 'https://i.ytimg.com/vi/pkYVOmU3MgA/maxresdefault.jpg',
    order: 4
  },
  {
    title: 'Python Programming Tutorial (Tech With Tim)',
    description: 'Project-oriented Python tutorials and tips.',
    videoUrl: 'https://www.youtube.com/watch?v=VchuKL44s6E',
    thumbnailUrl: 'https://i.ytimg.com/vi/VchuKL44s6E/maxresdefault.jpg',
    order: 5
  }
];

const run = async () => {
  await connectDB();

  for (const t of tutorials) {
    const exists = await Tutorial.findOne({ videoUrl: t.videoUrl });
    if (exists) {
      console.log('Already exists:', t.title);
      continue;
    }
    const created = await Tutorial.create(t);
    console.log('Inserted tutorial:', created.title);
  }

  console.log('YouTube tutorial seed complete');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
