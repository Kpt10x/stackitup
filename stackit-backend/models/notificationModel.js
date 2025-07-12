import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { // The user who receives the notification
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: { // The user who triggered the notification
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: { // e.g., 'new_answer', 'mention'
    type: String,
    required: true,
    enum: ['new_answer', 'mention', 'accepted_answer'],
  },
  content: { // A brief description of the notification
    type: String,
    required: true,
  },
  link: { // A URL to the relevant content (e.g., the question page)
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
