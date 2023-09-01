import { Prisma, PrismaClient } from '@prisma/client';
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../utils/prismaClient');
const app = require('../src/app');
const request = require('supertest');
const {
  setupDatabase,
  categoryAntibiotic,
  categoryPrescription,
} = require('./fixtures/initialSetup');

beforeEach(setupDatabase);

test('should allow any user to see one all the categories', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app).get('/api/category').send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body[0].id).toBe(categoryAntibiotic.id);
  expect(response.body[0].name).toBe(categoryAntibiotic.name);
  expect(response.body[1].id).toBe(categoryPrescription.id);
  expect(response.body[1].name).toBe(categoryPrescription.name);
});
