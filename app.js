var express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
var path = require('path');
var fs = require('fs');
const { name } = require('ejs');
const { title } = require('process');
const { Console } = require('console');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/myDB',
    collectionName: 'myCollection',
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000
  }
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const MongoClient = require('mongodb').MongoClient;
let db;
let client;

// --------------------------------------------------
app.get('/', function(req, res) {
  res.render('login', { title: 'Login' });
});

app.get('/login', function(req, res) {
  res.render('login', { title: 'Login' });
});

app.post('/', function(req, res) {
  // console.log("Entered Post method");
  
  var usernameForm = req.body.username.toLowerCase();
  var passwordForm = req.body.password;
  
  if (usernameForm == "" || passwordForm == "") {
    res.render('login', {message: "Username and/or Password are empty"});
  }

  db.collection('myCollection').find({ username: usernameForm }).toArray()
    .then(docs => {
      if (docs.length > 0) {
        // console.log(docs[0].password," ", passwordForm)
        if(docs[0].password === passwordForm) {
          req.session.username = usernameForm;
          res.render('home', {title: 'Home'});
        }
        else {
          res.render('login', {message: "Incorrect Password"});
        }
        // console.log(docs);
      } else {
        res.render('login', {message: "Invalid Username"});
        // console.log("No user found");
      }
    })
    .catch(err => {
      console.error("Error fetching data:", err);
    });
});
// --------------------------------------------------


// --------------------------------------------------
app.get('/registration', function(req, res) {
  res.render('registration', { title: 'Registration' });
});

app.post('/register', function(req, res) {
    var usernameForm = req.body.username.toLowerCase();
    var passwordForm = req.body.password;

    db.collection('myCollection').find({ username: usernameForm }).toArray()
    .then(docs => {
      if (docs.length > 0) {
        res.render('registration', {message: "Username Exists"});
        // console.log(docs);
      } else {
        db.collection('myCollection').insertOne({username: usernameForm, password: passwordForm});
        res.render('login', {message: "Registration Successful"});
        // console.log("No user found");
      }
    })
    .catch(err => {
      console.error("Error fetching data:", err);
    });
});
// --------------------------------------------------

// Authentication
app.use(isAuthenticated);

app.get('/annapurna', function(req, res) {
  res.render('annapurna', { title: 'Annapurna' });
});

app.get('/bali', function(req, res) {
  res.render('bali', { title: 'Bali' });
});

app.get('/cities', function(req, res) {
  res.render('cities', { title: 'Cities' });
});

app.get('/hiking', function(req, res) {
  res.render('hiking', { title: 'Hiking' });
});

app.get('/home', function(req, res) {
  res.render('home', { title: 'Home' });
});
// --------------------------------------------------
app.get('/search', function(req, res) {
  res.render('searchresults', { title: 'Search Results' });
});

app.post('/search', function(req, res) {
  var subString = req.body.Search.toLowerCase();
  let destinations = [];
  let availableDestinations = ["annapurna", "bali", "rome", "inca", "paris", "santorini"];

  if(subString.length != 0) {
      for (let index = 0; index < availableDestinations.length; index++) {
        if (availableDestinations[index].indexOf(subString) !== -1) {
          destinations.push(availableDestinations[index]);
        }
      }
      if (destinations.length > 0) {
        res.render('searchresults', {array: destinations});
        // console.log(destinations)
        // console.log("------------------------------------------------------")
      }
      else {
        res.render('searchresults', {message: "Not Found", array: []});
        // console.log("No Destination Found")
      }
    }
    else {
      res.render('searchresults', {message: "Not Found", array: []});
      // console.log("No Destination Found")
    }

  // ---------------------------------- Searching in database ----------------------------------
  // console.log("Subtstring is:", subString.length, ".");
  // console.log("----------------------------------")
  // if(subString.length != 0) {

  // db.collection('myCollection').find({ destination: { $exists: true } }).toArray()
  //   .then(docs => {
  //     // console.log(docs);
  //     for (let index = 0; index < docs.length; index++) {
  //       if (docs[index].destination.indexOf(subString) !== -1) {
  //         destinations.push(docs[index].destination);
  //       }
  //     }
  //     if (destinations.length > 0) {
  //       res.render('searchresults', {array: destinations});
  //       // console.log(destinations)
  //       // console.log("------------------------------------------------------")
  //     }
  //   })
  //   .catch(err => {
  //     console.error("Error fetching data:", err);
  //   });
  // }
  // else {
  //   res.render('searchresults', {message: "No Destination Found", array: []});
  //   // console.log("No Destination Found")
  // }
});
// --------------------------------------------------

