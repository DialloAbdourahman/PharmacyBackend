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

test('Should allow a system admin to create another system admin', async () => {
  // Assert that a 201 status code is returned.
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

test('Should not allow a non system admin user to create a system admin', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin')
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
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

test('Should not allow an unauthorized user to create a system admin', async () => {
  // Assert that a 401 status code is returned.
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
  // Assert that a 200 status code is returned.
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
  // Assert that a 400 status code is returned.
  const response = await request(app).post('/api/systemAdmin/login').send({
    email: systemAdmin?.email,
    password: 'wrong password',
  });
  expect(response.status).toBe(400);
});

test('Should allow a system admin to logout', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/logout')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches.
  const systemAdminLoggedOut = await prisma.systemAdmin.findUnique({
    where: { email: systemAdmin.email },
  });
  expect(systemAdminLoggedOut?.refreshToken).toBe(null);
});

test('Should not allow a non system admin to logout', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/logout')
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data matches.
  const systemAdminLoggedOut = await prisma.systemAdmin.findUnique({
    where: { email: systemAdmin.email },
  });
  expect(systemAdminLoggedOut?.refreshToken).not.toBe(null);
});

test('Should not allow an unauthenticated user to logout', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).post('/api/systemAdmin/logout').send();
  expect(response.status).toBe(401);

  // Assert that the data matches.
  const systemAdminLoggedOut = await prisma.systemAdmin.findUnique({
    where: { email: systemAdmin.email },
  });
  expect(systemAdminLoggedOut?.refreshToken).not.toBe(null);
});

test('Should allow a system admin to refresh his token', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/token')
    .set('Cookie', [`refreshToken=${systemAdminRefreshToken}`])
    .send();
  expect(response.status).toBe(200);

  // Assert that the data matches
  expect(response.body.name).toBe(systemAdmin.name);
  expect(response.body.email).toBe(systemAdmin.email);
});

test('Should not allow a non system admin to refresh his token', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/token')
    .set('Cookie', [`refreshToken=${pharmacyAdminRefreshToken}`])
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthorized system admin to refresh his token', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).post('/api/systemAdmin/token').send();
  expect(response.status).toBe(401);
});

test("Should allow a system admin to create a pharmacy with it's pharmacy admin", async () => {
  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/createPharmacy')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      pharmacyName: 'Test pharmacy',
      pharmacyEmail: 'testpharmacy@gmail.com',
      pharmacyPhoneNumber: '54477555',
      pharmacyAddress: 'test country and region',
      pharmacyHourly: '8hr - 18hr',
      pharmacyAdminName: 'Test pharmacy admin',
      pharmacyAdminEmail: 'testpharmacyadmin@gmail.com',
      pharmacyAdminPassword: 'testpharmacy1234',
      pharmacyAllNight: true,
      pharmacyLatitude: 0.55,
      pharmacyLongitude: 11.55,
    });
  expect(response.status).toBe(201);

  // Assert that the pharmacy and it's pharmacy admin have been created on the db.
  const pharamcy = await prisma.pharmacy.findUnique({
    where: { name: 'Test pharmacy' },
    include: { pharmacyAdmin: true },
  });
  expect(pharamcy?.name).toBe('Test pharmacy');
  expect(pharamcy?.email).toBe('testpharmacy@gmail.com');
  expect(pharamcy?.pharmacyAdmin[0].name).toBe('Test pharmacy admin');
  expect(pharamcy?.pharmacyAdmin[0].email).toBe('testpharmacyadmin@gmail.com');
});

test("Should not allow a non system admin to create a pharmacy with it's pharmacy admin", async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/createPharmacy')
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      pharmacyName: 'Test pharmacy',
      pharmacyEmail: 'testpharmacy@gmail.com',
      pharmacyPhoneNumber: '54477555',
      pharmacyAddress: 'test country and region',
      pharmacyHourly: '8hr - 18hr',
      pharmacyAdminName: 'Test pharmacy admin',
      pharmacyAdminEmail: 'testpharmacyadmin@gmail.com',
      pharmacyAdminPassword: 'testpharmacy1234',
      pharmacyAllNight: true,
      pharmacyLatitude: 0.55,
      pharmacyLongitude: 11.55,
    });
  expect(response.status).toBe(401);

  // Assert that the pharmacy has not been created.
  const pharamcy = await prisma.pharmacy.findUnique({
    where: { name: 'Test pharmacy' },
  });
  expect(pharamcy).toBe(null);
});

