import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export const trim = (req, res, next) => {
  const exceptions = ['password'];

  Object.keys(req.body).forEach((key) => {
    if (!exceptions.includes(key) && typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });

  next();
};

export const auth = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) throw new Error('Unauthenticated');

    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Unauthenticated' });
  }
};

export const user = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return next();

    const { username } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ username });

    req.user = user;

    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Unauthenticated' });
  }
};
