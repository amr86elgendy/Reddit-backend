import path from 'path';
import fs from 'fs';
import Sub from '../models/sub.js';
import multer from 'multer';
import { makeId } from '../utils/index.js';

export const createSub = async (req, res) => {
  const { name, title, description } = req.body;

  const user = req.user;

  try {
    let errors = {};
    if (name === '') errors.name = 'Name must not be empty';
    if (title === '') errors.title = 'Title must not be empty';

    const sub = await Sub.findOne({ name: name.toLowerCase() });

    if (sub) errors.name = 'Sub exists already';

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (err) {
    return res.status(400).json(err);
  }

  try {
    const sub = new Sub({ name, description, title, user: user.username });
    await sub.save();

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getSub = async (req, res) => {
  const { name } = req.params;

  try {
    const sub = await Sub.findOne({ name })
      .populate({
        path: 'posts',
        populate: { path: 'votes' },
      })
      .populate({
        path: 'posts',
        populate: 'sub',
      })
      .lean();

    if (req.user) {
      for (const p of sub.posts) {
        const vote = p.votes.find(
          (v) => v.user.toString() === req.user._id.toString()
        );
        if (vote) {
          p.userVote = vote.value;
        }
      }
    }

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ sub: 'Sub not found' });
  }
};

export const ownSub = async (req, res, next) => {
  const user = req.user;

  try {
    const sub = await Sub.findOne({ name: req.params.name });

    if (sub.user !== user.username) {
      return res.status(403).json({ error: 'You dont own this sub' });
    }

    req.sub = sub;
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const upload = multer({
  storage: multer.diskStorage({
    destination: 'upload/images',
    filename: (_, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname)); // e.g. jh34gh2v4y + .png
    },
  }),
  fileFilter: (_, file, callback) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      callback(null, true);
    } else {
      callback(new Error('Not an image'));
    }
  },
});

export const uploadSubImage = async (req, res) => {
  const sub = await Sub.findById(req.sub._id);
  try {
    const type = req.body.type;
    // console.log(req.file);

    if (type !== 'image' && type !== 'banner') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid type' });
    }

    let oldImageUrn = '';
    if (type === 'image') {
      oldImageUrn = sub.imageUrn ?? '';
      await Sub.findByIdAndUpdate(req.sub._id, {
        $set: {
          imageUrn: req.file.filename,
          imageUrl: `${process.env.APP_URL}/images/${req.file.filename}`,
        },
      });
    } else if (type === 'banner') {
      oldImageUrn = sub.bannerUrn ?? '';
      await Sub.findByIdAndUpdate(req.sub._id, {
        $set: {
          bannerUrn: req.file.filename,
          bannerUrl: `${process.env.APP_URL}/images/${req.file.filename}`,
        },
      });
    }

    if (oldImageUrn !== '') {
      fs.unlinkSync(`upload\\images\\${oldImageUrn}`);
    }

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const topSubs = async (req, res) => {
  try {
    const subs = await Sub.aggregate([
      { $addFields: { postsCount: { $size: '$posts' } } },
      { $sort: { postsCount: -1 } },
    ]).limit(5);

    return res.json(subs);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const searchSubs = async (req, res) => {
  try {
    const subs = await Sub.find({
      $text: { $search: req.params.name },
    }).select('name imageUrl title');
    
    return res.json(subs);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
