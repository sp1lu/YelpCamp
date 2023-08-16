// Import modules
const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

// Controllers
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampround = async (req, res, next) => {

    /* if (!req.body.campground) throw new ExpressError('Invalid campground data', 400); */ // Basic validation

    // Geocode from Mapbox
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground);
    
    campground.geometry = geoData.body.features[0].geometry;

    // Take the files uploaded in form as 'image' and catch the data we want: cloudinary url and filename
    // req.files (or file if 'single' and not 'array') are in requests when the form is submitted
    // {} parenthesis 'cause every item in the images array is an object (url and filename keys)
    // For every upload create an object with teo keys and push it in the images array
    campground.images = req.files.map(item => ({
        url: item.path,
        filename: item.filename
    }));

    campground.author = req.user._id; // add the user made the post request the author of the campground
    await campground.save();

    console.log(campground);

    req.flash('success', 'Successfully made a new campground!');

    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews', // Need to populate twice: get the reviews and then get the author of every review
            populate: {
                path: 'author'
            }
        })
        .populate('author'); // Find a campground and populate its data reference from reviews and users collections

    if (!campground) { // If you try to access a deleted campground it shows you a message and then redirects you to campgrounds index page
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) { // If you try to access a deleted campground it shows you a message and then redirects you to campgrounds index page
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // Update data

    const images = req.files.map(item => ({
        url: item.path,
        filename: item.filename
    }));

    campground.images.push(...images); // Add images
    await campground.save(); // Save

    // Then update again
    // Query to delete a specific image from a campground
    // Update campground...
    // ...pulling out image...
    // ...which filename...
    // ...is equal to the value from body request sent by form
    if (req.body.deleteImages) {

        for (const filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }

        await campground.updateOne({
            $pull:
            {
                images:
                {
                    filename:
                        { $in: req.body.deleteImages }
                }
            }
        })
    }

    req.flash('success', 'Campground successfully updated!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);

    req.flash('success', 'Campground successfully deleted!');

    res.redirect('/campgrounds');
}