
const Product = require('../models/product');
const mongodb = require('mongodb');
const file = require('../utils/file');
const { validationResult } = require('express-validator/check');

exports.getAddProduct = (req, res, next) => {


    res.render('admin/edit-product',
        {
            pageTitle: 'Add-Product',
            path: '/admin/add-product',
            editing: false,
            hasError: false,
            errorMsg: null,
            isAuth: req.session.isLoggedIn,
            validateErrors: []
        });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file
    const price = req.body.price;
    const disc = req.body.disc;
    console.log('addd post');
    console.log(image);
    if (!image) {

        return res.status(422).render('admin/edit-product',
            {
                pageTitle: 'Add-Product',
                path: '/admin/edit-product',
                editing: false,
                hasError: true,
                product: {
                    title: title,
                    price: price,
                    disc: disc
                },
                errorMsg: "Attached File is not images",
                isAuth: req.session.isLoggedIn,
                validateErrors: []
            });
    }
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product',
            {
                pageTitle: 'Add-Product',
                path: '/admin/edit-product',
                editing: false,
                hasError: true,
                product: {
                    title: title,
                    price: price,
                    disc: disc
                },
                errorMsg: errors.array()[0].msg,
                isAuth: req.session.isLoggedIn,
                validateErrors: errors.array()
            });
    }

    const imageUrl = image.path;

    const product = new Product({
        title: title,
        price: price,
        imgurl: imageUrl,
        disc: disc,
        userId: req.user
    });
    product.save()
        .then((result) => {
            console.log('created');
            res.redirect('/admin/products');
        }).catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });
}

exports.getEditProduct = (req, res, next) => {
    const editmode = req.query.edit;
    if (!editmode) {
        return redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                return redirect('/');
            }
            res.render('admin/edit-product',
                {
                    pageTitle: 'Edit-Product',
                    path: '/admin/edit-product',
                    editing: editmode,
                    product: product,
                    hasError: false,
                    errorMsg: null,
                    validateErrors: [],
                    isAuth: req.session.isLoggedIn
                });
        }).catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });
}

exports.postEditProdcut = (req, res, next) => {

    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedPrice = req.body.price;
    const updatedDesc = req.body.disc;

    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product',
            {
                pageTitle: 'Edit-Product',
                path: '/admin/edit-product',
                editing: true,
                hasError: true,
                product: {
                    title: updatedTitle,
                    imgurl: updatedImgUrl,
                    price: updatedPrice,
                    disc: updatedDesc,
                    _id: prodId
                },
                validateErrors: errors.array(),
                errorMsg: errors.array()[0].msg,
                isAuth: req.session.isLoggedIn
            });
    }


    Product.findById(prodId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        if (image) {
            file.deleteFile(product.imgurl);
            product.imgurl = image.path;
        }
        product.disc = updatedDesc;

        return product.save()
            .then(result => {
                res.redirect('/admin/products');
            });
    })
        .catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });


}

exports.getProducts = (req, res, next) => {
    // Product.findAll()
    Product.find({ userId: req.user._id }).then(products => {
        res.render('admin/products',
            {
                pageTitle: 'Admin Products',
                prods: products,
                path: '/admin/products ',
                isAuth: req.session.isLoggedIn
            });
    })
        .catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return next(new Error('product not found'));
            }
            file.deleteFile(product.imgurl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id })
        })
        .then(() => {
            console.log('product is deleted');
            res.redirect('/admin/products');
        })
        .catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            return next(errr);
        });


}