test("Should not allow an unauthorized system admin to create a pharmacy with it's pharmacy admin", async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/createPharmacy')
    .send({
      pharmacyName: 'Test pharmacy',
      pharmacyEmail: 'testpharmacy@gmail.com',
      pharmacyPhoneNumber: '54477555',
      pharmacyAddress: 'test country and region',
      pharmacyHourly: '8hr - 18hr',
      pharmacyAdminName: 'Test pharmacy admin',
      pharmacyAdminEmail: 'testpharmacyadmin@gmail.com',
      pharmacyAdminPassword: 'testpharmacy1234',
      pharmacyAllNight: true,
      pharmacyLatitude: 0.55,
      pharmacyLongitude: 11.55,
    });
  expect(response.status).toBe(401);

  // Assert that the pharmacy has not been created.
  const pharamcy = await prisma.pharmacy.findUnique({
    where: { name: 'Test pharmacy' },
  });
  expect(pharamcy).toBe(null);
});

test('Should allow a system admin to create a medication', async () => {
  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/createProduct')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'Test medication',
      description: 'Test medication description',
      normalPrice: 50000,
      category: categoryAntibiotic.id,
    });
  expect(response.status).toBe(201);

  // Assert that the medication has been created in the db
  const medication = await prisma.productList.findUnique({
    where: { name: 'Test medication' },
  });
  expect(medication?.name).toBe('Test medication');
});

test('Should not allow a non system admin to create a medication', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/createProduct')
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      name: 'Test medication',
      description: 'Test medication description',
      normalPrice: 50000,
      category: categoryAntibiotic.id,
    });
  expect(response.status).toBe(401);

  // Assert that the medication has not been created in the db
  const medication = await prisma.productList.findUnique({
    where: { name: 'Test medication' },
  });
  expect(medication).toBe(null);
});

test('Should not allow an unauthorized system admin to create a medication', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/createProduct')
    .send({
      name: 'Test medication',
      description: 'Test medication description',
      normalPrice: 50000,
      category: categoryAntibiotic.id,
    });
  expect(response.status).toBe(401);

  // Assert that the medication has not been created in the db
  const medication = await prisma.productList.findUnique({
    where: { name: 'Test medication' },
  });
  expect(medication).toBe(null);
});

test('Should allow a system admin to create a medication category', async () => {
  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/createProductCategory')
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'Test category',
      description: 'Test category description',
    });
  expect(response.status).toBe(201);

  // Assert that the category has been created in the db
  const category = await prisma.productCategory.findUnique({
    where: { name: 'Test category' },
  });
  expect(category?.name).toBe('Test category');
});

test('Should not allow a non system admin to create a product category', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/createProductCategory')
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      name: 'Test category',
      description: 'Test category description',
    });
  expect(response.status).toBe(401);

  // Assert that the category has been created in the db
  const category = await prisma.productCategory.findUnique({
    where: { name: 'Test category' },
  });
  expect(category).toBe(null);
});

test('Should not allow an unauthorized system admin to create a product category', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post('/api/systemAdmin/createProductCategory')
    .send({
      name: 'Test category',
      description: 'Test category description',
    });
  expect(response.status).toBe(401);

  // Assert that the category has been created in the db
  const category = await prisma.productCategory.findUnique({
    where: { name: 'Test category' },
  });
  expect(category).toBe(null);
});

