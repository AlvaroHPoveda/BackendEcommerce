const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// Models
const { Users } = require('../models/users.model');
const { Products } = require('../models/products.model');
const { Orders } = require('../models/orders.model');

// Utils
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');

exports.createNewUser = catchAsync(
  async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(
        new AppError(
          400,
          'Must provide a valid username, email, password'
        )
      );
    }

    const salt = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    const newUsers = await Users.create({
      username,
      email,
      password: hashedPassword
    });

    newUsers.password = undefined;

    res.status(201).json({
      status: 'success',
      data: { newUsers }
    });
  }
);
exports.getProductsME = catchAsync(
  async (req, res, next) => {
    const { id } = req.currentUser;

    const users = await Users.findAll({
      where: { status: 'active', id },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Products,
          where: { status: 'active' }
        }
      ]
    });
    res.status(200).json({
      status: 'sucess',
      data: { users }
    });
  }
);
exports.getUsersById = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const users = await Users.findOne({
      where: { id },
      attributes: { exclude: ['password'] }
    });

    if (!users) {
      return next(new AppError(404, 'User not found'));
    }

    res.status(200).json({
      status: 'success',
      data: { users }
    });
  }
);
exports.updateUser = catchAsync(async (req, res, next) => {
  const endpoint = +req.params.id;
  const { id } = req.currentUser;

  if (endpoint === id) {
    const { username, email } = req.body;
    const data = {
      username,
      email
    };
    const users = await Users.findOne({
      where: { id: id, status: 'active' }
    });

    if (!users) {
      return next(
        new AppError(404, 'Cant update user, invalid ID')
      );
    }

    await users.update({ ...data });

    res.status(200).json({ status: 'success' });
  } else {
    return next(
      new AppError(
        404,
        'You do not have permissions to update this user'
      )
    );
  }
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const endpoint = +req.params.id;
  const { id } = req.currentUser;

  if (endpoint === id) {
    const users = await Users.findOne({
      where: { id: id, status: 'active' }
    });

    if (!users) {
      return next(
        new AppError(404, 'Cant delete user, invalid ID')
      );
    }
    await users.update({ status: 'deleted' });

    res.status(204).json({ status: 'success' });
  } else {
    return next(
      new AppError(
        404,
        'You do not have permissions to update this user'
      )
    );
  }
});
exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //Find user given an email and has status active
  const user = await Users.findOne({
    where: { email, status: 'active' }
  });

  //Compare entered password vs hashed password
  if (
    !user ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return next(
      new AppError(400, 'Credentials arer invalid')
    );
  }

  //Create JWT
  const token = await jwt.sign(
    { id: user.id }, //Token payload
    process.env.JWT_SECRET, //Secret key
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );

  res.status(200).json({
    status: 'success',
    data: { token }
  });
});
exports.getAllOrders = catchAsync(
  async (req, res, next) => {
    const { id } = req.currentUser;

    const orders = await Orders.findAll({
      where: { status: 'active', userId: id }
    });

    if (!orders) {
      return next(new AppError(404, 'Order not found'));
    }

    res.status(200).json({
      status: 'sucess',
      data: orders
    });
  }
);
exports.getOrdersById = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const orders = await Orders.findOne({
      where: { id }
    });

    if (!orders) {
      return next(new AppError(404, 'Order not found'));
    }

    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  }
);
