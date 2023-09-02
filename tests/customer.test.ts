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
  customer,
  orderOne,
  orderTwo,
  customerAccessToken,
  customerRefreshToken,
  pharmacy,
} = require('./fixtures/initialSetup');

beforeEach(setupDatabase);

test('Should allow a customer to login', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app).post('/api/customer/login').send({
    email: customer?.email,
    password: customer?.password,
  });
  expect(response.status).toBe(200);

  // Assert that the refresh token field is populated in the db.
  const customerLoggedIn = await prisma.customer.findUnique({
    where: { email: customer.email },
  });
  expect(customerLoggedIn?.refreshToken).not.toBe(null);
});

test('Should not allow a customer with wrong credentials to login', async () => {
  // Assert that a 400 status code is returned.
  const response = await request(app).post('/api/customer/login').send({
    email: customer?.email,
    password: 'wrong password',
  });
  expect(response.status).toBe(400);
});

test('Should allow a customer to refresh his token', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .post('/api/customer/token')
    .set('Cookie', [`refreshToken=${customerRefreshToken}`])
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.name).toBe(customer.name);
  expect(response.body.email).toBe(customer.email);
});

test('Should not allow a non customer to refresh his token', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/customer/token')
    .set('Cookie', [`refreshToken=${systemAdminRefreshToken}`])
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated customer to refresh his token', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).post('/api/customer/token').send();
  expect(response.status).toBe(401);
});

test('Should allow a customer to logout', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .post('/api/customer/logout')
    .set('Authorization', `Bearer ${customerAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches.
  const customerLoggedOut = await prisma.customer.findUnique({
    where: { email: customer.email },
  });
  expect(customerLoggedOut?.refreshToken).toBe(null);
});

test('Should not allow a non customer to logout', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/customer/logout')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data matches.
  const customerLoggedOut = await prisma.customer.findUnique({
    where: { email: customer.email },
  });
  expect(customerLoggedOut?.refreshToken).not.toBe(null);
});

test('Should not allow an unauthenticated user to logout', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).post('/api/customer/logout').send();
  expect(response.status).toBe(401);

  // Assert that the data matches.
  const customerLoggedOut = await prisma.customer.findUnique({
    where: { email: customer.email },
  });
  expect(customerLoggedOut?.refreshToken).not.toBe(null);
});

test('Should allow customer to update his information', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .put(`/api/customer`)
    .set('Authorization', `Bearer ${customerAccessToken}`)
    .send({
      name: 'new name for customer',
    });
  expect(response.status).toBe(200);

  // Assert that the data match.
  const updatedcustomer = await prisma.customer.findUnique({
    where: { id: customer.id },
  });
  expect(updatedcustomer?.name).toBe('new name for customer');
});

test('Should not allow a non customer to update his information', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/customer`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'new name for customer',
    });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedcustomer = await prisma.customer.findUnique({
    where: { id: customer.id },
  });
  expect(updatedcustomer?.name).toBe(customer.name);
});

test('Should not allow an unauthorized user to update his information', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).put(`/api/customer`).send({
    name: 'new name for customer',
  });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedcustomer = await prisma.customer.findUnique({
    where: { id: customer.id },
  });
  expect(updatedcustomer?.name).toBe(customer.name);
});

test('Should allow a customer to see all his orders.', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/customer/orders`)
    .set('Authorization', `Bearer ${customerAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body[0].id).toBe(orderTwo.id);
  expect(response.body[0].orderedProduct.id).toBe(productTwo.id);
  expect(response.body[1].id).toBe(orderOne.id);
  expect(response.body[1].orderedProduct.id).toBe(productOne.id);
});

test('Should not allow a non customer to see all his orders.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/customer/orders`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see all his orders.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).get(`/api/customer/orders`).send();
  expect(response.status).toBe(401);
});

test('Should allow a customer to order products.', async () => {
  // Setup db
  await prisma.order.deleteMany({});

  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post(`/api/customer/placeOrder`)
    .set('Authorization', `Bearer ${customerAccessToken}`)
    .send({
      cart: [
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

  // Expect that the orders table has been configured properly
  const orders = await prisma.order.findMany({
    orderBy: {
      quantity: 'asc',
    },
  });
  expect(orders[0].customerId).toBe(customer.id);
  expect(orders[0].productId).toBe(productOne.id);
  expect(orders[0].price).toBe(productOne.price);
  expect(orders[0].quantity).toBe(4);
  expect(orders[1].customerId).toBe(customer.id);
  expect(orders[1].productId).toBe(productTwo.id);
  expect(orders[1].price).toBe(productTwo.price);
  expect(orders[1].quantity).toBe(49);

  // Assert that the products amount has been decremented.
  const soldProducts = await prisma.product.findMany({
    orderBy: {
      amount: 'asc',
    },
  });
  expect(soldProducts[0].amount).toBe(1);
  expect(soldProducts[1].amount).toBe(1);
});

test('Should not allow a customer to order products with non quantity (compromized amount).', async () => {
  // Setup db
  await prisma.order.deleteMany({});

  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post(`/api/customer/placeOrder`)
    .set('Authorization', `Bearer ${customerAccessToken}`)
    .send({
      cart: [
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

  // Expect that the orders table has been configured properly
  const orders = await prisma.order.findMany({});
  expect(orders.length).toBe(1);
  expect(orders[0].customerId).toBe(customer.id);
  expect(orders[0].productId).toBe(productOne.id);
  expect(orders[0].price).toBe(productOne.price);
  expect(orders[0].quantity).toBe(5);

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

test('Should not allow a customer to order products with non matching quantity (very compromized amount).', async () => {
  // Setup db
  await prisma.order.deleteMany({});

  // Assert that a 400 status code is returned.
  const response = await request(app)
    .post(`/api/customer/placeOrder`)
    .set('Authorization', `Bearer ${customerAccessToken}`)
    .send({
      cart: [
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

  // Expect that the orders table has been configured properly
  const orders = await prisma.order.findMany({});
  expect(orders.length).toBe(0);

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

test('Should not allow a non customer to order products.', async () => {
  // Setup db
  await prisma.order.deleteMany({});

  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post(`/api/customer/placeOrder`)
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

  // Expect that the orders table has been configured properly
  const orders = await prisma.order.findMany({});
  expect(orders.length).toBe(0);

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

test('Should not allow an unauthenticated user to place orders.', async () => {
  // Setup db
  await prisma.order.deleteMany({});

  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post(`/api/customer/placeOrder`)
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

  // Expect that the orders table has been configured properly
  const orders = await prisma.order.findMany({});
  expect(orders.length).toBe(0);

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

test('Should allow a customer to create his account.', async () => {
  // Assert that a 201 status code is returned.
  const response = await request(app).post(`/api/customer`).send({
    name: 'test',
    email: 'test@gmail.com',
    password: 'test1234',
  });
  expect(response.status).toBe(201);

  // Assert that the customer has been created successfully.
  const createdCustomer = await prisma.customer.findUnique({
    where: { email: 'test@gmail.com' },
  });
  expect(createdCustomer).not.toBe(null);
  expect(createdCustomer?.name).toBe('test');
});