test('Should allow a system admin to upload a category image and delete it.', async () => {
  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post(
      `/api/systemAdmin/uploadProductCategoryImage/${categoryAntibiotic.id}`
    )
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .attach('categoryImage', 'tests/fixtures/image2.jpg');
  expect(response.status).toBe(201);

  // Assert that the category has an image
  const category = await prisma.productCategory.findUnique({
    where: { id: categoryAntibiotic.id },
  });
  expect(category?.imageUrl).not.toBe(null);

  // Assert that a 200 status code is returned when deleting an image
  const response2 = await request(app)
    .delete(`/api/systemAdmin/deleteCategoryImage/${categoryAntibiotic.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response2.status).toBe(200);
});

test('Should not allow a non system admin to upload a category image.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post(
      `/api/systemAdmin/uploadProductCategoryImage/${categoryAntibiotic.id}`
    )
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .attach('categoryImage', 'tests/fixtures/image2.jpg');
  expect(response.status).toBe(401);

  // Assert that the category has an image
  const category = await prisma.productCategory.findUnique({
    where: { id: categoryAntibiotic.id },
  });
  expect(category?.imageUrl).toBe(null);
});

test('Should not allow an unauthorized system admin to upload a category image.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post(
      `/api/systemAdmin/uploadProductCategoryImage/${categoryAntibiotic.id}`
    )
    .attach('categoryImage', 'tests/fixtures/image2.jpg');
  expect(response.status).toBe(401);

  // Assert that the category has an image
  const category = await prisma.productCategory.findUnique({
    where: { id: categoryAntibiotic.id },
  });
  expect(category?.imageUrl).toBe(null);
});

test('Should allow a system admin to upload a product image and delete it.', async () => {
  // Assert that a 201 status code is returned.
  const response = await request(app)
    .post(`/api/systemAdmin/uploadProductImage/${productOne.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .attach('productImage', 'tests/fixtures/image2.jpg');
  expect(response.status).toBe(201);

  // Assert that the product has an image
  const category = await prisma.productList.findUnique({
    where: { id: productOne.id },
  });
  expect(category?.image).not.toBe(null);

  // Assert that a 200 status code is returned when deleting an image
  const response2 = await request(app)
    .delete(`/api/systemAdmin/deleteProductImage/${productOne.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response2.status).toBe(200);
});

test('Should not allow a non system admin to upload a product image and delete it.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post(`/api/systemAdmin/uploadProductImage/${productOne.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .attach('productImage', 'tests/fixtures/image2.jpg');
  expect(response.status).toBe(401);

  // Assert that the product has an image
  const category = await prisma.productList.findUnique({
    where: { id: productOne.id },
  });
  expect(category?.image).toBe(null);
});

test('Should not allow a non authenticated user to upload a product image and delete it.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .post(`/api/systemAdmin/uploadProductImage/${productOne.id}`)
    .attach('productImage', 'tests/fixtures/image2.jpg');
  expect(response.status).toBe(401);

  // Assert that the product has an image
  const category = await prisma.productList.findUnique({
    where: { id: productOne.id },
  });
  expect(category?.image).toBe(null);
});

test('Should allow system admin to see all products from product list', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/systemAdmin/seeProducts?name=Penicillin&page=1`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the products match
  expect(response.body.products[0].id).toBe(productListPenicillin.id);
  expect(response.body.products[0].name).toBe(productListPenicillin.name);
});

test('Should not allow an unauthorized user to see the product list.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/systemAdmin/seeProducts?name=Penicillin&page=1`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow system admin to see a product from the product list', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/systemAdmin/seeProduct/${productListPenicillin.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the products match
  expect(response.body.id).toBe(productListPenicillin.id);
  expect(response.body.name).toBe(productListPenicillin.name);
});

test('Should not allow an unauthorized user to see a product from the product list.', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/systemAdmin/seeProduct/${productListPenicillin.id}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow a non system admin to see all pharmacies', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/systemAdmin/allPharmacies?name=messa&page=1`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthorized user to see all pharmacies', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/systemAdmin/allPharmacies?name=messa&page=1`)
    .send();
  expect(response.status).toBe(401);
});

test('Should allow system admin to see all system admins', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .get(`/api/systemAdmin`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the system admin match
  expect(response.body[0].id).toBe(systemAdmin.id);
  expect(response.body[0].name).toBe(systemAdmin.name);
  expect(response.body[0].email).toBe(systemAdmin.email);
});

test('Should not allow a non system admin to see all system admins', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .get(`/api/systemAdmin`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);
});

test('Should not allow an unauthorized user to see all system admins', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).get(`/api/systemAdmin`).send();
  expect(response.status).toBe(401);
});

test('Should allow system admin to update a pharmacy', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin/updatePharmacy/${pharmacy.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'new name for pharmacy de messa',
    });
  expect(response.status).toBe(200);

  // Assert that the data match.
  const updatedPharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacy.id },
  });
  expect(updatedPharmacy?.name).toBe('new name for pharmacy de messa');
});

test('Should not allow a non system admin to update a pharmacy', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin/updatePharmacy/${pharmacy.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      name: 'new name for pharmacy de messa',
    });
  expect(response.status).toBe(401);

  // Assert that the data did not change.
  const updatedPharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacy.id },
  });
  expect(updatedPharmacy?.name).toBe(pharmacy.name);
});

test('Should not allow an unauthorized user to update a pharmacy', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin/updatePharmacy/${pharmacy.id}`)
    .send({
      name: 'new name for pharmacy de messa',
    });
  expect(response.status).toBe(401);

  // Assert that the data did not change.
  const updatedPharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacy.id },
  });
  expect(updatedPharmacy?.name).toBe(pharmacy.name);
});

