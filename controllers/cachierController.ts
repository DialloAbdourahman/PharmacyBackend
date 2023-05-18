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

    // Send back response.
    res.status(200).json({
      name: cachier.name,
      email: cachier.email,
      title: cachier.titleName,
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

module.exports = { loginCachier, refreshToken, logout };
