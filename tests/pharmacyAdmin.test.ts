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
  categoryAntibiotic,
  pharmacyAdminAccessToken,
  pharmacyAdminRefreshToken,
  productOne,
  productListPenicillin,
  pharmacy,
  pharmacyAdmin,
} = require('./fixtures/initialSetup');

beforeEach(setupDatabase);

test('Should allow a pharmacy admin to login', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app).post('/api/pharmacyAdmin/login').send({
    email: pharmacyAdmin?.email,
    password: pharmacyAdmin?.password,
  });
  expect(response.status).toBe(200);

  // Assert that the refresh token field is populated in the db.
  const pharmacyAdminLoggedIn = await prisma.pharmacyAdmin.findUnique({
    where: { email: pharmacyAdmin.email },
  });
  expect(pharmacyAdminLoggedIn?.refreshToken).not.toBe(null);
});

test('Should not allow a pharmacy admin with wrong credentials to login', async () => {
  // Assert that a 400 status code is returned.
  const response = await request(app).post('/api/pharmacyAdmin/login').send({
    email: pharmacyAdmin?.email,
    password: 'wrong password',
  });
  expect(response.status).toBe(400);
});

test('Should allow a pharmacy admin to refresh his token', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/token')
    .set('Cookie', [`refreshToken=${pharmacyAdminRefreshToken}`])
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.name).toBe(pharmacyAdmin.name);
  expect(response.body.email).toBe(pharmacyAdmin.email);
});

test('Should not allow a non pharmacy admin to refresh his token', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/token')
    .set('Cookie', [`refreshToken=${systemAdminRefreshToken}`])
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated pharmacy admin to refresh his token', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).post('/api/pharmacyAdmin/token').send();
  expect(response.status).toBe(401);
});

test('Should allow a pharmacy admin to logout', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/logout')
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches.
  const pharmacyAdminLoggedOut = await prisma.pharmacyAdmin.findUnique({
    where: { email: pharmacyAdmin.email },
  });
  expect(pharmacyAdminLoggedOut?.refreshToken).toBe(null);
});

test('Should not allow a non pharmacy admin to logout', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/logout')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data matches.
  const pharmacyAdminLoggedOut = await prisma.pharmacyAdmin.findUnique({
    where: { email: pharmacyAdmin.email },
  });
  expect(pharmacyAdminLoggedOut?.refreshToken).not.toBe(null);
});

test('Should not allow an unauthenticated user to logout', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).post('/api/pharmacyAdmin/logout').send();
  expect(response.status).toBe(401);

  // Assert that the data matches.
  const pharmacyAdminLoggedOut = await prisma.pharmacyAdmin.findUnique({
    where: { email: pharmacyAdmin.email },
  });
  expect(pharmacyAdminLoggedOut?.refreshToken).not.toBe(null);
});

test('Should allow pharmacy admin to update his information', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .put(`/api/pharmacyAdmin`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      name: 'new name for pharmacy admin',
    });
  expect(response.status).toBe(200);

  // Assert that the data match.
  const updatedPharmacyAdmin = await prisma.pharmacyAdmin.findUnique({
    where: { id: pharmacyAdmin.id },
  });
  expect(updatedPharmacyAdmin?.name).toBe('new name for pharmacy admin');
});

test('Should not allow a non pharmacy admin to update his information', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/pharmacyAdmin`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'new name for pharmacy admin',
    });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedPharmacyAdmin = await prisma.pharmacyAdmin.findUnique({
    where: { id: pharmacyAdmin.id },
  });
  expect(updatedPharmacyAdmin?.name).toBe(pharmacyAdmin.name);
});

test('Should not allow an unauthorized user to update his information', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).put(`/api/pharmacyAdmin`).send({
    name: 'new name for pharmacy admin',
  });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedPharmacyAdmin = await prisma.pharmacyAdmin.findUnique({
    where: { id: pharmacyAdmin.id },
  });
  expect(updatedPharmacyAdmin?.name).toBe(pharmacyAdmin.name);
});

test('Should allow a pharmacy admin to create another pharmacy admin', async () => {
  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/createPharmacyAdmin')
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      name: 'pharmacy Admin',
      email: 'pharmacyadmin@gmail.com',
      password: 'pharmacyadmin1234',
    });
  expect(response.status).toBe(201);

  // Assert that the pharmacy admin exists in the database
  const pharmacyAdmin = await prisma.pharmacyAdmin.findUnique({
    where: { email: 'pharmacyadmin@gmail.com' },
  });
  expect(pharmacyAdmin?.email).toBe('pharmacyadmin@gmail.com');
});

test('Should not allow a non pharmacy admin user to create a pharmacy admin', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/createPharmacyAdmin')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'pharmacy Admin',
      email: 'pharmacyadmin@gmail.com',
      password: 'pharmacyadmin1234',
    });
  expect(response.status).toBe(401);

  // Assert that the pharmacy admin does not exist in the database
  const pharmacyAdmin = await prisma.pharmacyAdmin.findUnique({
    where: { email: 'pharmacyadmin@gmail.com' },
  });
  expect(pharmacyAdmin).toBe(null);
});

test('Should not allow an unauthorized user to create a pharmacy admin', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/createPharmacyAdmin')
    .send({
      name: 'pharmacy Admin',
      email: 'pharmacyadmin@gmail.com',
      password: 'pharmacyadmin1234',
    });
  expect(response.status).toBe(401);

  // Assert that the pharmacy admin does not exist in the database
  const pharmacyAdmin = await prisma.pharmacyAdmin.findUnique({
    where: { email: 'pharmacyadmin@gmail.com' },
  });
  expect(pharmacyAdmin).toBe(null);
});

test('Should allow a pharmacy admin to a cachier', async () => {
  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/createCachier')
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      name: 'Cachier',
      email: 'cachier@gmail.com',
      password: 'cachier1234',
    });
  expect(response.status).toBe(201);

  // Assert that the pharmacy admin exists in the database
  const cachier = await prisma.cachier.findUnique({
    where: { email: 'cachier@gmail.com' },
  });
  expect(cachier?.email).toBe('cachier@gmail.com');
});

test('Should not allow a non pharmacy admin user to create a cachier', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/createCachier')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'Cachier',
      email: 'cachier@gmail.com',
      password: 'cachier1234',
    });
  expect(response.status).toBe(401);

  // Assert that the pharmacy admin does not exist in the database
  const cachier = await prisma.cachier.findUnique({
    where: { email: 'cachier@gmail.com' },
  });
  expect(cachier).toBe(null);
});

test('Should not allow an unauthorized user to create a cachier', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/createCachier')
    .send({
      name: 'Cachier',
      email: 'cachier@gmail.com',
      password: 'cachier1234',
    });
  expect(response.status).toBe(401);

  // Assert that the pharmacy admin does not exist in the database
  const cachier = await prisma.cachier.findUnique({
    where: { email: 'cachier@gmail.com' },
  });
  expect(cachier).toBe(null);
});
