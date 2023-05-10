import { Prisma, PrismaClient } from '@prisma/client';
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('./prismaClient');
const jwt = require('jsonwebtoken');

const generateAuthTokenForSystemAdmin = async (data: any) => {
  const token = jwt.sign({ data }, process.env.JWT_SECRET_SYSTEM_ADMIN, {
    expiresIn: '5s',
  });
  return token;
};

module.exports = { generateAuthTokenForSystemAdmin };
