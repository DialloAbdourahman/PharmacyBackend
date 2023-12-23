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

test('Should allow a cachier to login', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app).post('/api/cachier/login').send({
    email: cachier?.email,
    password: cachier?.password,
  });
  expect(response.status).toBe(200);

  // Assert that the refresh token field is populated in the db.
  const cachierLoggedIn = await prisma.cachier.findUnique({
    where: { email: cachier.email },
  });
  expect(cachierLoggedIn?.refreshToken).not.toBe(null);
});

test('Should not allow a cachier with wrong credentials to login', async () => {
  // Assert that a 400 status code is returned.
  const response = await request(app).post('/api/cachier/login').send({
    email: cachier?.email,
    password: 'wrong password',
  });
  expect(response.status).toBe(400);
});

test('Should allow a cachier to refresh his token', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .post('/api/cachier/token')
    .set('Cookie', [`refreshToken=${cachierRefreshToken}`])
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.name).toBe(cachier.name);
  expect(response.body.email).toBe(cachier.email);
});

test('Should not allow a non cachier to refresh his token', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/cachier/token')
    .set('Cookie', [`refreshToken=${systemAdminRefreshToken}`])
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated cachier to refresh his token', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).post('/api/cachier/token').send();
  expect(response.status).toBe(401);
});

test('Should allow a cachier to logout', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .post('/api/cachier/logout')
    .set('Authorization', `Bearer ${cachierAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches.
  const cachierLoggedOut = await prisma.cachier.findUnique({
    where: { email: cachier.email },
  });
  expect(cachierLoggedOut?.refreshToken).toBe(null);
});

test('Should not allow a non cachier to logout', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/cachier/logout')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data matches.
  const cachierLoggedOut = await prisma.cachier.findUnique({
    where: { email: cachier.email },
  });
  expect(cachierLoggedOut?.refreshToken).not.toBe(null);
});

test('Should not allow an unauthenticated user to logout', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).post('/api/cachier/logout').send();
  expect(response.status).toBe(401);

  // Assert that the data matches.
  const cachierLoggedOut = await prisma.cachier.findUnique({
    where: { email: cachier.email },
  });
  expect(cachierLoggedOut?.refreshToken).not.toBe(null);
});

test('Should allow cachier to update his information', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .put(`/api/cachier`)
    .set('Authorization', `Bearer ${cachierAccessToken}`)
    .send({
      name: 'new name for cachier',
    });
  expect(response.status).toBe(200);

  // Assert that the data match.
  const updatedCachier = await prisma.cachier.findUnique({
    where: { id: cachier.id },
  });
  expect(updatedCachier?.name).toBe('new name for cachier');
});

test('Should not allow a non cachier to update his information', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/cachier`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'new name for cachier',
    });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedCachier = await prisma.cachier.findUnique({
    where: { id: cachier.id },
  });
  expect(updatedCachier?.name).toBe(cachier.name);
});

test('Should not allow an unauthorized user to update his information', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).put(`/api/cachier`).send({
    name: 'new name for cachier',
  });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedCachier = await prisma.cachier.findUnique({
    where: { id: cachier.id },
  });
  expect(updatedCachier?.name).toBe(cachier.name);
});

test('Should allow a cachier to see all his products.', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/cachier/seeOurProducts?name=peni&page=1`)
    .set('Authorization', `Bearer ${cachierAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.products[0].id).toBe(productTwo.id);
  expect(response.body.products[0].productList.name).toBe(
    productListPenicillin.name
  );
});

test('Should not allow a non cachier to see all his products.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/cachier/seeOurProducts?name=peni&page=1`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see all his products.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/cachier/seeOurProducts?name=peni&page=1`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow a cachier to see all his orders.', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/cachier/seeAllOrders?page=1`)
    .set('Authorization', `Bearer ${cachierAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.orders[0].id).toBe(orderOne.id);
  expect(response.body.orders[0].productId).toBe(productOne.id);
  expect(response.body.orders[0].customerId).toBe(customer.id);
});

test('Should not allow a non cachier to see all his orders.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/cachier/seeAllOrders?page=1`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see all his orders.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/cachier/seeAllOrders?page=1`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow a cachier to see all his sales.', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/cachier/seeAllSales?page=1`)
    .set('Authorization', `Bearer ${cachierAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.sales[0].id).toBe(saleOne.id);
  expect(response.body.sales[0].productId).toBe(productOne.id);
  expect(response.body.sales[0].cachierId).toBe(cachier.id);
});

