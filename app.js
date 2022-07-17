const express = require('express');
const bodyParse = require('body-parser');
const path = require('path');
const User = require('./models/user');
const mongoose = require('mongoose');
const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');
const authRouter = require('./routes/auth');
const errorController = require('./controllers/error');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');


//const sequelize = require('./utils/database');

const app = express();
const MONGO_URI = 'mongodb+srv://mgehlott:849551026@cluster0.s0hwb.mongodb.net/shop?retryWrites=true&w=majority';


const store = new MongoStore({
    uri: MONGO_URI,
    collection: 'mySession'
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(bodyParse.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my secret',
    store: store,
    resave: false,
    saveUninitialized: false
}));


app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            //console.log(user);
            req.user = user;
            next();
        }).catch(err => {
            console.log(err);
        });

});

app.use((req, res, next) => {
    res.locals.isAuth = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin', adminRouter);
app.use(shopRouter);
app.use(authRouter);
app.use(errorController.get404);

mongoose.connect(MONGO_URI)
    .then(result => {

        app.listen(5000, () => {
            console.log(
                'server is running at 5000'
            );
        });

    }).catch(err => {
        console.log(err);
    })





// const insert = async () => {

//     const db = await dbConnect();
//     const result = await db.insertMany([
//         {
//             model: 'i phone',
//             brand: 'Apple',
//             price: '45555',
//             category: 'mobile'
//         },
//         {
//             model: 'm 14',
//             brand: 'Samsung',
//             price: '15000',
//             category: 'mobile'
//         },
//         {
//             model: '9 lite',
//             brand: 'Honor',
//             price: '12999',
//             category: 'mobile'
//         }
//     ]);
//     if (result.acknowledged) {
//         console.log('Inserted Succesfull !!!');
//     }
//     else {
//         console.log("there is error");
//     }

// }
// //insert();

// const updateData = async () => {

//     const data = await dbConnect();
//     const result = await data.updateOne({ model: 'm14' }, { $set: { model: 'Galaxy' } });

// }

// //updateData();

// const deleteData = async () => {
//     const data = await dbConnect();
//     const result = await data.deleteOne({ brand: 'Techno' });
// }

// deleteData();
// //read form db

// dbConnect().then(t => {
//     return t.find({ brand: 'Nokia' }).toArray();
// }).then(d => {
//     console.log(d);
// })

// app.listen(3000, () => {
//     console.log('server is runing at 3000');
// })