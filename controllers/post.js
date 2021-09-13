import Post from '../models/post.js';
import Sub from '../models/sub.js';
import Comment from '../models/comment.js';
import slugify from 'slugify';

export const createPost = async (req, res) => {
  const { title, body, sub } = req.body;

  const user = req.user;

  if (title.trim() === '') {
    return res.status(400).json({ title: 'Title must not be empty' });
  }

  try {
    
    const post = await Post.create({
      title,
      slug: slugify(title),
      body,
      user: user.username,
      sub,
    });

    await Sub.findByIdAndUpdate(sub, { $push: { posts: post._id } });

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getPosts = async (req, res) => {
  const currentPage = Number(req.query.page) || 0;
  const postsPerPage = Number(req.query.count) || 8;

  try {
    const posts = await Post.find({})
      .populate('sub', 'name imageUrl')
      .populate('votes')
      .sort({ createdAt: 'DESC' })
      .select('-comments')
      .skip(currentPage * postsPerPage)
      .limit(postsPerPage)
      .lean();

    if (req.user) {
      for (const p of posts) {
        p.url = `/r/${p.sub.name}/${p._id}/${p.slug}`;
        const vote = p.votes.find(
          (v) => v.user.toString() === req.user._id.toString()
        );
        if (vote) {
          p.userVote = vote.value;
        }
      }
    }

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getPost = async (req, res) => {
  const { _id, slug } = req.params;

  try {
    const post = await Post.findOne({ _id, slug })
      .populate('sub', 'name imageUrl')
      .populate('votes')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username' },
      })
      .lean();

    post.url = `/r/${post.sub.name}/${post._id}/${post.slug}`;
    if (req.user) {      
      const voteOnPost = post.votes.find(
        (v) => v.user.toString() === req.user._id.toString()
      );
      if (voteOnPost) {
        post.userVote = voteOnPost.value;
      }
    }

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ error: 'Post not found' });
  }
};

export const commentOnPost = async (req, res) => {
  const { _id, slug } = req.params;
  const body = req.body.body;

  const comment = await Comment.create({ body, user: req.user._id, post: _id });

  try {
    const post = await Post.findOneAndUpdate(
      { _id, slug },
      {
        $push: {
          comments: comment._id,
        },
        $inc: { commentsCount: 1 },
      },
      { new: true }
    ).populate('comments.user', 'username');

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ error: 'Post not found' });
  }
};
