const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema(
    {

        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        resetToken: String,
        resetTokenExpiration: Date,
        cart: {
            items: [
                {
                    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                    quantity: { type: Number, required: true }
                }
            ]
        }
    }
);

userSchema.methods.addToCart = function (product) {

    const cartItemIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });

    const updatedCartItem = [...this.cart.items];
    let newQuantity = 1;

    if (cartItemIndex >= 0) {
        newQuantity = this.cart.items[cartItemIndex].quantity + 1;
        updatedCartItem[cartItemIndex].quantity = newQuantity;
    }
    else {
        updatedCartItem.push(
            { productId: product._id, quantity: newQuantity }
        );
    }


    const updatedCart = { items: updatedCartItem };
    this.cart = updatedCart;
    return this.save();

}

userSchema.methods.deleteCartItem = function (productId) {
    const updatedCartItem = this.cart.items.filter(i => {
        return i.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItem;
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
}



module.exports = mongoose.model('User', userSchema);

// const getDb = require('../utils/database').getDb;
// const mongodb = require('mongodb');

// class User {

//     constructor(name, email, cart, id) {
//         this.name = name;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users')
//             .insertOne(this);
//     }

//     addToCart(product) {

//         const cartItemIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });

//         const updatedCartItem = [...this.cart.items];
//         let newQuantity = 1;

//         if (cartItemIndex >= 0) {
//             newQuantity = this.cart.items[cartItemIndex].quantity + 1;
//             updatedCartItem[cartItemIndex].quantity = newQuantity;
//         }
//         else {
//             updatedCartItem.push(
//                 { productId: new mongodb.ObjectId(product._id), quantity: newQuantity }
//             );
//         }


//         const updatedCart = { items: updatedCartItem };
//         const db = getDb();
//         return db.collection('users')
//             .updateOne(
//                 { _id: new mongodb.ObjectId(this._id) },
//                 { $set: { cart: updatedCart } }
//             );
//     }

//     getCart() {
//         const db = getDb();

//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         });
//         console.log(productIds);
//         return db
//             .collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(products => {
//                 console.log(products);
//                 return products.map(
//                     p => {
//                         return {
//                             ...p,
//                             quantity: this.cart.items.find(
//                                 i => {
//                                     return i.productId.toString() === p._id.toString();
//                                 }
//                             ).quantity
//                         }
//                     })
//             })


//     }

//     deleteCartItem(productId) {
//         const updatedCartItem = this.cart.items.filter(i => {
//             return i.productId.toString() !== productId.toString();
//         });
//         const db = getDb();
//         return db.collection('users')
//             .updateOne(
//                 { _id: new mongodb.ObjectId(this._id) },
//                 { $set: { cart: { items: updatedCartItem } } }
//             );

//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new mongodb.ObjectId(this._id),
//                         name: this.name
//                     }
//                 };
//                 return db.collection('orders')
//                     .insertOne(order)
//             })
//             .then(result => {
//                 this.cart = { itmes: [] }
//                 return db.collection('users')
//                     .updateOne(
//                         { _id: new mongodb.ObjectId(this._id) },
//                         { $set: { cart: { items: [] } } }
//                     );
//             })
//             .catch(err => {
//                 console.log(err);
//             })
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders')
//             .find({ 'user._id': new mongodb.ObjectId(this._id) })
//             .toArray();
//     }

//     static findUserById(userId) {
//         const db = getDb();
//         return db.collection('users')
//             .findOne({ _id: new mongodb.ObjectId(userId) });
//     }
// }



// module.exports = User;