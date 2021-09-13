import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  },
  { timestamps: true }
);

const Vote = mongoose.model('Vote', voteSchema);

export default Vote 
