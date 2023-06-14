import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/generateAuthToken');

const loginCachier = async (req: Request, res: Response) => {
  try {
    // Get all the cachier's information.
    let { email, password } = req.body;

    // Check if all fields are present.
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password' });
    }

    // Validate the email.
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid Email' });
    }

    // Check if the email matches.
    const cachier = await prisma.cachier.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        titleName: true,
        associatedPharmacy: true,
        password: true,
      },
    });
    if (!cachier) {
      return res.status(400).json({ message: 'Unable to login' });
    }

    // Now compare the passwords.
    const isMatch = await bcrypt.compare(password, cachier.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Unable to login' });
    }

    // Generate access token
    let dataToGenerateAuthToken: any = { ...cachier, password: undefined };
    const accessToken = await generateAccessToken(
      dataToGenerateAuthToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_CACHIER
    );

    // Generate refresh token and store it in database.
    const refreshToken = await generateRefreshToken(
      dataToGenerateAuthToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_CACHIER
    );
    await prisma.cachier.update({
      where: {
        id: cachier.id,
      },
      data: {
        refreshToken,
      },
    });

    // Creates Secure Cookie with refresh token
    res.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENVIRONMENT !== 'development',
      httpOnly: true,
    });

    // Send back response.
    res.status(200).json({
      name: cachier.name,
      email: cachier.email,
      title: cachier.titleName,
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    // Get the refresh token from the Headers (cookie)
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.status(401).json({ message: 'No refresh token found.' });
    }
    const refreshToken = cookies.refreshToken;

    // Decode the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_CACHIER
    );

    // Find the cachier in the database using the id encoded in the token
    const cachier = await prisma.cachier.findFirst({
      where: {
        id: decoded.id,
        refreshToken,
      },
      select: {
        id: true,
        name: true,
        email: true,
        titleName: true,
        associatedPharmacy: true,
      },
    });

    // Check if user was found
    if (!cachier) {
      res.status(401).json({ message: 'Please authenticate.' });
      return;
    }

    // Generate a new access token
    const accessToken = await generateAccessToken(
      cachier,
      process.env.JWT_ACCESS_TOKEN_SECRET_CACHIER
    );

    // Send the access token to the system admin
    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.', error });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    // Delete the refresh token found in the database
    await prisma.cachier.update({
      where: {
        id: req.user.id,
      },
      data: {
        refreshToken: null,
      },
    });

    // Send a positive response to the cachier
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const updateCredentiatls = async (req: Request, res: Response) => {
  try {
    // Get the enteries and create a valid enteries array
    const enteries = Object.keys(req.body);

    if (enteries.length < 1) {
      return res.status(400).json({ message: 'Please provide data to us.' });
    }

    const allowedEntery = ['name', 'email', 'password'];

    // Check if the enteries are valid
    const isValidOperation = enteries.every((entery) => {
      return allowedEntery.includes(entery);
    });

    // Send negative response if the enteries are not allowed.
    if (!isValidOperation) {
      res.status(400).send({
        message: 'You are trying to update data you are not allowed to',
      });
      return;
    }

    // Check if the password should be updated and then encrypt it.
    const passwordUpdate = enteries.find((entery) => entery === 'password');
    if (passwordUpdate) {
      req.body.password = await bcrypt.hash(req.body.password, 8);
    }

    // Update the cachier's information.
    await prisma.cachier.update({
      where: {
        id: req.user.id,
      },
      data: {
        ...req.body,
      },
    });

    // Send back a positive response
    res
      .status(201)
      .json({ message: 'Your credentials have been updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const deleteAccount = async (req: Request, res: Response) => {
  try {
    // Delete the cachier
    await prisma.cachier.delete({ where: { id: req.user.id } });

    // Send back a positive response
    res.status(200).json({ message: 'Account has been deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const sellProducts = async (req: Request, res: Response) => {
  try {
    // Get the list of products from the request body.
    let { products } = req.body;

    // Check if the products array exist and if there is at least one product
    if (!products || products?.length < 1) {
      return res.status(400).json({
        message:
          'Please provide us a list of products make sure that at least one product is inside it.',
      });
    }

    // Check if each object contains a productId and quantity minimum.
    const isValidData = products.every(({ productId, quantity }: any) => {
      return productId && quantity;
    });
    if (!isValidData) {
      return res.status(400).json({
        message:
          'Please make sure that every product in the products list has at least a productId and a quantity.',
      });
    }

    // Calculate the total amount.
    let totalAmount = 0;
    await Promise.all(
      products.map(async ({ productId, quantity }: any) => {
        // Get the product
        const product: any = await prisma.product.findUnique({
          where: { id: productId },
          select: {
            amount: true,
            price: true,
          },
        });

        // Check if the amount is enough
        if (quantity > product?.amount) {
          products = products.filter((item: any) => {
            return item.productId !== productId && item.quantity !== quantity;
          });

          return;
        }

        totalAmount += product.price * quantity;
      })
    );

    // Store that data in db, create a reciept and udpate product's amount.
    let saleList = await Promise.all(
      products.map(async ({ productId, quantity }: any) => {
        const singleSale = await prisma.sale.create({
          data: {
            productId,
            quantity,
            cachierId: req.user.id,
          },
          select: {
            id: true,
            quantity: true,
            date: true,
            soldProduct: {
              select: {
                price: true,
                pharmacy: {
                  select: {
                    name: true,
                  },
                },
                productList: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            cachierSelling: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });

        // Update the product's quantity.
        await prisma.product.update({
          where: {
            id: productId,
          },
          data: {
            amount: {
              decrement: quantity,
            },
          },
        });

        return singleSale;
      })
    );

    // Send back a positive response.
    res.status(201).json({ message: 'Sale completed.', saleList, totalAmount });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

module.exports = {
  loginCachier,
  refreshToken,
  logout,
  updateCredentiatls,
  deleteAccount,
  sellProducts,
};
