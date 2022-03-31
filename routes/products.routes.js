const express = require('express');

// Controllers
const {
  createNewProduct,
  getAllProducts,
  getProductsById,
  updateProduct,
  deleteProduct
} = require('../controllers/products.controller');

const {
  validateSession
} = require('../middlewares/auth.middleware');

// Middleware
const {
  createProductValidations,
  validateResult
} = require('../middlewares/validators.middleware');

const router = express.Router();
router.use(validateSession);

router.post(
  '/',
  createProductValidations,
  validateResult,
  createNewProduct
);
router.get('/', getAllProducts);
router.get('/:id', getProductsById);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = { productsRouter: router };
