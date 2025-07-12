import express from 'express';
import Notification from '../models/notificationModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'username');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
});

// @desc    Mark notifications as read
// @route   POST /api/notifications/read
// @access  Private
router.post('/read', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: 'Notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error marking notifications as read.' });
    }
});

export default router;
