import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');

const getProducts = async (req: Request, res: Response) => {
  console.log(req.body);

  try {
    // Get required data from request body and modify it a bit.
    let {
      name,
      latitude: userlatitude,
      longitude: userlongitude,
      page,
      categoryId,
    } = req.body;
    name = `%${name.toLowerCase()}%`;

    // Pagination stuff here
    const itemPerPage = 10;
    page = page - 1;
    let skip = itemPerPage * page;

    // Getting the products from db.
    let products;
    if (categoryId !== '') {
      products =
        await prisma.$queryRaw`SELECT "Product".id AS productId, "ProductList".name AS productName, "Product".price AS productPrice, "Product".amount AS productAmount, "Pharmacy".name AS pharmacyName, "Pharmacy".email AS pharmacyEmail,
        (6371000 * Acos (Cos (Radians(${userlatitude})) * Cos(Radians("Pharmacy".latitude)) *
                          Cos(Radians("Pharmacy".longitude) - Radians(${userlongitude}))
                            + Sin (Radians(${userlatitude})) *
                              Sin(Radians(latitude)))
        ) AS distance_m
        FROM   "Product"
        INNER JOIN "Pharmacy" ON "pharmacySelling" = "Pharmacy".id 
        INNER JOIN "ProductList" ON "product" = "ProductList".id
        WHERE LOWER("ProductList".name) like ${name} AND "ProductList".category = ${categoryId}
        ORDER  BY distance_m
        LIMIT ${itemPerPage} OFFSET ${skip};`;
    } else {
      products =
        await prisma.$queryRaw`SELECT "Product".id AS productId, "ProductList".name AS productName, "Product".price AS productPrice, "Product".amount AS productAmount, "Pharmacy".name AS pharmacyName, "Pharmacy".email AS pharmacyEmail,
        (6371000 * Acos (Cos (Radians(${userlatitude})) * Cos(Radians("Pharmacy".latitude)) *
                          Cos(Radians("Pharmacy".longitude) - Radians(${userlongitude}))
                            + Sin (Radians(${userlatitude})) *
                              Sin(Radians(latitude)))
        ) AS distance_m
        FROM   "Product"
        INNER JOIN "Pharmacy" ON "pharmacySelling" = "Pharmacy".id 
        INNER JOIN "ProductList" ON "product" = "ProductList".id
        WHERE LOWER("ProductList".name) like ${name}
        ORDER  BY distance_m
        LIMIT ${itemPerPage} OFFSET ${skip};`;
    }

    // Send back a positive response.
    res.status(200).json(products);
  } catch (error) {
    res.status(401).json({ message: 'Something went wrong.', error });
  }
};

module.exports = { getProducts };

// Haversine formula
// const result = await prisma.$queryRaw`SELECT *,
//        (6371000 * Acos (Cos (Radians(${userlatitude})) * Cos(Radians(latitude)) *
//                          Cos(Radians(longitude) - Radians(${userlongitude}))
//                            + Sin (Radians(${userlatitude})) *
//                              Sin(Radians(latitude)))
//                ) AS distance_m
//        FROM   "Pharmacy"
//        HAVING distance_m < 100
//        ORDER  BY distance_m;`;

// const result2 = await prisma.$queryRaw`SELECT *,
//     (6371 * Acos (Cos (Radians(${userlatitude})) * Cos(Radians(latitude)) *
//                       Cos(Radians(longitude) - Radians(${userlongitude}))
//                         + Sin (Radians(${userlatitude})) *
//                           Sin(Radians(latitude)))
//     ) AS distance_km
//     FROM   "Pharmacy"
//     ORDER  BY distance_km;`;
