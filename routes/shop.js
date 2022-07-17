const express = require('express');
const path = require('path');
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');


const router = express.Router();


router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProductDetails);
router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);
// // router.get('/checkout', shopController.getCheckout);
router.post('/create-order', isAuth, shopController.postOrder);
router.get('/orders', isAuth, shopController.getOrders);
router.post('/delete-cart-item', isAuth, shopController.postDeleteCartProduct);

module.exports = router;