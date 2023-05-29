import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/generateAuthToken');

const loginPharmacyAdmin = async (req: Request, res: Response) => {
  try {
    // Get all the pharmacy admin's information.
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
    const pharmacyAdmin = await prisma.pharmacyAdmin.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        titleName: true,
        password: true,
        associatedPharmacy: true,
      },
    });
    if (!pharmacyAdmin) {
      return res.status(400).json({ message: 'Unable to login' });
    }

    // Now compare the passwords.
    const isMatch = await bcrypt.compare(password, pharmacyAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Unable to login' });
    }

    // Generate access token
    let dataToGenerateAuthToken: any = {
      ...pharmacyAdmin,
      password: undefined,
    };
    const accessToken = await generateAccessToken(
      dataToGenerateAuthToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_PHARMACY_ADMIN
    );

    // Generate refresh token and store it in database.
    const refreshToken = await generateRefreshToken(
      dataToGenerateAuthToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_PHARMACY_ADMIN
    );
    await prisma.pharmacyAdmin.update({
      where: {
        id: pharmacyAdmin.id,
      },
      data: {
        refreshToken,
      },
    });

    // Send back response.
    res.status(200).json({
      name: pharmacyAdmin.name,
      email: pharmacyAdmin.email,
      title: pharmacyAdmin.titleName,
      accessToken,
      refreshToken,
    });
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
      process.env.JWT_REFRESH_TOKEN_SECRET_PHARMACY_ADMIN
    );

    // Find the pharmacy admin in the database using the id encoded in the token
    const pharmacyAdmin = await prisma.pharmacyAdmin.findFirst({
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
    if (!pharmacyAdmin) {
      res.status(401).json({ message: 'Please authenticate.' });
      return;
    }

    // Generate a new access token
    const accessToken = await generateAccessToken(
      pharmacyAdmin,
      process.env.JWT_ACCESS_TOKEN_SECRET_PHARMACY_ADMIN
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
    await prisma.pharmacyAdmin.update({
      where: {
        id: req.user.id,
      },
      data: {
        refreshToken: null,
      },
    });

    // Send a positive response to the system admin
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const updateInformation = async (req: Request, res: Response) => {
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

    // Update the pharmacy admin's information.
    await prisma.pharmacyAdmin.update({
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

const createPharmacyAdmin = async (req: Request, res: Response) => {
  try {
    // Limit the amount of pharmacy admins created.
    const pharmacyAdmins = await prisma.pharmacyAdmin.count();
    if (pharmacyAdmins >= 5) {
      return res.status(400).json({
        message: 'Maximum amount of pharmacy admins has been created.',
      });
    }

    // Get all the pharmacy admin's information
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

    // Check if pharmacy admin email exists already
    const pharmacyAdmin = await prisma.pharmacyAdmin.findUnique({
      where: {
        email,
      },
    });
    if (pharmacyAdmin) {
      return res.status(400).json({ message: 'Email already used' });
    }

    // Check how many pharmacy admins exists already.

    // Hash the password
    password = await bcrypt.hash(password, 8);

    // Create a pharmacy admin
    await prisma.pharmacyAdmin.create({
      data: {
        name,
        email,
        password,
        creator: req.user.id,
        associatedPharmacy: req.user.associatedPharmacy,
      },
    });

    // Send back response
    return res
      .status(201)
      .json({ message: 'Pharmacy admin has been created successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const createCachier = async (req: Request, res: Response) => {
  try {
    // Limit the amount of cachiers created.
    const cachiers = await prisma.cachier.count();
    if (cachiers >= 5) {
      return res.status(400).json({
        message: 'Maximum amount of cachiers has been created.',
      });
    }

    // Get all the cachier's information
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

    // Check if cachier email exists already
    const cachier = await prisma.cachier.findUnique({
      where: {
        email,
      },
    });
    if (cachier) {
      return res.status(400).json({ message: 'Email already used' });
    }

    // Hash the password
    password = await bcrypt.hash(password, 8);

    // Create a pharmacy manager
    await prisma.cachier.create({
      data: {
        name,
        email,
        password,
        creator: req.user.id,
        associatedPharmacy: req.user.associatedPharmacy,
      },
    });

    // Send back response
    return res
      .status(201)
      .json({ message: 'Cachier has been created successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const deleteCachier = async (req: Request, res: Response) => {
  try {
    // Get the id of the cachier
    const { id } = req.params;

    // Delete the cachier
    await prisma.cachier.delete({
      where: {
        id,
      },
    });

    // Send back a positive response
    return res.status(200).json({ message: 'Cachier deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const seeAllPharmacyAdmins = async (req: Request, res: Response) => {
  try {
    // Get all the pharmacy admins
    const pharmacyAdmins = await prisma.pharmacyAdmin.findMany({
      select: {
        name: true,
        email: true,
        titleName: true,
        pharmacy: {
          select: {
            name: true,
          },
        },
        pharmacyAdminCreator: {
          select: {
            name: true,
          },
        },
      },
    });

    // Send a positive response
    res.status(200).json(pharmacyAdmins);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const seeAllCachiers = async (req: Request, res: Response) => {
  try {
    // Get all the cachiers.
    const cachiers = await prisma.cachier.findMany({});

    // Send a positive response
    res.status(200).json(cachiers);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const seeCachier = async (req: Request, res: Response) => {
  try {
    // Get the id of the cachier from the request params
    const { id } = req.params;

    // Get the cachier
    const cachier = await prisma.cachier.findUnique({ where: { id } });

    // Send a positive response
    res.status(200).json(cachier);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const createProduct = async (req: Request, res: Response) => {
  try {
    // Get all required data
    const { productId, price, amount } = req.body;

    // Check if product exists already
    const productExists = await prisma.product.findFirst({
      where: {
        product: productId,
        pharmacySelling: req.user.associatedPharmacy,
      },
    });
    if (productExists) {
      return res.status(400).json({ message: 'Product exists already.' });
    }

    // Check if all the required data is entered.
    if (!productId || !price || !amount) {
      return res
        .status(400)
        .json({ message: 'Please enter all the required data.' });
    }

    // Create the product
    await prisma.product.create({
      data: {
        product: productId,
        price,
        amount,
        pharmacySelling: req.user.associatedPharmacy,
      },
    });

    return res.status(200).json({ message: 'Product created successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

module.exports = {
  loginPharmacyAdmin,
  refreshToken,
  logout,
  updateInformation,
  createPharmacyAdmin,
  createCachier,
  deleteCachier,
  seeAllPharmacyAdmins,
  seeAllCachiers,
  seeCachier,
  createProduct,
};
