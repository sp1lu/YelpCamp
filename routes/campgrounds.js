// Import modules
const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync'); // Middlewares
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js');

const campgrounds = require('../controllers/campgrounds'); // Campgrounds controller

const multer = require('multer'); // We need multer to handle upload of the pics
const { storage } = require('../cloudinary'); // We don't specify /index 'cause it automatically looks for an index file inside a folder
/* const upload = multer({ dest: 'uploads/' }); */
const upload = multer({ storage });

// Routing
// Classic way
/* router.get('/', catchAsync(campgrounds.index));

router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampround)); */

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

/* router.get('/:id', catchAsync(campgrounds.showCampground));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); */

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// Fancy way
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampround))

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;