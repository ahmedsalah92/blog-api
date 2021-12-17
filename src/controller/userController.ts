import { Request, Response, NextFunction } from 'express';
import { client } from '../configs/db';

const getUserById = async (id: number, res: Response) => {
  const user = await client.query(`SELECT * FROM users WHERE id= $1;`, [id]);
  console.log(user);
  if (user.rows.length === 0) {
    return res.status(404).json({
      message: 'User not found!',
    });
  }
  return user;
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(Number(req.params.id), res);

    await client.query('UPDATE users SET "isDeleted" = $1 WHERE id = $2', [true, req.params.id]);

    return res.status(200).json({
      message: 'User Deleted',
    });
  } catch (error) {
    console.log(error);
  }
};

const restore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(Number(req.params.id), res);
    await client.query('UPDATE users SET "isDeleted" = $1 WHERE id = $2', [false, req.params.id]);

    return res.status(200).json({
      message: 'User Restored',
    });
  } catch (error) {
    console.log(error);
  }
};

export default { deleteUser, restore };
