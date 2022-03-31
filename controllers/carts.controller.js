// Models
const { Carts } = require('../models/carts.model');
const { Products } = require('../models/products.model');
const { Orders } = require('../models/orders.model');
const {
  ProductsInCart
} = require('../models/productsInCart.model');

// Utils
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');

exports.addProductCart = catchAsync(
  async (req, res, next) => {
    const { id } = req.currentUser;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return next(
        new AppError(
          400,
          'Must provide an productId and quantity'
        )
      );
    }

    let cart;
    const userId = id;

    cart = await Carts.findOne({
      where: { status: 'active', userId }
    });

    if (!cart) {
      cart = await Carts.create({
        userId
      });
    }

    const product = await Products.findOne({
      where: { status: 'active', id: productId }
    });

    if (product.quantity < quantity) {
      return next(
        new AppError(
          400,
          'Quantity of attached product is greater than the quantity of existing product'
        )
      );
    }

    const cartWhiteProducts = await ProductsInCart.create({
      cartId: cart.id,
      productId,
      quantity
    });

    res.status(201).json({
      status: { cartWhiteProducts, cart }
    });
  }
);
exports.updateProductCart = catchAsync(
  async (req, res, next) => {
    const { id } = req.currentUser;
    const userId = id;

    const cart = await Carts.findOne({
      where: { status: 'active', userId }
    });

    const { quantity, productId } = req.body;

    const data = {
      quantity,
      productId
    };

    const carts = await ProductsInCart.findOne({
      where: {
        status: 'active',
        cartId: cart.id,
        productId
      }
    });

    if (!carts) {
      return next(
        new AppError(404, 'Cant update cart, invalid ID')
      );
    }

    const product = await Products.findOne({
      where: { status: 'active', id: productId }
    });

    if (product.quantity < quantity) {
      return next(
        new AppError(
          400,
          'Quantity of attached product is greater than the quantity of existing product'
        )
      );
    } else if (quantity === 0) {
      await carts.update({ status: 'deleted' });
    }

    await carts.update({ ...data });

    res
      .status(200)
      .json({ status: 'success', data: carts });
  }
);
exports.deleteProductCart = catchAsync(
  async (req, res, next) => {
    const { productid } = req.params;

    const { cartId } = req.body;

    const productsincart = await ProductsInCart.findOne({
      where: {
        productId: productid,
        cartId,
        status: 'active'
      }
    });

    if (!productsincart) {
      return next(
        new AppError(404, 'Cant delete product, invalid ID')
      );
    }
    await productsincart.update({ status: 'deleted' });

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  }
);
exports.purchaseProductCart = catchAsync(
  async (req, res, next) => {
    const { id } = req.currentUser;

    //------------------call tablets

    const cartUser = await Carts.findOne({
      where: { status: 'active', userId: id }
    });

    const elementincart = await ProductsInCart.findAll({
      where: { status: 'active', cartId: cartUser.id }
    });

    //----------------------------
    let totalPrice = 0;
    let price = 0;
    //-------------------------------

    //-----------------map

    const actualizacion = elementincart.map(
      async (product) => {
        const productCreated = await Products.findOne({
          where: { status: 'active', id: product.productId }
        });

        const subtractionQwt =
          productCreated.quantity - product.quantity;
        price = productCreated.price * product.quantity;
        totalPrice += price;

        if (subtractionQwt <= 0) {
          productCreated.update({
            status: 'deleted',
            quantity: 0
          });
        }

        await product.update({ status: 'purchase' });

        return await productCreated.update({
          quantity: subtractionQwt
        });
      }
    );

    //-----------------map

    await Promise.all(actualizacion);

    const order = await Orders.create({
      userId: id,
      cartId: cartUser.id,
      issuedAt: `${new Date()}`,
      totalPrice: totalPrice
    });

    await cartUser.update({ status: 'purchase' });
    res.status(201).json({
      status: 'sucess',
      data: {
        cartUser,
        elementincart,
        order
      }
    });
  }
);
