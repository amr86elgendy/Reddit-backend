import User from '../models/user.js';
import Comment from '../models/comment.js';
import Post from '../models/post.js';

export const getUserSubmissions = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      'username createdAt'
    );

    const posts = await Post.find({ user: req.params.username })
      .populate('votes', 'user')
      .populate('sub', 'name')
      .lean();
 
    const comments = await Comment.find({ user })
      .populate('votes', 'user')
      .populate('user', 'username')
      .populate({
        path: 'post',
        populate: { path: 'sub', select: 'name' }
      })
      .lean();

    if (req.user) {
      for (const p of posts) {
        const vote = p.votes.find(
          (v) => v.user.toString() === req.user._id.toString()
        );
        if (vote) {
          p.userVote = vote.value;
        }
      }
      for (const c of comments) {
        const vote = c.votes.find(
          (v) => v.user.toString() === req.user._id.toString()
        );
        if (vote) {
          c.userVote = vote.value;
        }
      }
    }

    let submissions = [];
    posts.forEach((p) => submissions.push({ type: 'Post', ...p }));
    comments.forEach((c) => submissions.push({ type: 'Comment', ...c }));

    submissions.sort((a, b) => {
      if (b.createdAt > a.createdAt) return 1;
      if (b.createdAt < a.createdAt) return -1;
      return 0;
    });

    return res.json({ user, submissions });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
