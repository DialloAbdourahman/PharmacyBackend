import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
const validator = require('validator');
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');
const {
  generateAuthTokenForSystemAdmin,
} = require('../utils/generateAuthToken');

const createSystemAdmin = async (req: Request, res: Response) => {
  try {
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

    // Hash the password
    password = await bcrypt.hash(password, 8);

    // Create a system admin
    await prisma.systemAdmin.create({
      data: {
        name,
        email,
        password,
        titleName: 'system_admin',
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
    // Get all the system admin's information
    let { email, password } = req.body;

    // Check if all fields are present
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password' });
    }

    // Validate the email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid Email' });
    }

    // Check if the email matches
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
      },
    });
    if (!systemAdmin) {
      return res.status(400).json({ message: 'Unable to login' });
    }

    // Now compare the passwords
    const isMatch = await bcrypt.compare(password, systemAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Unable to login' });
    }

    // Generate token and store it in database
    let dataToGenerateAuthToken: any = { ...systemAdmin, password: undefined };
    const token = await generateAuthTokenForSystemAdmin(
      dataToGenerateAuthToken
    );

    // Send back response
    res.status(200).json({
      name: systemAdmin.name,
      email: systemAdmin.email,
      title: systemAdmin.titleName,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

module.exports = { createSystemAdmin, loginSystemAdmin };
