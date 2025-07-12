import express from 'express';
import Answer from '../models/answerModel.js';
import Question from '../models/questionModel.js';
import Notification from '../models/notificationModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new answer
// @route   POST /api/answers
// @access  Private
router.post('/', protect, async (req, res) => {
  const { body, questionId } = req.body;

  if (!body || !questionId) {
    return res.status(400).json({ message: 'Answer body and questionId are required.' });
  }

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const answer = await Answer.create({
      question: questionId,
      author: req.user._id,
      body,
    });

    question.answers.push(answer._id);
    await question.save();

    const populatedAnswer = await Answer.findById(answer._id).populate('author', 'username');

    // --- Notification Logic ---
    // Don't notify if user answers their own question
    if (question.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: question.author,
        sender: req.user._id,
        type: 'new_answer',
        content: `${req.user.username} answered your question: "${question.title}"`,
        link: `/questions/${questionId}`,
      });

      const recipientSocket = req.getUser(question.author.toString());
      if (recipientSocket) {
        req.io.to(recipientSocket.socketId).emit('getNotification', {
          senderName: req.user.username,
          type: 'new_answer',
          content: notification.content,
          link: notification.link,
          createdAt: notification.createdAt,
        });
      }
    }
    // --- End Notification Logic ---

    res.status(201).json(populatedAnswer);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating answer.', error: error.message });
  }
});


// @desc    Vote on an answer (upvote/downvote)
// @route   POST /api/answers/:id/vote
// @access  Private
router.post('/:id/vote', protect, async (req, res) => {
  const { voteType } = req.body; // 'up' or 'down'
  const answerId = req.params.id;
  const userId = req.user._id;

  if (voteType !== 'up' && voteType !== 'down') {
    return res.status(400).json({ message: 'Invalid vote type.' });
  }

  try {
    const answer = await Answer.findById(answerId);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found.' });
    }

    // Convert Mongoose arrays of ObjectIds to arrays of strings for comparison
    const upvotes = answer.upvotes.map(id => id.toString());
    const downvotes = answer.downvotes.map(id => id.toString());
    const userIdStr = userId.toString();

    const hasUpvoted = upvotes.includes(userIdStr);
    const hasDownvoted = downvotes.includes(userIdStr);

    if (voteType === 'up') {
      if (hasUpvoted) {
        // User has already upvoted, so remove the upvote (toggle)
        answer.upvotes.pull(userId);
      } else {
        // New upvote
        answer.upvotes.push(userId);
        // If user had previously downvoted, remove the downvote
        if (hasDownvoted) {
          answer.downvotes.pull(userId);
        }
      }
    } else if (voteType === 'down') {
      if (hasDownvoted) {
        // User has already downvoted, so remove the downvote (toggle)
        answer.downvotes.pull(userId);
      } else {
        // New downvote
        answer.downvotes.push(userId);
        // If user had previously upvoted, remove the upvote
        if (hasUpvoted) {
          answer.upvotes.pull(userId);
        }
      }
    }

    await answer.save();
    res.json({
        upvotes: answer.upvotes.length,
        downvotes: answer.downvotes.length,
        voteCount: answer.voteCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error while voting.', error: error.message });
  }
});


// @desc    Accept an answer for a question
// @route   POST /api/answers/:id/accept
// @access  Private (only question author)
router.post('/:id/accept', protect, async (req, res) => {
    const answerId = req.params.id;
    const userId = req.user._id;

    try {
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found.' });
        }

        const question = await Question.findById(answer.question);
        if (!question) {
            return res.status(404).json({ message: 'Associated question not found.' });
        }

        // Check if the user accepting is the author of the question
        if (question.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to accept an answer for this question.' });
        }

        // Check if another answer is already accepted
        if (question.acceptedAnswer && question.acceptedAnswer.toString() !== answerId.toString()) {
            // Un-accept the old answer
            await Answer.findByIdAndUpdate(question.acceptedAnswer, { isAccepted: false });
        }

        // Toggle the acceptance status of the current answer
        answer.isAccepted = !answer.isAccepted;

        if (answer.isAccepted) {
            question.acceptedAnswer = answerId;
        } else {
            question.acceptedAnswer = null;
        }

        await answer.save();
        await question.save();

        res.json({ message: `Answer ${answer.isAccepted ? 'accepted' : 'unaccepted'} successfully.`, answer });

    } catch (error) {
        res.status(500).json({ message: 'Server error while accepting answer.', error: error.message });
    }
});

export default router;
