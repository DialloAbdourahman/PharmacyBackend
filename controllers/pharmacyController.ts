import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');

const seeAllPharmacies = async (req: Request, res: Response) => {
  try {
    // Get relevant data from request query
    let name: string = String(req.query.name);
    let page: number = Number(req.query.page);

    // Configure the pages. Here, the first page will be 1.
    const itemPerPage = 10;
    page = page - 1;

    // Get all the pharmacies
    const pharmacies = await prisma.pharmacy.findMany({
      take: itemPerPage,
      skip: itemPerPage * page,
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Send a positive response
    res.status(200).json(pharmacies);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const seePharmacy = async (req: Request, res: Response) => {
  try {
    // Get the id of the pharmacy
    const { id } = req.params;

    // Find the pharmacy by using the id
    const pharmacy = await prisma.pharmacy.findUnique({
      where: {
        id,
      },
    });

    // Send a positive response
    res.status(200).json(pharmacy);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

module.exports = { seeAllPharmacies, seePharmacy };
