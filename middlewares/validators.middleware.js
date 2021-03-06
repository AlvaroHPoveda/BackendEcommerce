const {
  body,
  validationResult
} = require('express-validator');

// Utils
const { AppError } = require('../util/appError');
const { catchAsync } = require('../util/catchAsync');

// Users validations
exports.createUserValidations = [
  body('username')
    .isString()
    .withMessage('User name must be a string')
    .notEmpty()
    .withMessage('Must provide a valid User name'),
  body('email')
    .isString()
    .withMessage('email must be a string')
    .notEmpty()
    .withMessage('Must provide a valid email'),
  body('password')
    .isString()
    .withMessage('password must be a string')
    .notEmpty()
    .withMessage('Must provide a valid password')
];
// END: Users validations

// Products validations
exports.createProductValidations = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Must provide a valid title'),
  body('description')
    .isString()
    .withMessage('Description must be a string')
    .notEmpty()
    .withMessage('Must provide a valid description'),
  body('quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((value) => value > 0)
    .withMessage('Quantity must be greater than 0'),
  body('price')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((value) => value > 0)
    .withMessage('Quantity must be greater than 0')
];

// END: Products validations

exports.validateResult = catchAsync(
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMsg = errors
        .array()
        .map(({ msg }) => msg)
        .join('. ');

      return next(new AppError(400, errorMsg));
    }

    next();
  }
);
