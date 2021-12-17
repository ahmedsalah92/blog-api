import express from 'express';
import postController from '../controller/postController';
import authController from '../controller/authController';
const postRouter = express.Router();

postRouter.use(authController.protect);

postRouter.post('/', postController.createPost);

postRouter.get('/limit/:limit/page/:page', postController.getAllPosts);

postRouter
  .route('/:id')
  .get(postController.getPostById)
  .put(postController.updatePost)
  .delete(postController.deletePost);

export { postRouter };
