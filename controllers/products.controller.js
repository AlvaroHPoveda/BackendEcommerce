// Models
const { Products } = require('../models/products.model');

// Utils
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');

exports.createNewProduct = catchAsync(
  async (req, res, next) => {
    const { id } = req.currentUser;
    const userId = id;
    const { title, description, quantity, price } =
      req.body;

    if (!title || !description || !quantity || !price) {
      return next(
        new AppError(
          400,
          'Must provide a valid title, description, quantity, price, userId'
        )
      );
    }
    const newProducts = await Products.create({
      title,
      description,
      quantity,
      price,
      userId
    });

    res.status(201).json({
      status: 'success',
      data: newProducts
    });
  }
);
exports.getAllProducts = catchAsync(
  async (req, res, next) => {
    const products = await Products.findAll({
      where: { status: 'active' }
    });

    if (!products) {
      return next(new AppError(404, 'Product not found'));
    }

    res.status(200).json({
      status: 'sucess',
      data: products
    });
  }
);
exports.getProductsById = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const products = await Products.findOne({
      where: { id }
    });

    if (!products) {
      return next(new AppError(404, 'Product not found'));
    }
    res.status(200).json({
      status: 'success',
      data: products
    });
  }
);
exports.updateProduct = catchAsync(
  async (req, res, next) => {
    const endpoint = +req.params.id;

    const products = await Products.findOne({
      where: { status: 'active', id: endpoint }
    });

    const { id } = req.currentUser;

    if (products.userId === id) {
      const {
        title,
        description,
        quantity,
        price,
        userId
      } = req.body;
      const data = {
        title,
        description,
        quantity,
        price,
        userId
      };
      const products = await Products.findOne({
        where: { id: id, status: 'active' }
      });

      if (!products) {
        return next(
          new AppError(
            404,
            'Cant update products, invalid ID'
          )
        );
      }

      await products.update({ ...data });

      res.status(200).json({ status: 'success' });
    } else {
      return next(
        new AppError(
          404,
          'You do not have permissions to update this product'
        )
      );
    }
  }
);
exports.deleteProduct = catchAsync(
  async (req, res, next) => {
    const endpoint = +req.params.id;

    const products = await Products.findOne({
      where: { status: 'active', id: endpoint }
    });

    const { id } = req.currentUser;

    if (products.userId === id) {
      const products = await Products.findOne({
        where: { id: id, status: 'active' }
      });

      if (!products) {
        return next(
          new AppError(
            404,
            'Cant delete product, invalid ID'
          )
        );
      }
      await products.update({ status: 'deleted' });

      res.status(204).json({ status: 'success' });
    } else {
      return next(
        new AppError(
          404,
          'You do not have permissions to update this Product'
        )
      );
    }
  }
);
