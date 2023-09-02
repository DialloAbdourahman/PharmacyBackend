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
  systemAdminAccessToken,
  systemAdminRefreshToken,
  pharmacyAdminAccessToken,
  productOne,
  productTwo,
  productListPenicillin,
  cachier,
  customer,
  orderOne,
  saleOne,
  cachierAccessToken,
  cachierRefreshToken,
  pharmacy,
} = require('./fixtures/initialSetup');

beforeEach(setupDatabase);

test('should allow any user to see one all the pharmacies', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get('/api/pharmacy?name=messa&page=1')
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body[0].id).toBe(pharmacy.id);
  expect(response.body[0].name).toBe(pharmacy.name);
  expect(response.body[0].email).toBe(pharmacy.email);
});

test('should allow any user to see a pharmacy information', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacy/${pharmacy.id}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.id).toBe(pharmacy.id);
  expect(response.body.name).toBe(pharmacy.name);
  expect(response.body.email).toBe(pharmacy.email);
});
