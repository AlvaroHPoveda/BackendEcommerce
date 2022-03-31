const express = require('express');

// Controllers
const {
  addProductCart,
  updateProductCart,
  deleteProductCart,
  purchaseProductCart
} = require('../controllers/carts.controller');

// Middleware
const {
  validateSession
} = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(validateSession);

router.post('/add-product', addProductCart);
router.patch('/update-cart', updateProductCart);
router.delete('/:productid', deleteProductCart);
router.post('/purchase', purchaseProductCart);

module.exports = { cartsRouter: router };
