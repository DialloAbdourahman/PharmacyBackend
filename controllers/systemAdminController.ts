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

const createSystemAdmin = async (req: Request, res: Response) => {
  try {
    // Limit the amount of system admins created.
    const systemAdmins = await prisma.systemAdmin.count();
    if (systemAdmins >= 5) {
      return res
        .status(400)
        .json({ message: 'Maximum amount of system admins has been created.' });
    }

    // Get all the system admin's information
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

    // Check if system admin email exists already
    const systemAdminExists = await prisma.systemAdmin.findUnique({
      where: {
        email,
      },
    });
    if (systemAdminExists) {
      return res.status(400).json({ message: 'Email already used' });
    }

    // Check the number of system admins available already.

    // Hash the password
    password = await bcrypt.hash(password, 8);

    // Create a system admin
    await prisma.systemAdmin.create({
      data: {
        name,
        email,
        password,
        creator: req.user.id,
      },
    });

    // Send back response
    return res
      .status(201)
      .json({ message: 'System admin has been created successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const loginSystemAdmin = async (req: Request, res: Response) => {
  try {
    // Get all the system admin's information.
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
    const systemAdmin = await prisma.systemAdmin.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        titleName: true,
        password: true,
        creator: true,
      },
    });
    if (!systemAdmin) {
      return res.status(400).json({ message: 'Unable to login' });
    }

    // Now compare the passwords.
    const isMatch = await bcrypt.compare(password, systemAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Unable to login' });
    }

    // Generate access token
    let dataToGenerateAuthToken: any = { ...systemAdmin, password: undefined };
    const accessToken = await generateAccessToken(
      dataToGenerateAuthToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_SYSTEM_ADMIN
    );

    // Generate refresh token and store it in database.
    const refreshToken = await generateRefreshToken(
      dataToGenerateAuthToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_SYSTEM_ADMIN
    );
    await prisma.systemAdmin.update({
      where: {
        id: systemAdmin.id,
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
      name: systemAdmin.name,
      email: systemAdmin.email,
      title: systemAdmin.titleName,
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    // Delete the refresh token found in the database
    await prisma.systemAdmin.update({
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
      process.env.JWT_REFRESH_TOKEN_SECRET_SYSTEM_ADMIN
    );

    // Find the system admin in the database using the id encoded in the token
    const systemAdmin = await prisma.systemAdmin.findFirst({
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
    if (!systemAdmin) {
      res.status(401).json({ message: 'Please authenticate.' });
      return;
    }

    // Generate a new access token
    const accessToken = await generateAccessToken(
      systemAdmin,
      process.env.JWT_ACCESS_TOKEN_SECRET_SYSTEM_ADMIN
    );

    // Send the access token to the system admin
    res.status(200).json({
      name: systemAdmin.name,
      email: systemAdmin.email,
      title: systemAdmin.titleName,
      accessToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.', error });
  }
};

const updateSystemAdmin = async (req: Request, res: Response) => {
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

    // Update the system admin's information.
    await prisma.systemAdmin.update({
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

const allSystemAdmins = async (req: Request, res: Response) => {
  try {
    // Get all the system admins
    const systemAdmins = await prisma.systemAdmin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        titleName: true,
        creator: true,
        pharmaciesCreated: true,
        systemAdminsCreated: {
          select: {
            id: true,
            name: true,
            email: true,
            titleName: true,
            creator: true,
          },
        },
      },
    });

    // Send a positive response
    res.status(200).json(systemAdmins);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const createPharmacy = async (req: Request, res: Response) => {
  try {
    // Get all required data from request body.
    let {
      pharmacyName,
      pharmacyEmail,
      pharmacyPhoneNumber,
      pharmacyAddress,
      pharmacyHourly,
      pharmacyAdminName,
      pharmacyAdminEmail,
      pharmacyAdminPassword,
      pharmacyAllNight,
      pharmacyLatitude,
      pharmacyLongitude,
    } = req.body;

    // Check if all fields are present
    if (
      !pharmacyName ||
      !pharmacyEmail ||
      !pharmacyPhoneNumber ||
      !pharmacyAddress ||
      !pharmacyHourly ||
      !pharmacyAdminName ||
      !pharmacyAdminEmail ||
      !pharmacyAdminPassword ||
      !pharmacyAllNight ||
      !pharmacyLatitude ||
      !pharmacyLongitude
    ) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Validate both emails
    if (
      !validator.isEmail(pharmacyEmail) ||
      !validator.isEmail(pharmacyAdminEmail)
    ) {
      return res.status(400).json({ message: 'Invalid Email' });
    }

    // Check if there is a pharmacy with this credentials exists already
    const foundPharmacy = await prisma.pharmacy.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: pharmacyName,
            },
          },
          {
            email: {
              equals: pharmacyEmail,
            },
          },
          {
            phoneNumber: {
              equals: pharmacyPhoneNumber,
            },
          },
        ],
      },
    });
    if (foundPharmacy) {
      return res
        .status(400)
        .json({ message: 'Credentials exists already for another pharmacy' });
    }

    // Check if there is a pharmacyAdmin with this email
    const pharmacyAdmin = await prisma.pharmacyAdmin.findUnique({
      where: {
        email: pharmacyAdminEmail,
      },
    });
    if (pharmacyAdmin) {
      return res
        .status(400)
        .json({ message: 'Email already used for another pharmacy admin' });
    }

    // Hash the password of the pharmacy admin
    pharmacyAdminPassword = await bcrypt.hash(pharmacyAdminPassword, 8);

    // Create the pharmacy with it's pharmacy admin
    await prisma.pharmacy.create({
      data: {
        name: pharmacyName,
        email: pharmacyEmail,
        phoneNumber: pharmacyPhoneNumber,
        address: pharmacyAddress,
        hourly: pharmacyHourly,
        allNight: pharmacyAllNight,
        creator: req.user.id,
        latitude: pharmacyLatitude,
        longitude: pharmacyLongitude,
        pharmacyAdmin: {
          create: {
            name: pharmacyAdminName,
            email: pharmacyAdminEmail,
            password: pharmacyAdminPassword,
          },
        },
      },
    });

    // Send back positive response
    return res.status(201).json({
      message: 'Pharmacy with its pharmacy admin has been created successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const deletePharmacy = async (req: Request, res: Response) => {
  try {
    // Get the id of the pharmacy to be deleted.
    const { id } = req.params;

    // Delete the pharmacy
    await prisma.pharmacy.delete({
      where: { id },
    });

    // Send back a positive response
    return res
      .status(200)
      .json({ message: 'Pharmacy has been deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const updatePharmacy = async (req: Request, res: Response) => {
  try {
    // Get the id of the pharmacy to be updated.
    const { id } = req.params;

    // Get the enteries and create a valid enteries array
    const enteries = Object.keys(req.body);

    if (enteries.length < 1) {
      return res.status(400).json({ message: 'Please provide data to us.' });
    }

    const allowedEntery = [
      'name',
      'email',
      'phoneNumber',
      'address',
      'hourly',
      'allNight',
    ];

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

    // Update the pharmacy's information.
    const pharmacy = await prisma.pharmacy.update({
      where: {
        id,
      },
      data: {
        ...req.body,
      },
    });

    // Send back a positive response
    res.status(201).json({
      message: "Phamacy's credentials have been updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const createProduct = async (req: Request, res: Response) => {
  try {
    // Get all the required data from the request body
    const { name, description, normalPrice, category } = req.body;

    // Check of the field have been entered
    if (!name || !description || !normalPrice) {
      return res.status(400).json({ message: 'Please enter all the fields.' });
    }

    // Check if there is a product with the same name
    const productExists = await prisma.productList.findUnique({
      where: {
        name,
      },
    });
    if (productExists) {
      return res.status(400).json({ message: 'Product exists already.' });
    }

    // Creating the product
    const product = await prisma.productList.create({
      data: {
        name,
        description,
        normalPrice,
        category,
      },
    });

    // Send back a positive response with the product
    res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const seeProducts = async (req: Request, res: Response) => {
  try {
    // Get all the products from the database
    const products = await prisma.productList.findMany({});

    // Send back a positive response
    res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const seeProduct = async (req: Request, res: Response) => {
  try {
    // Get the id of the product
    const { id } = req.params;

    // Get the product from database
    const product = await prisma.productList.findUnique({ where: { id } });

    // Send back a positive response.
    res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  try {
    // Get the id of the product to be deleted.
    const { id } = req.params;

    // Get the enteries and create a valid enteries array
    const enteries = Object.keys(req.body);

    if (enteries.length < 1) {
      return res.status(400).json({ message: 'Please provide data to us.' });
    }

    const allowedEntery = ['name', 'description', 'normalPrice'];

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

    // Update the product's information.
    await prisma.productList.update({
      where: {
        id,
      },
      data: {
        ...req.body,
      },
    });

    // Send back a positive response
    res.status(201).json({
      message: 'Product has been updated successfully.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const allPharmacies = async (req: Request, res: Response) => {
  try {
    // Get relevant data from request body
    let { name, page } = req.body;

    // Configure the pages. Here, the first page will be 1.
    const itemPerPage = 10;
    page = page - 1;

    // Get all pharmacies from db.
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
        phoneNumber: true,
        address: true,
        hourly: true,
        allNight: true,
        latitude: true,
        longitude: true,
        creator: true,
        systemAdminCreator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send back a positive response
    res.status(200).json(pharmacies);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    // Get the id of the product to be deleted.
    const { id } = req.params;

    // Delete the product from product list.
    await prisma.productList.delete({
      where: {
        id,
      },
    });

    // Return back a positive response
    res.status(200).json({
      message: 'Product has been deleted from product list successfully.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

// const createCategory = async (req: Request, res: Response) => {
//   try {
//     // Get all the information from request body.
//     const { name, description } = req.body;

//     // Create the category
//     const category = await prisma.productCategory.create({
//       data: {
//         name,
//         description,
//         imageUrl: 'test.png',
//       },
//     });

//     // Send back a positive response
//     res.status(201).json({ message: 'Category created successfully.' });
//   } catch (error) {
//     return res.status(500).json({ message: 'Something went wrong.', error });
//   }
// };

// const deleteCategory = async (req: Request, res: Response) => {
//   try {
//     // Get the id of the category from the request params
//     const { id } = req.params;

//     // Delete the category
//     await prisma.productCategory.delete({
//       where: {
//         id,
//       },
//     });

//     // Send back a positive response
//     res
//       .status(200)
//       .json({ message: 'Category has been deleted successfully.' });
//   } catch (error) {
//     return res.status(500).json({ message: 'Something went wrong.', error });
//   }
// };

// const updateCategory = async (req: Request, res: Response) => {
//   try {
//     // Get the id of the category from the request params
//     const { id } = req.params;

//     // Get the enteries and create a valid enteries array
//     const enteries = Object.keys(req.body);

//     if (enteries.length < 1) {
//       return res.status(400).json({ message: 'Please provide data to us.' });
//     }

//     const allowedEntery = ['name', 'description'];

//     // Check if the enteries are valid
//     const isValidOperation = enteries.every((entery) => {
//       return allowedEntery.includes(entery);
//     });

//     // Send negative response if the enteries are not allowed.
//     if (!isValidOperation) {
//       res.status(400).send({
//         message: 'You are trying to update data you are not allowed to',
//       });
//       return;
//     }

//     // Update the category
//     await prisma.productCategory.update({
//       where: { id },
//       data: {
//         ...req.body,
//       },
//     });

//     // Send back a positive response
//     res
//       .status(200)
//       .json({ message: 'Category has been deleted successfully.' });
//   } catch (error) {
//     return res.status(500).json({ message: 'Something went wrong.', error });
//   }
// };

module.exports = {
  createSystemAdmin,
  loginSystemAdmin,
  refreshToken,
  logout,
  updateSystemAdmin,
  allSystemAdmins,
  createPharmacy,
  deletePharmacy,
  updatePharmacy,
  createProduct,
  seeProducts,
  seeProduct,
  updateProduct,
  allPharmacies,
  deleteProduct,
};
