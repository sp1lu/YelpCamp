// Import modules
const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync'); // Middlewares
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

const users = require('../controllers/users'); // User controller

// Setting up routing
// Old classic way
/* router.get('/register', users.renderRegisterForm);

router.post('/register', catchAsync(users.registerUser));

router.get('/login', users.renderLoginForm);

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser); */

router.get('/logout', users.logoutUser);

// Fancy way
router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser))

router.route('/login')
    .get(users.renderLoginForm)
    .post(storeReturnTo,
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        users.loginUser)

// Exports routes
module.exports = router;