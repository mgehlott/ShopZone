const User = require("../models/user");
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGrid = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');

const transporter = nodemailer.createTransport(sendGrid({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }

    res.render('auth/login',
        {
            pageTitle: 'Login',
            path: '/login',
            errorMsg: message,
            oldInput: {
                email: '',
                password: ''
            },
            validateErrors: []
        }
    );
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'SignUp',
        path: '/signup',
        errorMsg: message,
        oldInput: {
            email: "",
            password: "",
            confirmpassword: "",

        },
        validateErrors: []
    });
}

exports.postSignup = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            pageTitle: 'SignUp',
            path: '/signup',
            errorMsg: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmpassword: confirmPassword

            },
            validateErrors: errors.array()
        });
    }



    bcryptjs.hash(password, 12)
        .then(hashPass => {
            const user = new User({
                email: email,
                password: hashPass,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'mahendragehlot006@gmail.com',
                subject: 'SignUp is Successed!!!!',
                html: '<h1>you have succesfully signup at node shop</h1>'
            });
        }).catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    console.log('login', errors);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMsg: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validateErrors: errors.array()
        });
    }
    User.findOne({ email: email })
        .then(user => {
            if (!user) {

                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    path: '/login',
                    errorMsg: "Invalid Email or Password.",
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validateErrors: []
                });
            }
            bcryptjs.compare(password, user.password)
                .then(domatch => {
                    if (domatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        console.log('af er user');
                        return req.session.save(err => {
                            console.log('mgehloatt');
                            console.log(err);
                            res.redirect('/');
                        });
                    }

                    return res.status(422).render('auth/login', {
                        pageTitle: 'Login',
                        path: '/login',
                        errorMsg: "Invalid Email or Password.",
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validateErrors: []
                    });
                })
                .catch(err => {
                    console.log(err => {
                        res.redirect('/login');
                    });
                });


        }).catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });
}


exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    })
}


exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMsg: message
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account fount with this email');
                    res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                transporter.sendMail({
                    to: req.body.email,
                    from: 'mahendragehlot006@gmail.com',
                    subject: 'Password Reset',
                    html: `
                      <p> You request to password reset </p>
                      <p> click this <a href="http://localhost:5000/reset/${token}">link</a>  to reset password</p>
                    `
                });
            })
            .catch(err => {
                const errr = new Error(err);
                errr.httpStatusCode = 500;
                next(errr);
            });
    });
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            }
            else {
                message = null;
            }


            res.render('auth/new-password',
                {
                    pageTitle: 'Update Password',
                    path: '/new-password',
                    errorMsg: message,
                    userId: user._id.toString(),
                    passwordToken: token
                }
            );

        })
        .catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });
}

exports.postNewPassword = (req, res, next) => {

    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    const userId = req.body.userId;
    let resetUser;
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
        .then(user => {
            resetUser = user;
            return bcryptjs.hash(newPassword, 12);
        })
        .then(hashPass => {
            resetUser.password = hashPass;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(restul => {
            res.redirect('/login');
        })
        .catch(err => {
            const errr = new Error(err);
            errr.httpStatusCode = 500;
            next(errr);
        });

}
