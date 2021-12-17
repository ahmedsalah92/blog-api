import bcrypt from 'bcrypt';
import jwt, { VerifyOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const extractJWT = (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers.authorization?.split(' ')[0];
  if (token) {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
      (error: Error | null, decoded: object | undefined) => {
        if (error) {
          res.status(401).json({
            message: 'Unauthorized',
          });
        } else {
          res.locals.jwt = decoded;
          next();
        }
      }
    );
  } else {
    res.status(401).json({
      message: 'Unauthorized',
    });
  }
};

export default extractJWT;
