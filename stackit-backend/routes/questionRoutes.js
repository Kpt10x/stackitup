import express from 'express';
import Question from '../models/questionModel.js';
import Answer from '../models/answerModel.js';
import Tag from '../models/tagModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, tags } = req.body;

  if (!title || !description || !tags) {
    return res.status(400).json({ message: 'Please provide title, description, and tags' });
  }

  if (!Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({ message: 'Tags must be an array and cannot be empty' });
  }

  try {
    const tagIds = [];
    // Process tags: find existing or create new ones
    for (const tagName of tags) {
      const formattedTagName = tagName.trim().toLowerCase();
      if(formattedTagName){
        let tag = await Tag.findOne({ name: formattedTagName });

        if (!tag) {
          tag = await Tag.create({ name: formattedTagName });
        }

        // Optionally, you might want to increment a questionCount on the tag here or later
        // For now, just collect the IDs
        tagIds.push(tag._id);
      }
    }

    // Create the new question
    const question = await Question.create({
      title,
      description,
      author: req.user._id, // from 'protect' middleware
      tags: tagIds,
    });

    // Here you would typically increment the questionCount for each tag
    await Tag.updateMany(
        { _id: { $in: tagIds } },
        { $inc: { questionCount: 1 } }
    );


    // Populate author and tags for the response
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username')
      .populate('tags', 'name');

    res.status(201).json(populatedQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Server error while creating question', error: error.message });
  }
});

// @desc    Fetch all questions
// @route   GET /api/questions
// @access  Public
router.get('/', async (req, res) => {
  const pageSize = 10; // Number of questions per page
  const page = Number(req.query.page) || 1; // Current page number

  try {
    const count = await Question.countDocuments(); // Get total number of questions
    const questions = await Question.find({})
      .populate('author', 'username') // Populate author's username
      .populate('tags', 'name') // Populate tag names
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      questions,
      page,
      pages: Math.ceil(count / pageSize), // Total number of pages
      count
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error while fetching questions' });
  }
});

// @desc    Fetch a single question by ID
// @route   GET /api/questions/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username')
      .populate('tags', 'name')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username'
        },
        options: { sort: { isAccepted: -1, createdAt: -1 } } // Show accepted answer first
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching single question:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching question' });
  }
});

// @desc    Vote on a question (upvote/downvote)
// @route   POST /api/questions/:id/vote
// @access  Private
router.post('/:id/vote', protect, async (req, res) => {
  const { voteType } = req.body; // 'up' or 'down'
  const questionId = req.params.id;
  const userId = req.user._id;

  if (voteType !== 'up' && voteType !== 'down') {
    return res.status(400).json({ message: 'Invalid vote type.' });
  }

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const upvotes = question.upvotes.map(id => id.toString());
    const downvotes = question.downvotes.map(id => id.toString());
    const userIdStr = userId.toString();

    const hasUpvoted = upvotes.includes(userIdStr);
    const hasDownvoted = downvotes.includes(userIdStr);

    if (voteType === 'up') {
      if (hasUpvoted) {
        question.upvotes.pull(userId);
      } else {
        question.upvotes.push(userId);
        if (hasDownvoted) {
          question.downvotes.pull(userId);
        }
      }
    } else if (voteType === 'down') {
      if (hasDownvoted) {
        question.downvotes.pull(userId);
      } else {
        question.downvotes.push(userId);
        if (hasUpvoted) {
          question.upvotes.pull(userId);
        }
      }
    }

    await question.save();
    res.json({
        upvotes: question.upvotes.length,
        downvotes: question.downvotes.length,
        voteCount: question.voteCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error while voting on question.', error: error.message });
  }
});

export default router;
