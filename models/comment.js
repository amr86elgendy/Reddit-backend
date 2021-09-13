import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
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
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vote' }],
    voteScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Fire a function before doc saved to db
commentSchema.pre('save', async function (next) {
  this.voteScore = this.votes.reduce((total, v) => total + v.value || 0, 0);
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