test('Should allow system admin to update a product from the product list', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin/updateProduct/${productListPenicillin.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'new name for penicillin',
    });
  expect(response.status).toBe(200);

  // Assert that the data match.
  const updatedProduct = await prisma.productList.findUnique({
    where: { id: productListPenicillin.id },
  });
  expect(updatedProduct?.name).toBe('new name for penicillin');
});

test('Should not allow a non system admin to update a product from the product list', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin/updateProduct/${productListPenicillin.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      name: 'new name for penicillin',
    });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedProduct = await prisma.productList.findUnique({
    where: { id: productListPenicillin.id },
  });
  expect(updatedProduct?.name).toBe(productListPenicillin.name);
});

test('Should not allow an unauthenticated user to update a product from the product list', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin/updateProduct/${productListPenicillin.id}`)
    .send({
      name: 'new name for penicillin',
    });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedProduct = await prisma.productList.findUnique({
    where: { id: productListPenicillin.id },
  });
  expect(updatedProduct?.name).toBe(productListPenicillin.name);
});

test('Should allow system admin to update a product category', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin/updateProductCategory/${categoryAntibiotic.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'new name for antibiotic category',
      description: 'This is a new description',
    });
  expect(response.status).toBe(200);

  // Assert that the data match.
  const updatedCategory = await prisma.productCategory.findUnique({
    where: { id: categoryAntibiotic.id },
  });
  expect(updatedCategory?.name).toBe('new name for antibiotic category');
});

test('Should not allow a non system admin to update a product category', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin/updateProductCategory/${categoryAntibiotic.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      name: 'new name for antibiotic category',
      description: 'This is a new description',
    });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedCategory = await prisma.productCategory.findUnique({
    where: { id: categoryAntibiotic.id },
  });
  expect(updatedCategory?.name).toBe(categoryAntibiotic.name);
});

test('Should not allow an unthaurized user to update a product category', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin/updateProductCategory/${categoryAntibiotic.id}`)
    .send({
      name: 'new name for antibiotic category',
      description: 'This is a new description',
    });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedCategory = await prisma.productCategory.findUnique({
    where: { id: categoryAntibiotic.id },
  });
  expect(updatedCategory?.name).toBe(categoryAntibiotic.name);
});

test('Should allow system admin to update his information', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send({
      name: 'new name for system admin',
    });
  expect(response.status).toBe(200);

  // Assert that the data match.
  const updatedSystemAdmin = await prisma.systemAdmin.findUnique({
    where: { id: systemAdmin.id },
  });
  expect(updatedSystemAdmin?.name).toBe('new name for system admin');
});

test('Should not allow a non system admin to update his information', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .put(`/api/systemAdmin`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send({
      name: 'new name for system admin',
    });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedSystemAdmin = await prisma.systemAdmin.findUnique({
    where: { id: systemAdmin.id },
  });
  expect(updatedSystemAdmin?.name).toBe(systemAdmin.name);
});

test('Should not allow an unauthorized user to update his information', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app).put(`/api/systemAdmin`).send({
    name: 'new name for system admin',
  });
  expect(response.status).toBe(401);

  // Assert that the data match.
  const updatedSystemAdmin = await prisma.systemAdmin.findUnique({
    where: { id: systemAdmin.id },
  });
  expect(updatedSystemAdmin?.name).toBe(systemAdmin.name);
});

