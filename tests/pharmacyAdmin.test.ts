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
  pharmacyAdminAccessToken,
  pharmacyAdminRefreshToken,
  productOne,
  productTwo,
  productListPenicillin,
  pharmacyAdmin,
  cachier,
  productListDoliprane,
  customer,
  orderOne,
  saleOne,
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
  // Assert that a 401 status code is returned.
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

test('Should allow a pharmacy admin to create a cachier', async () => {
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

test('Should allow a pharmacy admin to create a product', async () => {
  // Setup db.
  await prisma.product.deleteMany({
    where: { product: productListPenicillin.id },
  });

  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/createProduct')
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      productId: productListPenicillin.id,
      price: 50000,
      amount: 5,
    });
  expect(response.status).toBe(201);

  // Assert that the product exist in the database
  const product = await prisma.product.findFirst({
    where: { product: productListPenicillin.id },
  });
  expect(product?.product).toBe(productListPenicillin.id);
  expect(product?.amount).toBe(5);
  expect(product?.price).toBe(50000);
});

test('Should not allow a non pharmacy admin to create a product', async () => {
  // Setup db.
  await prisma.product.deleteMany({
    where: { product: productListPenicillin.id },
  });

  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/createProduct')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      productId: productListPenicillin.id,
      price: 50000,
      amount: 5,
    });
  expect(response.status).toBe(401);

  // Assert that the product does not exist in the database
  const product = await prisma.product.findFirst({
    where: { product: productListPenicillin.id },
  });
  expect(product).toBe(null);
});

test('Should not allow an unauthenticated user to create a product.', async () => {
  // Setup db.
  await prisma.product.deleteMany({
    where: { product: productListPenicillin.id },
  });

  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/pharmacyAdmin/createProduct')
    .send({
      productId: productListPenicillin.id,
      price: 50000,
      amount: 5,
    });
  expect(response.status).toBe(401);

  // Assert that the product does not exist in the database
  const product = await prisma.product.findFirst({
    where: { product: productListPenicillin.id },
  });
  expect(product).toBe(null);
});

test('Should allow a pharmacy admin to see all his cachiers.', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get('/api/pharmacyAdmin/seeAllCachiers')
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body[0].id).toBe(cachier.id);
  expect(response.body[0].name).toBe(cachier.name);
  expect(response.body[0].email).toBe(cachier.email);
});

test('Should not allow a non pharmacy admin to see all his cachiers.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get('/api/pharmacyAdmin/seeAllCachiers')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see all his cachiers.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get('/api/pharmacyAdmin/seeAllCachiers')
    .send();
  expect(response.status).toBe(401);
});

test('Should allow a pharmacy admin to see a cachiers.', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeCachier/${cachier.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.id).toBe(cachier.id);
  expect(response.body.name).toBe(cachier.name);
  expect(response.body.email).toBe(cachier.email);
});

test('Should not allow a non pharmacy admin to see a cachiers.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeCachier/${cachier.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see a cachiers.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeCachier/${cachier.id}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow a pharmacy admin to see all his products.', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeOurProducts?name=peni&page=1`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body[0].id).toBe(productTwo.id);
  expect(response.body[0].productList.name).toBe(productListPenicillin.name);
});

test('Should not allow a non pharmacy admin to see all his products.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeOurProducts?name=peni&page=1`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see all his products.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeOurProducts?name=peni&page=1`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow a pharmacy admin to see on of his product.', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeOneOFOurProduct/${productOne.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.id).toBe(productOne.id);
  expect(response.body.productList.id).toBe(productListDoliprane.id);
  expect(response.body.productList.name).toBe(productListDoliprane.name);
});

test('Should not allow a non pharmacy admin to see a product.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeOneOFOurProduct/${productOne.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see a product.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeOneOFOurProduct/${productOne.id}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow a pharmacy admin to see all his orders.', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeAllOrders`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body[0].id).toBe(orderOne.id);
  expect(response.body[0].productId).toBe(productOne.id);
  expect(response.body[0].customerId).toBe(customer.id);
});

