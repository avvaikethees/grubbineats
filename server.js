// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || 'development';
const express    = require('express');
const bodyParser = require('body-parser');
const sass       = require('node-sass-middleware');
const app        = express();
const morgan     = require('morgan');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
//moment API to diaply time and date in 'MMMM Do YYYY, h:mm:ss a' format
const moment = require("moment");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));



// using moment
app.use((req, res, next)=>{
    res.locals.moment = moment;
    next();
  });



app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/styles', sass({
  src: __dirname + '/styles',
  dest: __dirname + '/public/styles',
  debug: true,
  outputStyle: 'expanded'
}));

// Attach helpers to query db
const clientHelpers = require('./clientHelpers.js')(db);
const staffHelpers = require('./staff_helper')(db);
const clientRoutes = require('./routes/clients')(clientHelpers);
const staffRoutes = require('./routes/staff')(staffHelpers);

// Mount all resource routes
app.use('/client', clientRoutes);
app.use('/staff', staffRoutes);


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  res.render("index");
});

// Home page redirect
app.get('/', (req, res) => {
  res.redirect('/client');
});

app.listen(PORT, () => {
  console.log(`grubbineats app listening on port ${PORT}`);
});
