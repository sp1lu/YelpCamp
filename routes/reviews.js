// Import modules
const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync'); // Middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const reviews = require('../controllers/reviews'); // Review controller

// Routing
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;