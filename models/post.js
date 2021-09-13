import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    user: String,
    sub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sub',
    },
    url: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    commentsCount: {
      type: Number,
      default: 0,
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
postSchema.pre('save', async function (next) {
  this.voteScore = this.votes.reduce((total, v) => total + v.value || 0, 0);
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;
