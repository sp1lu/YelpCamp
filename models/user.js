// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// Mongoose user database schema
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose); // This add username and password (and its hash and salt) to our schema exploiting passport local mongoose lib

// Export user schema
module.exports = mongoose.model('User', UserSchema);