import { Prisma, PrismaClient } from '@prisma/client';
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('./prismaClient');
const jwt = require('jsonwebtoken');

const generateAccessToken = async (data: any, secrete: string) => {
  const token = jwt.sign({ data }, secrete, {
    expiresIn: '1hr',
  });
  return token;
};

const generateRefreshToken = async (data: any, secrete: string) => {
  const token = jwt.sign({ data }, secrete);
  return token;
};

module.exports = { generateAccessToken, generateRefreshToken };
