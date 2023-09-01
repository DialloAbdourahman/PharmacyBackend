import { Prisma, PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = require('../../utils/prismaClient');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../../utils/generateAuthToken');

const systemAdminRole = {
  name: 'systemAdmin',
  description: 'This is the person who controls the whole application.',
};

const pharmacyAdminRole = {
  name: 'pharmacyAdmin',
  description: 'This is the person who manages ad controls a pharmacy.',
};

const cachierRole = {
  name: 'cachier',
  description: 'This is the person who manages the sales of the pharmacy.',
};

const customerRole = {
  name: 'customer',
  description: 'This is the person who buys medications..',
};

const systemAdmin = {
  id: '1234',
  name: 'Diallo Abdourahman',
  email: 'dialliabdourahman78@gmail.com',
  password: 'diallo1234',
  creator: null,
};
let systemAdminRefreshToken = generateRefreshToken(
  {
    id: systemAdmin.id,
    name: systemAdmin.name,
    email: systemAdmin.email,
    titleName: systemAdminRole.name,
    creator: null,
  },
  process.env.JWT_REFRESH_TOKEN_SECRET_SYSTEM_ADMIN
);
let systemAdminAccessToken = generateAccessToken(
  {
    id: systemAdmin.id,
    name: systemAdmin.name,
    email: systemAdmin.email,
    titleName: systemAdminRole.name,
    creator: null,
  },
  process.env.JWT_ACCESS_TOKEN_SECRET_SYSTEM_ADMIN
);

const pharmacy = {
  id: '1234',
  name: 'Pharmacy de Messa',
  email: 'pharmacydemessa@gmmail.com',
  phoneNumber: '677538950',
  address: 'Messa yaounde',
  hourly: '8:00 - 18:00',
  allNight: true,
  creator: systemAdmin.id,
  latitude: 3.872225,
  longitude: 11.504342,
};

const pharmacyAdmin = {
  id: '1234',
  name: 'Eren Yager',
  email: 'eren@gmail.com',
  password: 'eren1234',
};
let pharmacyAdminRefreshToken = generateRefreshToken(
  {
    id: pharmacyAdmin.id,
    name: pharmacyAdmin.name,
    email: pharmacyAdmin.email,
    titleName: pharmacyAdminRole.name,
    associatedPharmacy: pharmacy.id,
  },
  process.env.JWT_REFRESH_TOKEN_SECRET_PHARMACY_ADMIN
);
let pharmacyAdminAccessToken = generateAccessToken(
  {
    id: pharmacyAdmin.id,
    name: pharmacyAdmin.name,
    email: pharmacyAdmin.email,
    titleName: pharmacyAdminRole.name,
    associatedPharmacy: pharmacy.id,
  },
  process.env.JWT_ACCESS_TOKEN_SECRET_PHARMACY_ADMIN
);

const cachier = {
  id: '1234',
  name: 'Armin Arlelt',
  email: 'armin@gmail.com',
  creator: pharmacyAdmin.id,
  associatedPharmacy: pharmacy.id,
  password: 'armin1234',
};
let cachierRefreshToken = generateRefreshToken(
  {
    id: cachier.id,
    name: cachier.name,
    email: cachier.email,
    titleName: cachierRole.name,
    associatedPharmacy: pharmacy.id,
  },
  process.env.JWT_REFRESH_TOKEN_SECRET_CACHIER
);
let cachierAccessToken = generateAccessToken(
  {
    id: cachier.id,
    name: cachier.name,
    email: cachier.email,
    titleName: cachierRole.name,
    associatedPharmacy: pharmacy.id,
  },
  process.env.JWT_ACCESS_TOKEN_SECRET_CACHIER
);

const customer = {
  id: '1234',
  name: 'Mikassa Akerman',
  email: 'mikassa@gmail.com',
  password: 'mikassa1234',
};
let customerRefreshToken = generateRefreshToken(
  {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    titleName: customerRole.name,
    associatedPharmacy: pharmacy.id,
  },
  process.env.JWT_REFRESH_TOKEN_SECRET_CUSTOMER
);
let customerAccessToken = generateAccessToken(
  {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    titleName: customerRole.name,
    associatedPharmacy: pharmacy.id,
  },
  process.env.JWT_ACCESS_TOKEN_SECRET_CUSTOMER
);

const categoryPrescription = {
  id: '1234',
  name: 'Prescription drugs',
  description: 'These are prescription drugs.',
};

const categoryAntibiotic = {
  id: '5678',
  name: 'Antibiotic drugs',
  description: 'These are antibiotic drugs.',
};

const productListDoliprane = {
  id: '1234',
  name: 'Doliprane 1000mg',
  description: 'Used to treat headaches',
  normalPrice: 1000,
  category: categoryPrescription.id,
};
const productListPenicillin = {
  id: '5678',
  name: 'Penicillin',
  description: 'Used to treat malaria',
  normalPrice: 1500,
  category: categoryAntibiotic.id,
};

const productOne = {
  id: '1234',
  price: 1000,
  amount: 5,
  product: productListDoliprane.id,
  pharmacySelling: pharmacy.id,
};

const productTwo = {
  id: '5678',
  price: 1600,
  amount: 50,
  product: productListPenicillin.id,
  pharmacySelling: pharmacy.id,
};

const orderOne = {
  id: '1234',
  quantity: 3,
  price: productOne.price,
  fulfilled: true,
  productId: productOne.id,
  customerId: customer.id,
};
const orderTwo = {
  id: '5678',
  price: productTwo.price,
  quantity: 3,
  fulfilled: true,
  productId: productTwo.id,
  customerId: customer.id,
};

const saleOne = {
  id: '1234',
  quantity: 1,
  price: productOne.price,
  productId: productOne.id,
  cachierId: cachier.id,
};

const saleTwo = {
  id: '5678',
  quantity: 3,
  price: productTwo.price,
  productId: productTwo.id,
  cachierId: cachier.id,
};

const setupDatabase = async () => {
  // Deleting
  await prisma.order.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.pharmacy.deleteMany({});
  await prisma.cachier.deleteMany({});
  await prisma.pharmacyAdmin.deleteMany({});
  await prisma.systemAdmin.deleteMany({});
  await prisma.userType.deleteMany({});
  await prisma.productList.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.complain.deleteMany({});

  // Roles
  await prisma.userType.create({ data: systemAdminRole });
  await prisma.userType.create({ data: pharmacyAdminRole });
  await prisma.userType.create({ data: cachierRole });
  await prisma.userType.create({ data: customerRole });

  // System admin
  await prisma.systemAdmin.create({
    data: {
      ...systemAdmin,
      password: await bcrypt.hash(systemAdmin.password, 8),
      refreshToken: systemAdminRefreshToken,
    },
  });

  // Pharmacy and pharmacy admin
  await prisma.pharmacy.create({
    data: {
      ...pharmacy,
      pharmacyAdmin: {
        create: {
          id: pharmacyAdmin.id,
          name: pharmacyAdmin.name,
          email: pharmacyAdmin.email,
          password: await bcrypt.hash(pharmacyAdmin.password, 8),
          creator: systemAdmin.id,
          refreshToken: pharmacyAdminRefreshToken,
        },
      },
    },
  });

  // Cashier
  await prisma.cachier.create({
    data: {
      ...cachier,
      password: await bcrypt.hash(cachier.password, 8),
      refreshToken: cachierRefreshToken,
    },
  });

  // Customer
  await prisma.customer.create({
    data: {
      ...customer,
      password: await bcrypt.hash(customer.password, 8),
      refreshToken: customerRefreshToken,
    },
  });

  // Product categories
  await prisma.productCategory.create({ data: categoryPrescription });
  await prisma.productCategory.create({ data: categoryAntibiotic });

  // Product List
  await prisma.productList.create({ data: productListDoliprane });
  await prisma.productList.create({ data: productListPenicillin });

  // Product
  await prisma.product.create({ data: productOne });
  await prisma.product.create({ data: productTwo });

  // Order
  await prisma.order.create({ data: orderOne });
  await prisma.order.create({ data: orderTwo });

  // Sale
  await prisma.sale.create({ data: saleOne });
  await prisma.sale.create({ data: saleTwo });
};

module.exports = {
  setupDatabase,
  systemAdmin,
  pharmacyAdmin,
  cachier,
  customer,
  pharmacy,
  systemAdminAccessToken,
  systemAdminRefreshToken,
  pharmacyAdminAccessToken,
  pharmacyAdminRefreshToken,
  cachierAccessToken,
  cachierRefreshToken,
  customerAccessToken,
  customerRefreshToken,
  categoryAntibiotic,
  productOne,
  productTwo,
  productListPenicillin,
  productListDoliprane,
  orderOne,
  saleOne,
  categoryPrescription,
};
