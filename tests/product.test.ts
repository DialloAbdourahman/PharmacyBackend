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
  productListPenicillin,
  pharmacyTwo,
  productFour,
  categoryAntibiotic,
} = require('./fixtures/initialSetup');

beforeEach(setupDatabase);

test('should allow any user to search for products (Navbar search to the product list)', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get('/api/product/search?name=peni')
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body[0].id).toBe(productListPenicillin.id);
  expect(response.body[0].name).toBe(productListPenicillin.name);
});

test('should allow any user to search for products with localization', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get('/api/product')
    .query({
      name: 'peni',
      page: 1,
      latitude: '3.868078',
      longitude: '11.461773',
      categoryId: '',
    })
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body[0].productid).toBe(productFour.id);
  expect(response.body[0].productname).toBe(productListPenicillin.name);
  expect(response.body[0].pharmacyname).toBe(pharmacyTwo.name);
  expect(response.body[0].distance_m).toBe(907.0432320154484);
});

test('should allow any user to search for products with no localization', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get('/api/product')
    .query({
      name: 'peni',
      page: 1,
      categoryId: '',
      latitude: 0,
      longitude: 0,
    })
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.length).toBe(2);
  expect(response.body[0].productname).toBe(productListPenicillin.name);
  expect(response.body[1].productname).toBe(productListPenicillin.name);
});

test('should allow any user to search for products with no localization but with a category', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get('/api/product')
    .query({
      name: 'peni',
      page: 1,
      categoryId: categoryAntibiotic.id,
      latitude: 0,
      longitude: 0,
    })
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.length).toBe(2);
  expect(response.body[0].productname).toBe(productListPenicillin.name);
  expect(response.body[1].productname).toBe(productListPenicillin.name);
});
