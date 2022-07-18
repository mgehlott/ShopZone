
const express = require('express');
const path = require('path');

const adminController = require('../controllers/admin');

const router = express.Router();
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator/check');
console.log('router');


router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
    body('title')
        .isString()
        .isLength({ min: 3 }).trim(),
    body('disc').isLength({ min: 5, max: 400 }).trim()
], isAuth, adminController.postEditProdcut);
router.post('/add-product', [
    body('title')
        .isString()
        .isLength({ min: 3 }).trim(),
    body('price').notEmpty(),
    body('disc').isLength({ min: 5, max: 400 }).trim()
], isAuth, adminController.postAddProduct);

router.post('/delete-product', isAuth, adminController.deleteProduct);

module.exports = router;