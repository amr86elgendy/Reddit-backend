import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Validate data
    let errors = {};
    const emailUser = await User.findOne({ email });
    const usernameUser = await User.findOne({ username });

    if (emailUser) errors.email = 'Email is already taken';
    if (usernameUser) errors.username = 'Username is already taken';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // Create the user
    const user = new User({ email, username, password });

    // errors = await validate(user);
    // if (errors.length > 0) return res.status(400).json({ errors });

    await user.save();

    // Return the user
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    let errors = {};

    if (username === '') errors.username = 'Username must not be empty';
    if (password === '') errors.password = 'Password must not be empty';
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ password: 'Password is incorrect' });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 3600000,
    });

    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Something went wrong' });
  }
};

export const me = (req, res) => {
  return res.json(req.user);
};

export const logout = (_, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 1,
  });

  return res.status(200).json({ success: true });
};
