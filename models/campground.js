// Import modules
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// Mongoose campground database schema
const ImageSchema = new Schema({ // Separate schema for images array: we need it to usage on cloudinary transform api request
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () { // Virtual property 'cause we don't need to store it in database
    return this.url.replace('/upload', '/upload/w_300');
});

const opts = { toJSON: { virtuals: true } }; // Enable virtuals in Mongoose

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// Virtual property to match Mapbox needs
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<p>${this.description.substring(0, 20)}...</p>`;
});

// Middleware to delete reviews associate to a campgrounds when the latter is deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) { // Need to use 'findOneAndDelete' 'cause is the only one triggered by 'findByIdAndDelete' function in app.js
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

// Export campground schema
module.exports = mongoose.model('Campground', CampgroundSchema);