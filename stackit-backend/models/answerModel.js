import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: [true, 'Answer body cannot be empty'],
    minlength: [10, 'Answer must be at least 10 characters long']
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for vote count
answerSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});


const Answer = mongoose.model('Answer', answerSchema);

export default Answer;
