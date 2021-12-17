import { Request, Response, NextFunction } from 'express';
import { client } from '../configs/db';

const getPostComments = (req: Request, res: Response, next: NextFunction) => {
  client.query(
    `SELECT * FROM comments WHERE post_id = $1 LIMIT ${req.params.limit} OFFSET ${
      (Number(req.params.page) - 1) * Number(req.params.limit)
    }`,
    [req.params.postId],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json({ count: results.rows.length, comments: results.rows });
    }
  );
};

const createComment = (req: Request, res: Response, next: NextFunction) => {
  const { text } = req.body;
  const { currentUser } = res.locals;

  const comment = {
    text,
    post_id: req.params.postId,
    user_id: currentUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  client.query(
    `INSERT INTO comments ( "text", "post_id","user_id","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5);`,
    [comment.text, comment.post_id, comment.user_id, comment.createdAt, comment.updatedAt],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: 'Database error',
        });
      } else {
        res.status(201).json({
          message: 'created comment',
        });
      }
    }
  );
};

const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);

  const { text } = req.body;
  const { currentUser } = res.locals;
  const comment = await client.query(`SELECT * FROM comments WHERE id= $1;`, [id]);
  const commentCreatorId = comment.rows[0].user_id;

  if (commentCreatorId !== currentUser.id) {
    return res.status(401).json({
      message: 'Only post writer can edit it!',
    });
  }

  client.query('UPDATE comments SET text = $1 WHERE id = $2', [text, id], (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Database error',
      });
    }

    res.status(200).send({
      message: `Comment Modified`,
    });
  });
};

const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  const { currentUser } = res.locals;
  const comment = await client.query(`SELECT * FROM comments WHERE id= $1;`, [id]);
  const commentsCreatorId = comment.rows[0].user_id;

  if (commentsCreatorId !== currentUser.id) {
    return res.status(401).json({
      message: 'Only post writer can delete it!',
    });
  }

  client.query('DELETE FROM comments WHERE id = $1', [id], (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Database error',
      });
    }

    res.status(204).send({
      message: `Comment Deleted`,
    });
  });
};

export default { createComment, updateComment, deleteComment, getPostComments };