test('Should not allow a non cachier to see all his sales.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/cachier/seeAllSales?page=1`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see all his sales.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/cachier/seeAllSales?page=1`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow a cachier to sell products.', async () => {
  // Setup db
  await prisma.sale.deleteMany({});

  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post(`/api/cachier/sell`)
    .set('Authorization', `Bearer ${cachierAccessToken}`)
    .send({
      products: [
        {
          productId: productOne.id,
          quantity: 4,
        },
        {
          productId: productTwo.id,
          quantity: 49,
        },
      ],
    });
  expect(response.status).toBe(201);

  // Assert that the total has been calculated properly
  expect(response.body.totalAmount).toBe(82400);

  // Expect that the sales table has been configured properly
  const sales = await prisma.sale.findMany({
    orderBy: {
      quantity: 'asc',
    },
  });
  expect(sales[0].cachierId).toBe(cachier.id);
  expect(sales[0].productId).toBe(productOne.id);
  expect(sales[0].price).toBe(productOne.price);
  expect(sales[0].quantity).toBe(4);
  expect(sales[1].cachierId).toBe(cachier.id);
  expect(sales[1].productId).toBe(productTwo.id);
  expect(sales[1].price).toBe(productTwo.price);
  expect(sales[1].quantity).toBe(49);

  // Assert that the products amount has been decremented.
  const soldProducts = await prisma.product.findMany({
    orderBy: {
      amount: 'asc',
    },
  });
  expect(soldProducts[0].amount).toBe(1);
  expect(soldProducts[1].amount).toBe(1);
});

test('Should not allow a cachier to sell products with non matching quantity (compromized amount).', async () => {
  // Setup db
  await prisma.sale.deleteMany({});

  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post(`/api/cachier/sell`)
    .set('Authorization', `Bearer ${cachierAccessToken}`)
    .send({
      products: [
        {
          productId: productOne.id,
          quantity: 5,
        },
        {
          productId: productTwo.id,
          quantity: 51,
        },
      ],
    });
  expect(response.status).toBe(201);

  // Assert that the total has been calculated properly
  expect(response.body.totalAmount).toBe(5000);

  // Expect that the sales table has been configured properly
  const sales = await prisma.sale.findMany({});
  expect(sales.length).toBe(1);
  expect(sales[0].cachierId).toBe(cachier.id);
  expect(sales[0].productId).toBe(productOne.id);
  expect(sales[0].price).toBe(productOne.price);
  expect(sales[0].quantity).toBe(5);

  // Assert that the products amount has been decremented.
  const soldProducts = await prisma.product.findMany({
    where: {
      pharmacySelling: pharmacy.id,
    },
    orderBy: {
      amount: 'asc',
    },
  });
  expect(soldProducts[0].amount).toBe(0);
});

test('Should not allow a cachier to sell products with non matching quantity (very compromized amount).', async () => {
  // Setup db
  await prisma.sale.deleteMany({});

  // Assert that a 400 status code is returned.
  const response = await request(app)
    .post(`/api/cachier/sell`)
    .set('Authorization', `Bearer ${cachierAccessToken}`)
    .send({
      products: [
        {
          productId: productOne.id,
          quantity: 6,
        },
        {
          productId: productTwo.id,
          quantity: 51,
        },
      ],
    });
  expect(response.status).toBe(400);

  // Expect that the sales table has been configured properly
  const sales = await prisma.sale.findMany({});
  expect(sales.length).toBe(0);

  // Assert that the products amount has not been decremented.
  const soldProducts = await prisma.product.findMany({
    where: {
      pharmacySelling: pharmacy.id,
    },
    orderBy: {
      amount: 'asc',
    },
  });
  expect(soldProducts[0].amount).toBe(5);
  expect(soldProducts[1].amount).toBe(50);
});

test('Should not allow a non cachier to sell products.', async () => {
  // Setup db
  await prisma.sale.deleteMany({});

  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post(`/api/cachier/sell`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      products: [
        {
          productId: productOne.id,
          quantity: 4,
        },
        {
          productId: productTwo.id,
          quantity: 49,
        },
      ],
    });
  expect(response.status).toBe(401);

  // Expect that the sales table has been configured properly
  const sales = await prisma.sale.findMany({});
  expect(sales.length).toBe(0);

  // Assert that the products amount has been decremented.
  const soldProducts = await prisma.product.findMany({
    where: {
      pharmacySelling: pharmacy.id,
    },
    orderBy: {
      amount: 'asc',
    },
  });
  expect(soldProducts[0].amount).toBe(5);
  expect(soldProducts[1].amount).toBe(50);
});

test('Should not allow an unauthenticated user to sell products.', async () => {
  // Setup db
  await prisma.sale.deleteMany({});

  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post(`/api/cachier/sell`)
    .send({
      products: [
        {
          productId: productOne.id,
          quantity: 4,
        },
        {
          productId: productTwo.id,
          quantity: 49,
        },
      ],
    });
  expect(response.status).toBe(401);

  // Expect that the sales table has been configured properly
  const sales = await prisma.sale.findMany({});
  expect(sales.length).toBe(0);

  // Assert that the products amount has been decremented.
  const soldProducts = await prisma.product.findMany({
    where: {
      pharmacySelling: pharmacy.id,
    },
    orderBy: {
      amount: 'asc',
    },
  });
  expect(soldProducts[0].amount).toBe(5);
  expect(soldProducts[1].amount).toBe(50);
});
