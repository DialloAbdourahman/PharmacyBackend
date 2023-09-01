import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');

const seeCategories = async (req: Request, res: Response) => {
  try {
    // Get all the categories from db.
    const categories = await prisma.productCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // Map the correct url
    let categoriesWithImagesUrl = categories.map((category) => {
      if (category.imageUrl !== '') {
        return {
          ...category,
          imageUrl: `http://localhost:4000/static/categoryImages/${category.imageUrl}`,
        };
      }
      return category;
    });

    // Send a positive response with all the categories.
    res.status(200).json(categoriesWithImagesUrl);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

module.exports = { seeCategories };
