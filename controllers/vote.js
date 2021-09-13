import User from '../models/user.js';
import Post from '../models/post.js';
import Comment from '../models/comment.js';
import Vote from '../models/vote.js';

export const voteOnPost = async (req, res) => {
  const { postId, value } = req.body;

  // Validate vote value
  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ value: 'Value must be -1, 0 or 1' });
  }

  try {
    const user = req.user;

    let post = await Post.findById(postId).populate('votes');

    let oldVote = post.votes.find(
      (vote) => vote.user.toString() === user._id.toString()
    );

    // if no vote and value = 0 return error
    if (!oldVote && value === 0) {
      return res.status(404).json({ error: 'Vote not found' });

      // If no vote create it
    } else if (!oldVote) {
      const newVote = await Vote.create({
        value,
        user,
        post: postId,
      });

      post.votes.push(newVote);
      await post.save();

      // If vote exists and value = 0 remove vote from DB
    } else if (value === 0) {
      for (let i = 0; i < post.votes.length; i++) {
        if (post.votes[i].user.toString() === user._id.toString()) {
          const id = post.votes[i]._id;
          post.votes.splice(i, 1);
          await Vote.findByIdAndRemove(id);
        }
      }

      await post.save();

      // If vote and value has changed, update vote
    } else if (oldVote.value !== value) {
      for (let v of post.votes) {
        if (v.user.toString() === user._id.toString()) {
          v.value = value;
          await Vote.findByIdAndUpdate(v._id, { $set: { value } });
        }
      }

      await post.save();
    }

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
// ################################################################################
export const voteOnComment = async (req, res) => {
  const { value, commentId } = req.body;

  // Validate vote value
  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ value: 'Value must be -1, 0 or 1' });
  }

  try {
    const user = req.user;

    let comment = await Comment.findById(commentId).populate('votes');

    let oldVote = comment.votes.find(
      (vote) => vote.user.toString() === user._id.toString()
    );

    // if no vote and value = 0 return error
    if (!oldVote && value === 0) {
      return res.status(404).json({ error: 'Vote not found' });

      // If no vote create it
    } else if (!oldVote) {
      
      const newVote = await Vote.create({
        value,
        user,
        comment,
      });
      comment.votes.push(newVote._id);
      await comment.save();
      // If vote exists and value = 0 remove vote from DB
    } else if (value === 0) {
      for (let i = 0; i < comment.votes.length; i++) {
        if (comment.votes[i].user.toString() === user._id.toString()) {
          const id = comment.votes[i]._id;
          comment.votes.splice(i, 1);
          await Vote.findByIdAndRemove(id)
        }
      }

      await comment.save();
      // If vote and value has changed, update vote
    } else if (oldVote.value !== value) {
      for (let v of comment.votes) {
        if (v.user.toString() === user._id.toString()) {
          v.value = value;
          await Vote.findByIdAndUpdate(v._id, { $set: { value } });
        }
      }
      
      await comment.save();
    }
    return res.json(comment);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
