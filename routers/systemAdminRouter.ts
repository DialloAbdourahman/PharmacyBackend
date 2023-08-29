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
router.post('/login', loginSystemAdmin); // Tested.
router.post('/token', refreshToken); // Tested.
router.post('/logout', auth, logout); // Tested.
router.post('/createPharmacy', auth, createPharmacy); // Tested.
router.post('/createProduct', auth, createProduct); // Tested.
router.post('/createProductCategory', auth, createCategory); // Tested.
router.post(
  '/uploadProductCategoryImage/:id',
  auth,
  upload.single('categoryImage'),
  productCategoryImageUpload,
  (error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(400).json({ message: error.message });
  }
); // Tested.
router.post(
  '/uploadProductImage/:id',
  auth,
  upload.single('productImage'),
  uploadProductImage,
  (error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(400).json({ message: error.message });
  }
); // Tested.
router.post('/', auth, createSystemAdmin); // Tested.

// READ ROUTES
router.get('/seeProducts', auth, seeProducts); // Tested.
router.get('/seeProduct/:id', auth, seeProduct); // Tested.
router.get('/allPharmacies', auth, allPharmacies); // Tested.
router.get('/', auth, allSystemAdmins); // Tested

// UPDATE ROUTES
router.put('/updatePharmacy/:id', auth, updatePharmacy); // Tested.
router.put('/updateProduct/:id', auth, updateProduct); // Tested.
router.put('/updateProductCategory/:id', auth, updateCategory); // Tested.
router.put('/', auth, updateSystemAdmin); // Tested.

// DELETE ROUTES
router.delete('/deletePharmacy/:id', auth, deletePharmacy); // Tested.
router.delete('/deleteProduct/:id', auth, deleteProduct); // Tested.
router.delete('/deleteProductCategory/:id', auth, deleteCategory); // Tested.
router.delete('/deleteCategoryImage/:id', auth, deleteCategoryImage); // Tested.
router.delete('/deleteProductImage/:id', auth, deleteProductImage); // Tested

module.exports = router;
