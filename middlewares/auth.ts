import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const jwt = require('jsonwebtoken');
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');

// To reuse this, change the process.env for the secrete key, change the decoded.data.titleName and that is all.

const authSystemAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token and decode it.
    const accessToken: any = req
      .header('Authorization')
      ?.replace('Bearer ', '');
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_SYSTEM_ADMIN
    );

    // Decode the accessToken
    if (decoded.data.titleName !== 'systemAdmin') {
      throw new Error();
    }

    // Attack the user's data to the request object.
    req.user = { ...decoded.data };

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

const authPharmacyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token and decode it.
    const accessToken: any = req
      .header('Authorization')
      ?.replace('Bearer ', '');
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_PHARMACY_ADMIN
    );

    // Decode the accessToken
    if (decoded.data.titleName !== 'pharmacyAdmin') {
      throw new Error();
    }

    // Attack the user's data to the request object.
    req.user = { ...decoded.data };

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

const authCachier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token and decode it.
    const accessToken: any = req
      .header('Authorization')
      ?.replace('Bearer ', '');
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_CACHIER
    );

    // Decode the accessToken
    if (decoded.data.titleName !== 'cachier') {
      throw new Error();
    }

    // Attack the user's data to the request object.
    req.user = { ...decoded.data };

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

const authCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token and decode it.
    const accessToken: any = req
      .header('Authorization')
      ?.replace('Bearer ', '');
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_CUSTOMER
    );

    // Decode the accessToken
    if (decoded.data.titleName !== 'customer') {
      throw new Error();
    }

    // Attack the user's data to the request object.
    req.user = { ...decoded.data };

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

module.exports = {
  authSystemAdmin,
  authPharmacyAdmin,
  authCachier,
  authCustomer,
};
