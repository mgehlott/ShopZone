
const Product = require('../models/product');

const Order = require('../models/order');


exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            //  console.log(products);
            res.render('shop/product-list',
                {
                    pageTitle: 'Shop',
                    prods: products,
                    path: '/products',
                    isAuth: req.session.isLoggedIn
                });
        }).catch(err => {
            console.log(err);
        })

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
        console.log(err);
    })
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
            console.log(err);
        })

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

    // let fechedCart;
    // let newQuantity = 1;
    // req.user.getCart()
    //     .then(cart => {
    //         fechedCart = cart;
    //         return cart.getProducts({ where: { id: prodId } });
    //     })
    //     .then(products => {
    //         let product;
    //         if (products.length > 0) {
    //             product = products[0]
    //         }

    //         if (product) {
    //             const oldQuantity = product.cartItem.quantity;
    //             newQuantity = oldQuantity + 1;
    //             return product;
    //         }
    //         return Product.findByPk(prodId);
    //     })
    //     .then(product => {
    //         return fechedCart.addProduct(product, { through: { quantity: newQuantity } });
    //     })
    //     .then(() => {
    //         res.redirect('/cart');
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });


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
            result
            console.log(err);
        })

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
            console.log(err);
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
            console.log(err);
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