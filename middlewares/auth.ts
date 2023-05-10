import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const jwt = require('jsonwebtoken');
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');

const authSystemAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token and decode it.
    const token: any = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET_SYSTEM_ADMIN);

    // Decode the token
    if (decoded.data.titleName !== 'system_admin') {
      throw new Error();
    }

    // Attack the user's data to the request object.
    req.user = { ...decoded.data, token };

    // Run the next funtions so that the next function can be executed.
    next();
  } catch (error: any) {
    if (
      error?.name === 'TokenExpiredError' &&
      error?.message === 'jwt expired'
    ) {
      res.status(401).json({ message: 'Token has expired.', error });
      return;
    }
    res.status(401).json({ message: 'Please authenticate.', error });
  }
};

module.exports = { authSystemAdmin };
