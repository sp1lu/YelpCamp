// Import modules
const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

// Check if a user is logged in or not
module.exports.isLoggedIn = (req, res, next) => {
    // console.log('REQ.USER...', req.user); // Exploit serialize() function to get user information from session

    if (!req.isAuthenticated()) { // Passport function to check if a user has a logged in session or not (using user serialize() function)
        req.session.returnTo = req.originalUrl; // Save the origin url into the returnTo variable present in every get request

        req.flash('error', 'You must be signed in to access this page');
        return res.redirect('/login');
    }

    next();
}

// Temporary store the origin url saved in passport js returnTo variable stored in req.session...
// ...moving it from session to locals
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }

    next();
}

// Joi validation to avoid to submit blank form during campground creation
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);

    } else {
        next();
    }
}

// Joi validation to avoid to submit blank form during review creation
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);

    } else {
        next();
    }
}

// Middleware checking if a user has permission to access to edit campground page
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground.author.equals(req.user._id)) { // Avoid that user not created the campground to edit it
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }

    next();

}

// Middleware checking if a user has permissione to delete a review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }

    next();
}