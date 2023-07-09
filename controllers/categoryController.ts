import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');

const seeCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.productCategory.findMany({});

    res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

module.exports = { seeCategories };
