import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');
const app = require('../src/app');
const request = require('supertest');
const { setupDatabase } = require('./fixtures/initialSetup');

beforeEach(setupDatabase);

test('should return 2', async () => {
  expect(2 + 2).toBe(4);
});
