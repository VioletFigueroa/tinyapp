// Libraries;
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const express = require("express");
const helpers = require('./helpers.js');
const lodash = require("lodash");

// Express Settings;
const app = express();
const PORT = 8080;

// Bodyparser Settings;
app.use(bodyParser.urlencoded({extended: true}));

// CookieSession Settings;
app.use(cookieSession({
  name: 'session',
  keys: ["error-keys-must-be-provided."],
  //Cookie Options
  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));

// Sets express view engine as ejs files;
app.set("view engine", "ejs");

// Sample users database with test user accounts;
const users = {
  "fz7rsp6sc7wky8qohzsfeiw0qhachayizw18kkunff": {
    "id": "fz7rsp6sc7wky8qohzsfeiw0qhachayizw18kkunff",
    "email": "user@example.com",
    "password": "$2b$10$.Wf0XouumqkD2DpCjP9tLuDZcCipHvE9DsfoCaDQvfCU3BfcNpCAC"
  },
  "3oqdszqj6vi2u7mnmqa9qr5z3tf08sz1oboq4kgv6g": {
    "id": "3oqdszqj6vi2u7mnmqa9qr5z3tf08sz1oboq4kgv6g",
    "email": "user2@example.com",
    "password": "$2b$10$GMXdN0T6/kG9QTLOHBFrv.cjFdr2v4JWK.Xd6GWZEp8B55LyYuZZC"
  }
};

// Sample URL Database

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://youtu.be/GNZMCS2dbag",
    userID: "fz7rsp6sc7wky8qohzsfeiw0qhachayizw18kkunff"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "3oqdszqj6vi2u7mnmqa9qr5z3tf08sz1oboq4kgv6g"
  }
};

// Tinyapp listening message so server owner knows which port user should access;
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

// Homepage link
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect("/login");
    //Redirects to /login if not logged in;
  }
  return res.redirect("/urls");
  // Redirects to /urls if logged in;
});

app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID) return res.redirect("/login");
  // Sends to /login with error message "Please log in" in the header of login page if logged out;
  const templateVars = { user: users[userID], urls: helpers.urlsForUser(userID, urlDatabase) };
  return res.render("urls_index", templateVars);
  // Shows list of user's urls if logged in;
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect("/login");
  }
  // Sends to /login with error message "Please log in" in the header of login page if logged out;
  const templateVars = { user: users[userID] };
  return res.render("urls_new", templateVars);
  // Shows form to submit new urls to shorten if logged in
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect("/login");
    // Redirects to /login with error message "Please Log in" in form if user isn't logged in;
  }
  const shortURL = req.params.id;
  if (userID !== urlDatabase[shortURL]["userID"]) {
    return res.status(401).send(
      'Please login as the owner of this link to access it;'
    );
    // Sends an error if user doesn't didn't create the link;
  }
  if (lodash.isUndefined(helpers.urlsForUser(userID, urlDatabase))) {
    return res.status(404).send(
      `Please try another link. This link was not found.
    \n Here's another link instead to make up for it ;P
    \n https://youtu.be/GNZMCS2dbag ;`
    );
    // Sends Error 404 if shortened URL given doesn't exist on the server;
  }
  const user = users[userID];
  const longURL = urlDatabase[shortURL]["longURL"];
  const templateVars = { user, shortURL, longURL };
  return res.render("urls_show", templateVars);
  // Shows a page with the link submitted and a shortened link version if logged in;
});

app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
  if (!urlDatabase[urlID]["longURL"]) {
    return res.status(404).send(
      `Please try another link. This link was not found.
    \n Here's another link instead to make up for it ;P
    \n https://youtu.be/GNZMCS2dbag ;`
    );
    // Sends Error 404 if shortened URL given doesn't exist on the server;
  }
  const longURL = urlDatabase[urlID]["longURL"];
  return res.redirect(longURL);
  // Redirects to original url if it exists for this short url;
});

app.post("/urls/", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect("/login");
  // Redirects to /login with message "Please Log in" in form if user isn't logged in;
  }
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.status(400).send(
      'Please enter a link;'
    );
    // Returns an error if longURL was not submitted;
  }
  const shortURL = helpers.generateRandomString(6, urlDatabase); // A new generated short URL
  urlDatabase[shortURL] = { longURL, userID }; // Creates a new urlDatabase entry with given URL
  // Includes the userID of who created the shortURL
  return res.redirect(`/urls/${shortURL}`);
  // Redirects to a page with shortened link version of submitted link if logged in;
});