test('Should allow system admin to delete a pharmacy', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .delete(`/api/systemAdmin/deletePharmacy/${pharmacy.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data match.
  const deletedPharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacy.id },
  });
  const deletedPharmacyAdmins = await prisma.pharmacyAdmin.findMany({
    where: { associatedPharmacy: pharmacy.id },
  });
  const deletedCachiers = await prisma.cachier.findMany({
    where: { associatedPharmacy: pharmacy.id },
  });
  const deletedProducts = await prisma.product.findMany({
    where: { pharmacySelling: pharmacy.id },
  });
  expect(deletedPharmacy).toBe(null);
  expect(deletedPharmacyAdmins?.length).toBe(0);
  expect(deletedCachiers?.length).toBe(0);
  expect(deletedProducts?.length).toBe(0);
});

test('Should not allow a non system admin to delete a pharmacy', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .delete(`/api/systemAdmin/deletePharmacy/${pharmacy.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data match.
  const deletedPharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacy.id },
  });
  expect(deletedPharmacy?.name).toBe(pharmacy.name);
});

test('Should not allow an unathenticated user to delete a pharmacy', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .delete(`/api/systemAdmin/deletePharmacy/${pharmacy.id}`)
    .send();

  expect(response.status).toBe(401);

  // Assert that the data match.
  const deletedPharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacy.id },
  });
  expect(deletedPharmacy?.name).toBe(pharmacy.name);
});

test('Should allow system admin to delete a product from the product list', async () => {
  // Assert that a 200 status code is returned.
  const response = await request(app)
    .delete(`/api/systemAdmin/deleteProduct/${productListPenicillin.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data match.
  const deletedProduct = await prisma.productList.findUnique({
    where: { id: productListPenicillin.id },
  });
  expect(deletedProduct).toBe(null);
});

test('Should not allow a non system admin to delete a product from the product list', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .delete(`/api/systemAdmin/deleteProduct/${productListPenicillin.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data match.
  const deletedProduct = await prisma.productList.findUnique({
    where: { id: productListPenicillin.id },
  });
  expect(deletedProduct?.id).toBe(productListPenicillin.id);
});

test('Should not allow an unauthenticated user to delete a product from the product list', async () => {
  // Assert that a 401 status code is returned.
  const response = await request(app)
    .delete(`/api/systemAdmin/deleteProduct/${productListPenicillin.id}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data match.
  const deletedProduct = await prisma.productList.findUnique({
    where: { id: productListPenicillin.id },
  });
  expect(deletedProduct?.id).toBe(productListPenicillin.id);
});

test('Should allow system admin to delete a product category', async () => {
  // Foreign key setup
  await prisma.product.deleteMany({});
  await prisma.productList.deleteMany({});

  // Assert that a 200 status code is returned.
  const response = await request(app)
    .delete(`/api/systemAdmin/deleteProductCategory/${categoryAntibiotic.id}`)
    .set('Authorization', `Bearer ${systemAdminAccessToken}`)
    .send();
  expect(response.status).toBe(200);

  // Assert that the data match.
  const deletedCategory = await prisma.productCategory.findUnique({
    where: { id: categoryAntibiotic.id },
  });
  expect(deletedCategory).toBe(null);
});

test('Should not allow a non system admin to delete a product category', async () => {
  // Foreign key setup
  await prisma.product.deleteMany({});
  await prisma.productList.deleteMany({});

  // Assert that a 401 status code is returned.
  const response = await request(app)
    .delete(`/api/systemAdmin/deleteProductCategory/${categoryAntibiotic.id}`)
    .set('Authorization', `Bearer ${pharmacyAdminAccessToken}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data match.
  const deletedCategory = await prisma.productCategory.findUnique({
    where: { id: categoryAntibiotic.id },
  });
  expect(deletedCategory?.id).toBe(categoryAntibiotic.id);
});

test('Should not allow an unauthenticated user to delete a product category', async () => {
  // Foreign key setup
  await prisma.product.deleteMany({});
  await prisma.productList.deleteMany({});

  // Assert that a 401 status code is returned.
  const response = await request(app)
    .delete(`/api/systemAdmin/deleteProductCategory/${categoryAntibiotic.id}`)
    .send();
  expect(response.status).toBe(401);

  // Assert that the data match.
  const deletedCategory = await prisma.productCategory.findUnique({
    where: { id: categoryAntibiotic.id },
  });
  expect(deletedCategory?.id).toBe(categoryAntibiotic.id);
});
