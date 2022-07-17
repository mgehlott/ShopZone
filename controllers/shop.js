
const Product = require('../models/product');

const Order = require('../models/order');


exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            //  console.log(products);
            throw new Error('not found');
            res.render('shop/product-list',
                {
                    pageTitle: 'Shop',
                    prods: products,
                    path: '/products',
                    isAuth: req.session.isLoggedIn
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

    Product.find().then(products => {
        // console.log(products);
        res.render('shop/index',
            {
                pageTitle: 'Shop',
                prods: products,
                path: '/',

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