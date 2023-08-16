// Import modules
const User = require('../models/user');

// Controllers
module.exports.renderRegisterForm = (req, res) => {
    res.render('user/register')
}

module.exports.registerUser = async (req, res) => {

    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username }); // Set email and username using data coming from the register form
        const registeredUser = await User.register(user, password); // Register a new user using email, username and a password: it automatically salt and hash the latter one

        req.login(registeredUser, err => { // Passport js function to login
            if (err) {
                return next(err);
            }

            req.flash('success', 'Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        });

    } catch (e) { // Handle error if user or email has been already registered in database
        req.flash('error', e.message);
        res.redirect('/register');
    }

}

module.exports.renderLoginForm = (req, res) => {
    res.render('user/login');
}

module.exports.loginUser = (req, res) => { // Passport middleware to handle authentication and errors
    req.flash('success', 'Welcome back');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // Exploits the returnTo passport js variable presents in every locals request middleware
    // delete req.session.returnTo; // Useless 'cause now passport auto delete returnTo variable after login
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res) => {
    req.logout(function (err) { // Passport js function to logout
        if (err) {
            return next(err);
        }

        req.flash('success', 'Succesfully logged out')
        res.redirect('/campgrounds');
    });
    
}