const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDb = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const ran = Math.floor(Math.random() * 1000);
        const price = Math.floor((Math.random() * 20) + 10);

        const camp = new Campground({
            author: '64d485c5e73ca50900ee7a04',
            geometry: {
                type: 'Point',
                coordinates: [cities[ran].longitude, cities[ran].latitude] },
            location: `${cities[ran].city}, ${cities[ran].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tempor ipsum diam, vel gravida urna tincidunt a. Nullam faucibus ligula vitae tortor semper scelerisque.',
            price: price,
            images: [
                {
                    url: 'https://res.cloudinary.com/duuklscys/image/upload/v1691851569/YelpCamp/patrick-hendry-eDgUyGu93Yw-unsplash_pobv4o.png',
                    filename: 'YelpCamp/keyovexeaymdgfukvthd'
                },
                {
                    url: 'https://res.cloudinary.com/duuklscys/image/upload/v1691851571/YelpCamp/jesse-gardner-wTVr4HR4SBI-unsplash_bhfbqk.png',
                    filename: 'YelpCamp/czpbk19fkw7968hgehic'
                },
                {
                    url: 'https://res.cloudinary.com/duuklscys/image/upload/v1691851572/YelpCamp/scott-goodwill-y8Ngwq34_Ak-unsplash_rqusup.png',
                    filename: 'YelpCamp/bqdk8o9xs3ytdfixilbj'
                }
            ]
        })

        await camp.save();

    }
}

seedDb()
    .then(() => {
        mongoose.connection.close();
    })