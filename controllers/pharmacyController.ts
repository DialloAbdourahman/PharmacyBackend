import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
const validator = require('validator');
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');

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
    } = req.body;

    // Check if all fields are presendt
    if (
      !pharmacyName ||
      !pharmacyAdminEmail ||
      !pharmacyPhoneNumber ||
      !pharmacyAddress ||
      !pharmacyHourly ||
      !pharmacyAdminName ||
      !pharmacyAdminEmail ||
      !pharmacyAdminPassword ||
      !pharmacyAllNight
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

module.exports = { createPharmacy };
