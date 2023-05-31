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

const createCustomer = async (req: Request, res: Response) => {
  try {
    // Get all the customer's information
    let { name, email, password } = req.body;

    // Check if all fields are present
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide name, email and password' });
    }

    // Validate the email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid Email' });
    }

    // Check if customer email exists already
    const customer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });
    if (customer) {
      return res.status(400).json({ message: 'Email already used' });
    }

    // Hash the password
    password = await bcrypt.hash(password, 8);

    // Create a customer
    await prisma.customer.create({
      data: {
        name,
        email,
        password,
      },
    });

    // Send back response
    return res
      .status(201)
      .json({ message: 'Customer has been created successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const loginCustomer = async (req: Request, res: Response) => {
  try {
    // Get all the customer's information.
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
    const customer = await prisma.customer.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        titleName: true,
        password: true,
      },
    });
    if (!customer) {
      return res.status(400).json({ message: 'Unable to login' });
    }

    // Now compare the passwords.
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Unable to login' });
    }

    // Generate access token
    let dataToGenerateAuthToken: any = {
      ...customer,
      password: undefined,
    };
    const accessToken = await generateAccessToken(
      dataToGenerateAuthToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_CUSTOMER
    );

    // Generate refresh token and store it in database.
    const refreshToken = await generateRefreshToken(
      dataToGenerateAuthToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_CUSTOMER
    );
    await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        refreshToken,
      },
    });

    // Send back response.
    res.status(200).json({
      name: customer.name,
      email: customer.email,
      title: customer.titleName,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const logoutCustomer = async (req: Request, res: Response) => {
  try {
    // Delete the refresh token found in the database
    await prisma.customer.update({
      where: {
        id: req.user.id,
      },
      data: {
        refreshToken: null,
      },
    });

    // Send a positive response to the customer
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    // Get the refresh token from the Headers
    let refreshToken: any = req.header('Authorization')?.replace('Bearer ', '');

    // Decode the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_CUSTOMER
    );

    // Find the customer in the database using the id encoded in the token
    const customer = await prisma.customer.findFirst({
      where: {
        id: decoded.id,
        refreshToken,
      },
      select: {
        id: true,
        name: true,
        email: true,
        titleName: true,
      },
    });

    // Check if user was found
    if (!customer) {
      res.status(401).json({ message: 'Please authenticate.' });
      return;
    }

    // Generate a new access token
    const accessToken = await generateAccessToken(
      customer,
      process.env.JWT_ACCESS_TOKEN_SECRET_CUSTOMER
    );

    // Send the access token to the customer
    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.', error });
  }
};

const reserveProduct = async (req: Request, res: Response) => {
  try {
    console.log('Allowed');
    console.log(req.user);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const placeOrder = async (req: Request, res: Response) => {
  try {
    // Get the list of products from the request body. cart=[{productId:"1234", quantity:2}]
    let { cart } = req.body;

    // Check if the products array exist and if there is at least one product
    if (!cart || cart?.length < 1) {
      return res.status(400).json({
        message:
          'Please provide a cart to us and make sure that at least one product is inside it.',
      });
    }

    // Check if each object contains a productId and quantity minimum.
    const isValidData = cart.every(({ productId, quantity }: any) => {
      return productId && quantity;
    });
    if (!isValidData) {
      return res.status(400).json({
        message:
          'Please make sure that every product in the cart has at least a productId and a quantity.',
      });
    }

    // Calculate the total amount.
    let totalAmount = 0;
    await Promise.all(
      cart.map(async ({ productId, quantity }: any) => {
        // Get the product
        const product: any = await prisma.product.findUnique({
          where: { id: productId },
          select: {
            amount: true,
            price: true,
            productList: {
              select: {
                name: true,
              },
            },
          },
        });

        // Check if the amount is enough
        if (quantity > product?.amount) {
          // Not enough of this product
          // filter the array of card comming and remove this product
          // Since it is your problem if you give us wrong data, just follow the frontend
          // Now the order will use the cart info which is correct
          // return at the end the total
          cart = cart.filter((item: any) => {
            return item.productId !== productId && item.quantity !== quantity;
          });

          return;
        }

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

        totalAmount += product.price * quantity;
      })
    );

    // Do all the payment stuff here

    // Store that data in db, create a reciept and udpate product's amount.
    let orderList = await Promise.all(
      cart.map(async ({ productId, quantity }: any) => {
        const singleOrder = await prisma.order.create({
          data: {
            productId,
            quantity,
            customerId: req.user.id,
          },
          select: {
            id: true,
            quantity: true,
            date: true,
            orderedProduct: {
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
            customerOrdering: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });

        return singleOrder;
      })
    );

    // Send back a positive response.
    res
      .status(201)
      .json({ message: 'Order has been placed.', orderList, totalAmount });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

module.exports = {
  createCustomer,
  loginCustomer,
  reserveProduct,
  logoutCustomer,
  refreshToken,
  placeOrder,
};
