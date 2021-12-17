import express from 'express';
import commentController from '../controller/commentController';
import authController from '../controller/authController';
const commentRouter = express.Router();

commentRouter.use(authController.protect);

commentRouter.post('/postId/:postId', commentController.createComment);

commentRouter.get('/postId/:postId/limit/:limit/page/:page', commentController.getPostComments);

commentRouter
  .route('/:id')
  .put(commentController.updateComment)
  .delete(commentController.deleteComment);

export { commentRouter };
