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
  systemAdmin,
} = require('./fixtures/initialSetup');

beforeEach(setupDatabase);

test('Should allow a system admin to create another system admin', async () => {
  // Assert that a 201 status code is returned after a system admin has been created.
  const response = await request(app)
    .post('/api/systemAdmin')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'System Admin',
      email: 'systemadmin@gmail.com',
      password: 'systemadmin1234',
    });
  expect(response.status).toBe(201);

  // Assert that the system admin exists in the database
  const systemAdmin = await prisma.systemAdmin.findUnique({
    where: { email: 'systemadmin@gmail.com' },
  });
  expect(systemAdmin?.email).toBe('systemadmin@gmail.com');
});

test('Should not allow an unauthorized user to create a system admin', async () => {
  // Assert that a 401 status code is returned after trying to create a system admin.
  const response = await request(app).post('/api/systemAdmin').send({
    name: 'System Admin',
    email: 'systemadmin@gmail.com',
    password: 'systemadmin1234',
  });
  expect(response.status).toBe(401);

  // Assert that the system admin does not exist in the database
  const systemAdmin = await prisma.systemAdmin.findUnique({
    where: { email: 'systemadmin@gmail.com' },
  });
  expect(systemAdmin).toBe(null);
});

test('Should allow a system admin to login', async () => {
  // Assert that a 200 status code is returned after loggin in.
  const response = await request(app).post('/api/systemAdmin/login').send({
    email: systemAdmin?.email,
    password: systemAdmin?.password,
  });
  expect(response.status).toBe(200);

  // Assert that the refresh token field is populated in the db.
  const systemAdminLoggedIn = await prisma.systemAdmin.findUnique({
    where: { email: systemAdmin.email },
  });
  expect(systemAdminLoggedIn?.refreshToken).not.toBe(null);
});

test('Should not allow a system admin with wrong credentials to login', async () => {
  // Assert that a 400 status code is returned after trying to login.
  const response = await request(app).post('/api/systemAdmin/login').send({
    email: systemAdmin?.email,
    password: 'wrong password',
  });
  expect(response.status).toBe(400);
});

test('Should allow a system admin to refresh his token', async () => {
  // Assert that a 200 status code is returned after refreshing token.
  const response = await request(app)
    .post('/api/systemAdmin/token')
    .set('Cookie', [`refreshToken=${systemAdminRefreshToken}`])
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.name).toBe(systemAdmin.name);
  expect(response.body.email).toBe(systemAdmin.email);
});

test('Should not allow an unauthorized system admin to refresh his token', async () => {
  // Assert that a 401 status code is returned after trying to refresh token.
  const response = await request(app).post('/api/systemAdmin/token').send();
  expect(response.status).toBe(401);
});
