// Models
const { Carts } = require('../models/carts.model');
const { Orders } = require('../models/orders.model');
const { Products } = require('../models/products.model');
const {
  ProductsInCart
} = require('../models/productsInCart.model');
const { Users } = require('../models/users.model');

const initModels = () => {
  // 1 Users <----> M Products
  Users.hasMany(Products);
  Products.belongsTo(Users);

  // 1 Users <---> M Orders
  Users.hasMany(Orders);
  Orders.belongsTo(Users);

  // 1 Users <---> 1 Cart
  Users.hasOne(Carts);
  Carts.belongsTo(Users);

  // 1 Cart <---> 1 Orders
  Carts.hasOne(Orders);
  Orders.belongsTo(Carts);

  // M carts <---> M ProductsInCart
  Carts.belongsToMany(Products, {
    through: ProductsInCart
  });
  Products.belongsToMany(Carts, {
    through: ProductsInCart
  });

  // 1 Cart <---> M Orders
  Carts.hasMany(ProductsInCart);
  ProductsInCart.belongsTo(Carts);
};

module.exports = { initModels };
