const express = require('express');

const authController = require('../controllers/auth');
const { check, body } = require('express-validator/check');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.post('/signup',
    [check('email')
        .isEmail()
        .withMessage("Please Ener A Valid Email.")
        .normalizeEmail()
        .custom((value, { req }) => {
            // if (value === 't@gmail.com') {
            //     throw new Error('This email is forbidden');
            // }
            // return true;
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email Already Exits,please take another email');
                }
            });
        }),
    body('password',
        'Please Enter Number and text and min 4 length password.')
        .isLength({ min: 4 })
        .isAlphanumeric()
        .trim(),
    body('confirmpassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password Should be match.');
            }
            return true;
        })

    ], authController.postSignup);
router.post('/login',
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please enter a valid email Address'),
        body('password', 'Password has to valid').
            isLength({ min: 4 })
            .isAlphanumeric()
            .trim()
    ]
    , authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;