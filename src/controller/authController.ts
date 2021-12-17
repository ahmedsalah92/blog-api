import bcrypt from 'bcrypt';
import { client } from '../configs/db';
import * as jwt from 'jsonwebtoken';

import { Request, Response, NextFunction } from 'express';

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, birth_date, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await client.query(`SELECT * FROM users WHERE email= $1;`, [email]); //Checking if user already exists
    const arr = user.rows;
    if (arr.length != 0) {
      return res.status(400).json({
        error: 'Email already there, No need to register again.',
      });
    } else {
      const user = {
        name,
        email,
        birth_date,
        password: hashedPassword,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      //Inserting data into the database

      client.query(
        `INSERT INTO users ("name", "email", "birth_date", "password", "isDeleted","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7);`,
        [
          user.name,
          user.email,
          user.birth_date,
          user.password,
          user.isDeleted,
          user.createdAt,
          user.updatedAt,
        ],
        async (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              message: 'Database error',
            });
          } else {
            const createdUser = (
              await client.query(`SELECT * FROM users WHERE email= $1;`, [email])
            ).rows[0];
            createSendToken(createdUser, 201, res);
          }
        }
      );
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: 'Database error while registring user!',
    });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [email]);
    const user = data.rows[0];

    if (user.length === 0) {
      res.status(400).json({
        message: 'User is not registered, Sign Up first',
      });
    }

    if (!(await isCorrectPassword(password, user.password))) {
      return res.status(401).json({
        message: 'Incorrect username or password',
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: 'Database error occurred while signing in!', //Database connection error
    });
  }
};

const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) check token exists
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    // 2) verify token
    let decoded: any;
    jwt.verify(token, process.env.TOKEN_SECRET as string, (error: any, data: any) => {
      if (error) {
        return;
      }
      decoded = data;
    });

    // 3) check if user still exists
    const currentUser = await client.query(`SELECT * FROM users WHERE email= $1;`, [decoded.email]); //Checking if user already exists
    if (!currentUser) {
      return res.status(404).json({
        message: 'User logged out or deleted',
      });
    }

    // 4) grant access
    res.locals.currentUser = currentUser.rows[0];

    next();
  } catch (error) {
    console.log(error);
  }
};
const generateToken = (email: string) => {
  return jwt.sign({ email }, process.env.TOKEN_SECRET as string, {
    expiresIn: process.env.TOKEN_EXPIRES_IN,
  });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user.email);

  const cookieOptions = {
    expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const isCorrectPassword = async function (
  candidatePassword: string | Buffer,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default { register, login, protect };
