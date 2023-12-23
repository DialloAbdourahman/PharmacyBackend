import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
// const haversine = require('haversine');
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');

const getProducts = async (req: Request, res: Response) => {
  try {
    // Get relevant data from request query and modify it a bit.
    let name: string = String(req.query.name).toLowerCase();
    let page: number = Number(req.query.page);
    let userlatitude: number = Number(req.query.latitude);
    let userlongitude: number = Number(req.query.longitude);
    let categoryId: string = String(req.query.categoryId);

    // Pagination stuff here
    const itemPerPage = 10;
    page = page - 1;
    let skip = itemPerPage * page;

    // Construction the unsafe query.
    const query = `SELECT "Product".id AS productId, "ProductList".image AS productImage,"ProductList".name AS productName, "Product".price AS productPrice, "Product".amount AS productAmount, "Pharmacy".name AS pharmacyName, "Pharmacy".email AS pharmacyEmail ${
      userlatitude !== 0 && userlongitude !== 0
        ? `,
      (6371000 * Acos (Cos (Radians(${userlatitude})) * Cos(Radians("Pharmacy".latitude)) *
                          Cos(Radians("Pharmacy".longitude) - Radians(${userlongitude}))
                            + Sin (Radians(${userlatitude})) *
                              Sin(Radians("Pharmacy".latitude)))
      ) AS distance_m`
        : ''
    }
    FROM   "Product"
    INNER JOIN "Pharmacy" ON "pharmacySelling" = "Pharmacy".id
    INNER JOIN "ProductList" ON "product" = "ProductList".id
    WHERE "Product".amount > 0 ${
      name && `AND LOWER("ProductList".name) like '%${name}%'`
    } ${categoryId && `AND "ProductList".category = '${categoryId}'`}
    ${userlatitude !== 0 && userlongitude !== 0 ? `ORDER  BY distance_m` : ''}
    LIMIT ${itemPerPage} OFFSET ${skip};`;

    // Getting the products from db.
    const products: any = await prisma.$queryRawUnsafe(query);

    // Map the correct image url.
    const productsWithCorrectImageUrl = products.map((product: any) => {
      return {
        ...product,
        productimage: `http://localhost:4000/static/productImages/${product.productimage}`,
      };
    });

    // Count the number of pages
    let count = await prisma.productList.count();
    count = Math.ceil(count / itemPerPage);

    // Send back a positive response.
    res.status(200).json({ productsWithCorrectImageUrl, count });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const searchProduct = async (req: Request, res: Response) => {
  try {
    // Get the search criteria from request query.
    let name: string = String(req.query.name);

    // Get the products from db.
    const products = await prisma.productList.findMany({
      take: 5,
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Send back a positive response.
    res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

module.exports = { getProducts, searchProduct };