test('Should not allow a non pharmacy admin to see all his orders.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeAllOrders`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see all his orders.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeAllOrders`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow a pharmacy admin to see all his sales.', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeAllSales`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body[0].id).toBe(saleOne.id);
  expect(response.body[0].productId).toBe(productOne.id);
  expect(response.body[0].cachierId).toBe(cachier.id);
});

test('Should not allow a non pharmacy admin to see all his sales.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeAllSales`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see all his sales.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeAllSales`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow pharmacy admin to see all products from product list', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeDrugList?name=Penicillin&page=1`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the products match
  expect(response.body[0].id).toBe(productListPenicillin.id);
  expect(response.body[0].name).toBe(productListPenicillin.name);
});

test('Should not allow an unauthorized user to see the product list.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeDrugList?name=Penicillin&page=1`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow system admin to see a product from the product list', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/seeDrugList?name=Penicillin&page=1`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow pharmacy admin to see all other pharmacy admins', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the products match
  expect(response.body[0].id).toBe(pharmacyAdmin.id);
  expect(response.body[0].name).toBe(pharmacyAdmin.name);
  expect(response.body[0].email).toBe(pharmacyAdmin.email);
});

test('Should not allow a non pharmacy admin to see all other pharmacy admins', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/pharmacyAdmin/`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to see all other pharmacy admins', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).get(`/api/pharmacyAdmin/`).send();
  expect(response.status).toBe(401);
});

test('Should allow pharmacy admin to update his products', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .put(`/api/pharmacyAdmin/updateProduct/${productOne.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      price: 100000,
    });
  expect(response.status).toBe(200);

  // Assert that the data match
  expect(response.body.updatedProduct.id).toBe(productOne.id);
  expect(response.body.updatedProduct.price).toBe(100000);
});

test('Should not allow a non pharmacy admin to update his products', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/pharmacyAdmin/updateProduct/${productOne.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      price: 100000,
    });
  expect(response.status).toBe(401);
});

test('Should not allow an unauthenticated user to update his products', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/pharmacyAdmin/updateProduct/${productOne.id}`)
    .send({
      price: 100000,
    });
  expect(response.status).toBe(401);
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

test('Should allow pharmacy admin to delete a cachier', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .delete(`/api/pharmacyAdmin/deleteCachier/${cachier.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data match.
  const deletedCachier = await prisma.cachier.findUnique({
    where: { id: cachier.id },
  });
  expect(deletedCachier).toBe(null);
});

test('Should not allow a non pharmacy admin to delete a cachier', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .delete(`/api/pharmacyAdmin/deleteCachier/${cachier.id}`)
    .set('Authorization', `Bearer ${systemAdmin}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data match.
  const deletedCachier = await prisma.cachier.findUnique({
    where: { id: cachier.id },
  });
  expect(deletedCachier?.id).toBe(cachier.id);
});

test('Should not allow an unauthenticated user to delete a cachier', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .delete(`/api/pharmacyAdmin/deleteCachier/${cachier.id}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data match.
  const deletedCachier = await prisma.cachier.findUnique({
    where: { id: cachier.id },
  });
  expect(deletedCachier?.id).toBe(cachier.id);
});

test('Should allow pharmacy admin to delete a product', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .delete(`/api/pharmacyAdmin/deleteProduct/${productOne.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data match.
  const deletedProduct = await prisma.product.findUnique({
    where: { id: productOne.id },
  });
  expect(deletedProduct).toBe(null);
});

test('Should not allow a non pharmacy admin to delete a product', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .delete(`/api/pharmacyAdmin/deleteProduct/${productOne.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data match.
  const deletedProduct = await prisma.product.findUnique({
    where: { id: productOne.id },
  });
  expect(deletedProduct?.id).toBe(productOne.id);
});

test('Should not allow an unauthenticated user to delete a product', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .delete(`/api/pharmacyAdmin/deleteProduct/${productOne.id}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data match.
  const deletedProduct = await prisma.product.findUnique({
    where: { id: productOne.id },
  });
  expect(deletedProduct?.id).toBe(productOne.id);
});
