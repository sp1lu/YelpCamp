if (process.env.NODE_ENV !== 'production') { // Use dotenv to handle cloudinary keys in .env file
    require('dotenv').config();
}

// Import modules
const express = require('express'); // Express server
const path = require('path'); // Common path for static files and templates

const mongoose = require('mongoose'); // Mongoose
const ejsMate = require('ejs-mate'); // Ejs templating system

const session = require('express-session'); // Handle sessions
const flash = require('connect-flash'); // Flash messages

const ExpressError = require('./utils/ExpressError'); // Handle errors in requests
const methodOverride = require('method-override'); // Override http requests

const campgroundsRoutes = require('./routes/campgrounds'); // Routes schema for campgrounds
const reviewsRoutes = require('./routes/reviews'); // Routes schema for reviews
const userRoutes = require('./routes/user'); // Routes schema for authentication

const passport = require('passport'); // Authetication and authorization libraries
const LocalStrategy = require('passport-local'); // Authentication using local strategy (email, username and password)
const User = require('./models/user');

const mongoSanitize = require('express-mongo-sanitize'); // Handle mongo injection
const helmet = require('helmet'); // Handle security issues

const MongoStore = require('connect-mongo');

// Connect Mongoose to MongoDB
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
mongoose.connect(dbUrl);
/* mongoose.connect(dbUrl); */

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Use express as backend
const app = express();

// Set ejs-mate usage
app.engine('ejs', ejsMate);

// Set views folder as templates folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set what to do on EVERY request (middleware)
app.use(express.urlencoded({ extended: true })); // Parse incoming requests
app.use(methodOverride('_method')); // Override some http requests to send put, patch and delete request

/* app.use(express.static('public')); */ // Serve static files like stylesheets and common assets
app.use(express.static(path.join(__dirname, 'public'))); // Equal as above

app.use(mongoSanitize({ // Handle mongo injection
    replaceWith: '_'
}));

// Session middleware
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoStore.create({ // Store session in database instead that in memory
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600, // Update user session only once in 24 hours if not necessary (in seconds not ms)
    crypto: {
        secret: secret,
    }
});

store.on('error', function(e) {
    console.log('SESSION STORE', e);
});

const sessionConfig = { // Temporary sessions config for dev purpose
    store: store,
    name: 'session',
    secret: secret, // Validation key
    resave: false, // To avoid deprecated default value
    saveUninitialized: true, // To avoid deprecated default value
    cookie: { // Cookie settings
        httpOnly: true, // Forbids client-side JavaScript from accessing the cookie
        /* secure: true, */ // Can configure or edit cookie only on https connection
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Expiration day; after a week in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7 // Cookie duration (maxAge has precedence on expires paramater anyway)
    }
}

app.use(session(sessionConfig));


// Flash messages middleware initialization
app.use(flash());

// Helmet security package
app.use(helmet());

const scriptSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];

const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/duuklscys/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Authentication
app.use(passport.initialize()); // Start passport
app.use(passport.session()); // Handle persistent login session (must be after session)

passport.use(new LocalStrategy(User.authenticate())); // Start local strategy authentication using params specified in User model

passport.serializeUser(User.serializeUser()); // How to store...
passport.deserializeUser(User.deserializeUser()); // ...and how to unstore a user in a session

// Locals middleware
// Locals middleware acts on responds only
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // Check if user is logged in or not to show correct login or signup buttons

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


// Routing

// Testing route to register a new user using passport library
/* app.get('/fakeuser', async (req, res) => {
    const user = new User({ email: 'daviderivolta12@gmail.com', username: 'spilu' }); // Set email and username
    const newUser = await User.register(user, 'ciao'); // Register a new user using email, username and a password: it automatically salt and hash the latter one
    res.send(newUser);
}); */

app.use('/', userRoutes); // Middleware handling authentication on ALL routes

app.use('/campgrounds', campgroundsRoutes); // Middleware handling all /campgrounds routing

app.use('/campgrounds/:id/reviews', reviewsRoutes); // Middleware handling all /reviews routing

app.get('/', (req, res) => { // Homepage
    res.render('home');
});

// Errors handling
app.all('*', (req, res, next) => {
    /* res.send('404'); */
    next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    /* res.send('Oh, boy!'); */
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('errors', { err });
});

// Port to use during development
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})