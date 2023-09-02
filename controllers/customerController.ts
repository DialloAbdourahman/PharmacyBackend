import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
import axios from 'axios';
import { uuid } from 'uuidv4';
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
    const accessToken = generateAccessToken(
      dataToGenerateAuthToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_CUSTOMER
    );

    // Generate refresh token and store it in database.
    const refreshToken = generateRefreshToken(
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

    // Creates Secure Cookie with refresh token
    res.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENVIRONMENT !== 'development',
      httpOnly: true,
    });

    // Send back response.
    res.status(200).json({
      name: customer.name,
      email: customer.email,
      title: customer.titleName,
      accessToken,
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
    // Get the refresh token from the Headers (cookie)
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.status(401).json({ message: 'No refresh token found.' });
    }
    const refreshToken = cookies.refreshToken;

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
    const accessToken = generateAccessToken(
      customer,
      process.env.JWT_ACCESS_TOKEN_SECRET_CUSTOMER
    );

    // Send the access token to the customer
    res.status(200).json({
      name: customer.name,
      email: customer.email,
      title: customer.titleName,
      accessToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.', error });
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
      cart.map(async ({ productId, quantity }: any, i: number) => {
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

        cart[i].price = product.price;
        totalAmount += product.price * quantity;
      })
    );

    // Do all the payment stuff here aka maybe generate payment link and send to the user.

    // Store that data in db, create a reciept and udpate product's amount.
    let orderList = await Promise.all(
      cart.map(async ({ productId, quantity, price }: any) => {
        const singleOrder = await prisma.order.create({
          data: {
            productId,
            quantity,
            price,
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

        return singleOrder;
      })
    );

    // Check if the data has been verified well
    if (orderList.length < 1) {
      return res
        .status(400)
        .json({ message: 'Bad sale, please enter all data well.' });
    }

    // Send back a positive response.
    res
      .status(201)
      .json({ message: 'Order has been placed.', orderList, totalAmount });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const updateAccount = async (req: Request, res: Response) => {
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

    // Update the customer's information.
    await prisma.customer.update({
      where: {
        id: req.user.id,
      },
      data: {
        ...req.body,
      },
    });

    // Send back a positive response
    res
      .status(200)
      .json({ message: 'Your credentials have been updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const seeOrders = async (req: Request, res: Response) => {
  try {
    // Get the orders from db.
    const orders = await prisma.order.findMany({
      where: {
        customerId: req.user.id,
      },
      select: {
        id: true,
        quantity: true,
        fulfilled: true,
        date: true,
        orderedProduct: {
          select: {
            id: true,
            price: true,
            productList: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Send back a positive response to the customer
    res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const momo = require('mtn-momo');
const { Collections, Disbursements } = momo.create({
  callbackHost: process.env.CALLBACK_HOST,
});
const collections = Collections({
  userSecret: process.env.USER_SECRET, // X-Reference-Id aka password to get access token aka api key
  userId: process.env.USER_ID, // Ocp-Apim-Subscription-Key aka username to get access token aka user id
  primaryKey: process.env.PRIMARY_KEY,
});
const pay = async (req: Request, res: Response) => {
  console.log('BEFORE TRANSACTION');

  try {
    const transactionId = await collections.requestToPay({
      amount: '50',
      currency: 'EUR',
      externalId: '123456',
      payer: {
        partyIdType: 'MSISDN',
        partyId: '256774290781',
      },
      payerMessage: 'testing',
      payeeNote: 'hello',
    });
    const transactionDetails = await collections.getTransaction(transactionId);

    console.log('Transaction ID: ', transactionId);
    console.log('Transaction Details: ', transactionDetails);
  } catch (error) {
    console.log('Error', error);
  }

  console.log('AFTER TRANSACTION');
};

const rawPay = async (req: Request, res: Response) => {
  try {
    // Generate a new access token using the subscription key (Ocp-Apim-Subscription-Key), userid (initial uuid used to create the user and in our case it is the username) and the user secret (the api key and in our case, the password)
    const {
      data: { access_token },
    } = await axios.post(
      'https://sandbox.momodeveloper.mtn.com/collection/token/',
      {},
      {
        headers: { 'Ocp-Apim-Subscription-Key': `${process.env.PRIMARY_KEY}` },
        auth: {
          username: `${process.env.USER_ID}`,
          password: `${process.env.USER_SECRET}`,
        },
      }
    );

    // Request to pay using the access token and the subscription key
    const transactionId = uuid();
    await axios.post(
      'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay',
      {
        amount: '5000',
        currency: 'EUR',
        externalId: '4457114',
        payer: {
          partyIdType: 'MSISDN',
          partyId: '677538950',
        },
        payerMessage: 'pay for product',
        payeeNote: 'This is a note',
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'X-Reference-Id': `${transactionId}`, // This represents the transaction id
          'Ocp-Apim-Subscription-Key': `${process.env.PRIMARY_KEY}`,
          'X-Target-Environment': 'sandbox',
          'Content-Type': 'application/json',
        },
      }
    );

    // Get the transaction information.
    const transaction = await axios.get(
      `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Ocp-Apim-Subscription-Key': `${process.env.PRIMARY_KEY}`,
          'X-Target-Environment': 'sandbox',
        },
      }
    );

    res.status(200).send('Success');
  } catch (error) {
    console.log(error);

    res.status(500).send(error);
  }
};

module.exports = {
  createCustomer,
  loginCustomer,
  logoutCustomer,
  refreshToken,
  placeOrder,
  updateAccount,
  seeOrders,
  pay,
  rawPay,
};
