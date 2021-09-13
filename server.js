import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// import Routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/post.js';
import subRoutes from './routes/sub.js';
import commentRoutes from './routes/comment.js';
import voteRoutes from './routes/vote.js';
import userRoutes from './routes/user.js';

// Middlewares
import { trim } from './middlewares/index.js';

dotenv.config();
connectDb();

// init App
const app = express();

// middlewares
app.enabled('trust proxy')
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(trim);
app.use(cookieParser());
app.use(express.static('upload'))

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/subs', subRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