app.get('/inca', function(req, res) {
  res.render('inca', { title: 'Inca' });
});

app.get('/index', function(req, res) {
  res.render('index', { title: 'Index' });
});

app.get('/islands', function(req, res) {
  res.render('islands', { title: 'Islands' });
});

app.get('/paris', function(req, res) {
  res.render('paris', { title: 'Paris' });
});

app.get('/rome', function(req, res) {
  res.render('rome', { title: 'Rome' });
});

app.get('/santorini', function(req, res) {
  res.render('santorini', { title: 'Santorini' });
});

// --------------------------------------------------
app.get('/wanttogo', function(req, res) {
  const username = req.session.username;
  let destinations = [];

  db.collection('myCollection').find({
    username: username
  }).toArray()
    .then(docs => {
      for (let index = 0; index < docs.length; index++) {
        if(docs[index].destination !== undefined) {
          destinations.push(docs[index].destination);
        }
      }
      if (docs.length > 0) {
        // console.log(destinations);
        res.render('wanttogo', {array: destinations, title: 'Want to Go'});
      } else {
        res.render('wanttogo', {message: "No Destination in list", title: 'Want to Go'});
      }
    })
    .catch(err => {
      console.error("Error fetching data:", err);
    });
});

var currentPage = '';

app.post('/wantToGo', function(req, res) {
  const formID = req.body.formID;
  const username = req.session.username;
  // console.log('Form ID:', formID);
  var url =  req.get('Referer');
  var temp = url.split('/').pop();
  if (temp !== 'wantToGo') {
    currentPage = temp;
  }
  // console.log('Page Name:', currentPage);
  if (currentPage.charAt(currentPage.length - 1) === '?') {
    currentPage = currentPage.slice(0, -1);
  }
  db.collection('myCollection').find({ username: username, destination: formID }).toArray()
    .then(docs => {
      if (docs.length > 0) {
        // res.render('home', {message: "Destination already in list"});
        console.log(currentPage);
        res.render(`${currentPage}`, {message: "Destination already in list"});
      } else {
        db.collection('myCollection').insertOne({username: username, destination: formID});
        // res.render('home', {message: "Destination added to list"});
        console.log(currentPage);
        res.render(`${currentPage}`, {message: "Destination added to list"});
      }
    })
    .catch(err => {
      console.error("Error fetching data:", err);
    });
});
// --------------------------------------------------

// ------------------------------------------- Functions -------------------------------------------
// Connecting to Database
async function connectToDatabase() {
  try {
    client = await MongoClient.connect("mongodb://127.0.0.1:27017/", { useNewUrlParser: true, useUnifiedTopology: true
    });
    db = client.db('myDB');
    console.log("Connected to database:", db.databaseName);
    // db.collection('myCollection').insertOne({destination: 'annupurna'});
    // db.collection('myCollection').insertOne({destination: 'bali'});
    // db.collection('myCollection').insertOne({destination: 'rome'});
    // db.collection('myCollection').insertOne({destination: 'inca'});
    // db.collection('myCollection').insertOne({destination: 'paris'});
    // db.collection('myCollection').insertOne({destination: 'santorini'});
  }
  catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
}

function isAuthenticated(req, res, next) {
  if (req.session && req.session.username) {
    return next();
  }
  res.redirect('/login');
}
connectToDatabase();

app.listen(3000);