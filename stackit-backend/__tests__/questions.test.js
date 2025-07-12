import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import server from '../index.js';
import Question from '../models/questionModel.js';
import User from '../models/userModel.js';

let mongoServer;
let testUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a user for testing question creation
  testUser = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the Question collection before each test
  await Question.deleteMany({});
});

describe('Question API', () => {
  it('should get a list of questions', async () => {
    // Create some test questions
    await Question.create({
      title: 'Test Question 1',
      description: 'This is a test question.',
      author: testUser._id,
      tags: [],
    });
    await Question.create({
      title: 'Test Question 2',
      description: 'This is another test question.',
      author: testUser._id,
      tags: [],
    });

    const res = await request(server).get('/api/questions');

    expect(res.statusCode).toEqual(200);
    expect(res.body.questions).toHaveLength(2);
    expect(res.body.questions[0].title).toBe('Test Question 2'); // Sorted by newest
  });
});
