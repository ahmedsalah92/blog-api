import express from 'express';
import authController from '../controller/authController';
import userController from '../controller/userController';

const userRouter = express.Router();

userRouter.post('/register', authController.register);
userRouter.post('/login', authController.login);
userRouter.patch('/delete/:id', userController.deleteUser);
userRouter.patch('/restore/:id', userController.restore);

export { userRouter };
