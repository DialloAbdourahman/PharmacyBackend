import { Prisma, PrismaClient } from '@prisma/client';
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('./prismaClient');
const jwt = require('jsonwebtoken');

const generateAccessToken = (data: any, secrete: string) => {
  const token = jwt.sign({ data }, secrete, {
    expiresIn: '15m',
  });
  return token;
};

const generateRefreshToken = (data: any, secrete: string) => {
  const token = jwt.sign({ data }, secrete);
  return token;
};

module.exports = { generateAccessToken, generateRefreshToken };
