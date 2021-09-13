import Comment from '../models/comment.js';
import Vote from '../models/vote.js';

export const getPostComments = async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await Comment.find({ post: id })
      .populate('user', 'username')
      .populate('votes')
      .sort('-createdAt')
      .lean();

    if (req.user) {
      for (const c of comments) {
        const vote = c.votes.find(
          (v) => v.user.toString() === req.user._id.toString()
        );
        if (vote) {
          c.userVote = vote.value;
        }
      }
    }

    return res.json(comments);
  } catch (error) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