app.post("/urls/:id", (req, res) => {
  // Updates a urlDatabase entry with given URL amd the previous shortURL, if logged in;
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect("/login");
  // Redirects to /login with message "Please Log in" in form if user isn't logged in;
  }
  const urlID = req.params.id;
  if (userID !== urlDatabase[urlID]["userID"]) {
    return res.status(401).send(
      'Please login as this links owner to access this link;'
    );
    // Returns an error if longURL was not submitted;
  }
  urlDatabase[urlID]["longURL"] = req.body["longURL"];
  return res.redirect("/urls/");
  // Redirects to user urls following edit;
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect("/login");
    // Redirects to /login with message "Please Log in" in form if user isn't logged in;
  }
  const urlID = req.params.id;
  if (userID !== urlDatabase[urlID]["userID"]) {
    return res.status(403).send(
      'Please login as the link owner to delete this link;'
    );
    // Returns an error if shorturl requested for deletion wasn't created by this user;
  }
  if (urlDatabase[urlID]) {
    return delete urlDatabase[urlID];
    // Deletes a urlDatabase entry with shortURL, if logged in;
  }
  return res.redirect("/urls");
  // Redirects to /urls following removal;
});

app.get("/login", (req, res) => {
  if (req.session.userID) {
    return res.redirect("/urls");
    // Redirects to /urls if user is logged in;
  }
  const templateVars = {user: null};
  return res.render("login", templateVars);
  // Renders login form if user is not logged in;
});

app.get("/register", (req, res) => {
  const templateVars = {user: null};
  if (req.session.userID) {
    return res.redirect("/urls");
    // Redirects to /urls if user is logged in;
  }
  return res.render("register", templateVars);
  // Renders Register form if user is not logged in;
});

app.post("/login", (req, res) => {
  const formEmail = req.body["email"];
  if (!formEmail) {
    return res.status(400).send(
      'Please enter an email;'
    );
    // Returns error messages if email or password is empty;
  }
  const formPassword = req.body["password"];
  if (!formPassword) {
    return res.status(400).send(
      'Please enter a password;'
    );
    // Returns error messages if password is empty;
  }
  const userEmail =  helpers.propertySearch(users, "email", formEmail);
  if (lodash.isEmpty(userEmail)) {
    return res.status(403).send('Please enter an email registered with an account;');
    // Returns error messages if given email isn't found;
  }
  const userID = Object.keys(userEmail)[0];
  console.log("UserID: ", userID);
  console.log("Users: ", users);
  if (!bcrypt.compareSync(formPassword, users[userID]["password"])) {
    return res.status(400).send(
      'Please enter a correct Email and Password;'
    );
    // Returns error messages if password and email don't match stored info;
  }
  req.session.userID = userID;
  // Sets userID Cookie
  return res.redirect("/urls");
  //Redirects to /urls;
});

// Returns error messages if given email already exists;
app.post("/register", (req, res) => {
  const formEmail = req.body["email"];
  if (!formEmail) {
    return res.status(400).send(
      'Please enter an email'
    );
  // Returns error messages if email is empty;
  }
  const formPassword = req.body["password"];
  if (!formPassword) {
    return res.status(400).send(
      'Please enter a password'
    );
    // Returns error messages if password is empty;
  }
  const userEmail = helpers.getUserByEmail(formEmail, users);
  if (userEmail) {
    return res.status(400).send(
      'Please enter an Email not already in use on this website'
    );
  }
  const userID = helpers.generateRandomString(42, users);
  //Generates a new ID;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  // Hashes password with bcrypt;
  users[userID] = {};
  // Creates a new user;
  users[userID]["id"] = userID;
  users[userID]["email"] = req.body["email"];
  users[userID]["password"] = hashedPassword;
  // Registers user info into users database, storing hashed password and NOT plaintext password;
  req.session.userID = userID;
  // Sets userID Cookie
  return res.redirect("/urls/");
  //Redirects to /urls;
});

app.post("/logout", (req, res) => {
  delete req.session.userID;
  // Deletes user session cookie;
  return res.redirect("/urls");
  // Redirects to /urls page;
});

app.get("/urls/:id/delete", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect("/login");
    // Redirects to /login with message "Please Log in" in form if user isn't logged in;
  }
  const urlID = req.params.id;
  if (userID !== urlDatabase[urlID]["userID"]) {
    return res.status(403).send('Please login as the link owner to delete this link');
    // Returns an error if shorturl requested for deletion wasn't created by this user;
  }
  
  if (urlDatabase[urlID]) {
    delete urlDatabase[urlID];
  // Deletes a urlDatabase entry with shortURL, if logged in;
  }
  return res.redirect("/urls");
  // Redirects to /urls following removal;
});