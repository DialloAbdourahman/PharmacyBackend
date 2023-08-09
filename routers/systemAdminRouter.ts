import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

// Importing controllers
const {
  createSystemAdmin,
  loginSystemAdmin,
  refreshToken,
  logout,
  updateSystemAdmin,
  allSystemAdmins,
  createPharmacy,
  deletePharmacy,
  updatePharmacy,
  createProduct,
  seeProducts,
  seeProduct,
  updateProduct,
  allPharmacies,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  productCategoryImageUpload,
  deleteCategoryImage,
  uploadProductImage,
  deleteProductImage,
} = require('../controllers/systemAdminController');

// Multer
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Additional imports
const { authSystemAdmin: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginSystemAdmin);
router.post('/token', refreshToken);
router.post('/logout', auth, logout);
router.post('/createPharmacy', auth, createPharmacy);
router.post('/createProduct', auth, createProduct);
router.post('/createProductCategory', auth, createCategory);
router.post(
  '/uploadProductCategoryImage/:id',
  auth,
  upload.single('categoryImage'),
  productCategoryImageUpload,
  (error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(400).json({ message: error.message });
  }
);
router.post(
  '/uploadProductImage/:id',
  auth,
  upload.single('productImage'),
  uploadProductImage,
  (error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(400).json({ message: error.message });
  }
);
router.post('/', auth, createSystemAdmin);

// READ ROUTES
router.get('/seeProducts', auth, seeProducts);
router.get('/seeProduct/:id', auth, seeProduct);
router.get('/allPharmacies', auth, allPharmacies);
router.get('/', auth, allSystemAdmins);

// UPDATE ROUTES
router.put('/updatePharmacy/:id', auth, updatePharmacy);
router.put('/updateProduct/:id', auth, updateProduct);
router.put('/updateProductCategory/:id', auth, updateCategory);
router.put('/', auth, updateSystemAdmin);

// DELETE ROUTES
router.delete('/deletePharmacy/:id', auth, deletePharmacy);
router.delete('/deleteProduct/:id', auth, deleteProduct);
router.delete('/deleteProductCategory/:id', auth, deleteCategory);
router.delete('/deleteCategoryImage/:id', auth, deleteCategoryImage);
router.delete('/deleteProductImage/:id', auth, deleteProductImage);

module.exports = router;
