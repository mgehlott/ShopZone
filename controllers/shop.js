const fs = require('fs');
const path = require('path');
const PDFdoucment = require('pdfkit');

const Product = require('../models/product');

const Order = require('../models/order');
let ITEM_PER_PAGE = 2;


exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalProduct;
    Product.find()
        .count()
        .then(numProduct => {
            totalProduct = numProduct;
            return Product.find()
                .skip((page - 1) * ITEM_PER_PAGE)
                .limit(ITEM_PER_PAGE);
        })
        .then(products => {
            // console.log(products);
            res.render('shop/index',
                {
                    pageTitle: 'Products',
                    prods: products,
                    path: '/products',
                    currentPage: page,
                    hasNextPage: ITEM_PER_PAGE * page < totalProduct,
                    hasPrevPage: page > 1,
                    nextPage: page + 1,
                    prevPage: page - 1,
                    lastPage: Math.ceil((totalProduct) / ITEM_PER_PAGE)
                });
        }).catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });

}

exports.getProductDetails = (req, res, next) => {
    const prodId = req.params.productId;
    console.log('prod id', prodId);
    Product.findById(prodId).then(product => {
        res.render('shop/product-details', {
            product: product,
            path: '/products',
            pageTitle: product.title,
            isAuth: req.session.isLoggedIn
        })

    });

}

exports.getIndex = (req, res, next) => {

    const page = +req.query.page || 1;
    let totalProduct;
    Product.find()
        .count()
        .then(numProduct => {
            totalProduct = numProduct;
            return Product.find()
                .skip((page - 1) * ITEM_PER_PAGE)
                .limit(ITEM_PER_PAGE);
        })
        .then(products => {
            // console.log(products);
            res.render('shop/index',
                {
                    pageTitle: 'Shop',
                    prods: products,
                    path: '/',
                    currentPage: page,
                    hasNextPage: ITEM_PER_PAGE * page < totalProduct,
                    hasPrevPage: page > 1,
                    nextPage: page + 1,
                    prevPage: page - 1,
                    lastPage: Math.ceil((totalProduct) / ITEM_PER_PAGE)
                });
        }).catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });
}

exports.getCart = (req, res, next) => {

    console.log('get cart inside');
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            console.log('*********', products);
            res.render('shop/cart',
                {
                    pageTitle: 'Cart',
                    path: '/cart',
                    products: products,
                    isAuth: req.session.isLoggedIn
                })
        })
        .catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });

}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    console.log('inside post cart', prodId);
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        });



}

exports.postDeleteCartProduct = (req, res, next) => {

    const prodId = req.body.productId;
    req.user
        .deleteCartItem(prodId)
        .then(result => {
            console.log('in delete', result);
            res.redirect('/cart');
        })
        .catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });

}

exports.postOrder = (req, res, next) => {

    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then((result) => {
            return req.user.clearCart();
        }).then(() => {
            res.redirect('/orders');

        })
        .catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });
}

exports.getOrders = (req, res, next) => {
    Order.find({ "user.userId": req.user._id })
        .then(orders => {
            console.log('******', orders);
            res.render('shop/orders',
                {
                    pageTitle: 'Your Orders',
                    path: '/orders',
                    orders: orders,
                    isAuth: req.session.isLoggedIn
                }
            );
        })
        .catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });

}

exports.getCheckout = (req, res, next) => {
    res.render('shop/chekout',
        {
            pageTitle: 'Checkout',
            path: '/checkout'
        }
    )
}

exports.getInvoice = (req, res, next) => {

    const orderId = req.params.orderId;
    console.log('ivice', orderId);

    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error("No order Found"));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error("Unauthrizid"));
        }

        const invoiceName = 'invoice-' + orderId + '.pdf';
        const ipath = path.join('data', 'invoices', invoiceName);
        //   var file = fs.createReadStream(ipath);
        // var stat = fs.statSync(ipath);
        const pdfDoc = new PDFdoucment();
        //  res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        //  file.pipe(res);
        pdfDoc.pipe(fs.createWriteStream(ipath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(30).text('Invoice');
        pdfDoc.text('======================');
        console.log('order is ', order);
        let totalPrice = 0;
        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price;
            console.log(totalPrice);
            pdfDoc.fontSize(20).text(prod.product.title);
            console.log(prod.product.title);
        });
        pdfDoc.text('========');
        pdfDoc.fontSize(24).text("Total Price : " + totalPrice);
        // console.log(totalPrice);
        pdfDoc.end();

    })
        .catch(err => next(err));


    //res.send(file);
    // res.setHeader('Content-Type', 'plain/text');
    //   res.setHeader('Content-Disposition', 'inline');
    // res.send(data);
}

