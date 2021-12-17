import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { userRouter } from './routes/userRouter';
import { postRouter } from './routes/postRouter';
import { commentRouter } from './routes/commentRouter';

const app = express(); //Initialized express

app.use(express.json());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).send('Engine Started, Ready to take off!');
});

app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter);
app.use('/api/v1/comment', commentRouter);

export { app };
