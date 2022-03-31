const express = require('express');

// Controllers
const {
  createNewUser,
  getProductsME,
  getUsersById,
  updateUser,
  deleteUser,
  loginUser,
  getAllOrders,
  getOrdersById
} = require('../controllers/users.controller');

// Middleware
const {
  validateSession
} = require('../middlewares/auth.middleware');
const {
  createUserValidations,
  validateResult
} = require('../middlewares/validators.middleware');

const router = express.Router();

router.post(
  '/',
  createUserValidations,
  validateResult,
  createNewUser
);
router.post('/login', loginUser);

router.use(validateSession);

router.get('/me', getProductsME);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrdersById);
router.get('/:id', getUsersById);

module.exports = { usersRouter: router };
