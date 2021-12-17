import { Request, Response, NextFunction } from 'express';
import { client } from '../configs/db';

const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await client.query(
      `SELECT * FROM posts LIMIT ${req.params.limit} OFFSET ${
        (Number(req.params.page) - 1) * Number(req.params.limit)
      }`
    );
    res.status(200).json({ count: results.rowCount, posts: results.rows });
  } catch (error) {
    console.log(error);
  }
};

const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = (await client.query('SELECT * FROM posts WHERE id = $1', [req.params.id])).rows[0];
    const comments = (await client.query('SELECT text FROM comments WHERE post_id = $1', [post.id]))
      .rows;

    return res.status(200).json({
      post,
      comments_count: comments.length,
      comments: comments,
    });
  } catch (error) {
    console.log(error);
  }
};

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  const { title, text } = req.body;
  const { currentUser } = res.locals;
  try {
    const post = {
      title,
      text,
      user_id: currentUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await client.query(
      `INSERT INTO posts ("title", "text", "user_id","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5);`,
      [post.title, post.text, post.user_id, post.createdAt, post.updatedAt]
    );

    return res.status(201).json({
      message: 'created post',
    });
  } catch (error) {
    console.log(error);
  }
};

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);

  const { title, text } = req.body;
  try {
    await client.query('UPDATE posts SET title = $1, text = $2, "updatedAt" =$3 WHERE id = $4', [
      title,
      text,
      new Date(),
      id,
    ]);

    res.status(200).send({
      message: `User modified with ID: ${id}`,
    });
  } catch (error) {
    console.log(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  const { currentUser } = res.locals;
  const post = await client.query(`SELECT * FROM posts WHERE id= $1;`, [id]);
  if (!post.rows[0]) {
    return res.status(404).json({
      message: 'This post does not exist!',
    });
  }
  const postCreatorId = post.rows[0].user_id;

  if (postCreatorId !== currentUser.id) {
    return res.status(401).json({
      message: 'Only post writer can delete it!',
    });
  }

  try {
    await client.query('DELETE FROM posts WHERE id = $1', [id]);
    res.status(204).send({
      message: `Post with ID: ${id} deleted`,
    });
  } catch (error) {
    console.log(error);
  }
};

export default { createPost, updatePost, deletePost, getAllPosts, getPostById };
