import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');

const createSystemAdmin = async (req: Request, res: Response) => {
  console.log('creating a system admin');
};

module.exports = { createSystemAdmin };
