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
// Sample URL Database with test shortened link string, longURL with website link info, and userID to determine which user created the shortened URL;
const urlDatabase = {
  b6UTxQ: { longURL: "https://youtu.be/GNZMCS2dbag", userID: "fz7rsp6sc7wky8qohzsfeiw0qhachayizw18kkunff" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "3oqdszqj6vi2u7mnmqa9qr5z3tf08sz1oboq4kgv6g" }
};
// Tinyapp listening message so server owner knows which port user should access;
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});
// Homepage link, which redirects to /login if not logged in or /urls if logged in;
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (!userID) return res.redirect("/login");
  return res.redirect("/urls");
});
// Shows list of user's urls if logged in, or sends to /login with error message "Please log in" in the header of login page if logged out;
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID) return res.redirect("/login");
  const templateVars = { user: users[userID], urls: helpers.urlsForUser(userID, urlDatabase) };
  return res.render("urls_index", templateVars);
});
// Shows form to submit new urls to shorten if logged in, or sends to /login with error message "Please log in" in the header of login page if logged out;
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!userID) return res.redirect("/login");
  const templateVars = { user: users[userID] };
  return res.render("urls_new", templateVars);
});
// Shows a page with the link submitted and a shortened link version if logged in;
// Redirects to /login with message "Please Log in" in form if user isn't logged in;
// Sends an error if user doesn't didn't create the link;
// Sends Error 404 if shortened URL given doesn't exist on the server;
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.userID;
  if (!userID) return res.redirect("/login");
  if (userID !== urlDatabase[shortURL]["userID"]) return res.status(401).send('Please login as the owner of this link to access it.');
  if (lodash.isUndefined(helpers.urlsForUser(userID, urlDatabase))) return res.status(404).send(`Please try another link. This link was not found. \n Here's another link instead to make up for it ;P - https://youtu.be/GNZMCS2dbag ;`);
  const user = users[userID];
  const longURL = urlDatabase[shortURL]["longURL"];
  const templateVars = { user, shortURL, longURL };
  return res.render("urls_show", templateVars);
});
// Redirects to original url if it exists for this short url;
// Sends Error 404 if shortened URL given doesn't exist on the server;
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]["longURL"]) {
    return res.status(404).send(`Please try another link. This link was not found. \n Here's another link instead to make up for it ;P - https://youtu.be/GNZMCS2dbag ;`);
  }
  const longURL = urlDatabase[req.params.id]["longURL"];
  return res.redirect(longURL);
});
// Creates a new urlDatabase entry with given URL, a generated short URL, and the userID of who created the shortURL, if logged in;
// Redirects to a page with shortened link version of submitted link if logged in;
// Redirects to /login with message "Please Log in" in form if user isn't logged in;
// Returns an error if longURL was not submitted;
app.post("/urls/", (req, res) => {
  const userID = req.session.userID;
  if (!userID) return res.redirect("/login");
  if (!req.body.longURL) return res.status(400).send('Please enter a link');
  const shortURL = helpers.generateRandomString(6, urlDatabase);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, userID};
  return res.redirect(`/urls/${shortURL}`);
});
// Updates a urlDatabase entry with given URL amd the previous shortURL, if logged in;
// Redirects to user urls following edit;
// Redirects to /login with message "Please Log in" in form if user isn't logged in;
// Returns an error if longURL was not submitted;
app.post("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  if (!userID) return res.redirect("/login");
  if (userID !== urlDatabase[req.params.id]["userID"]) return res.status(401).send('Please login as this links owner to access this link');
  urlDatabase[req.params.id]["longURL"] = req.body["longURL"];
  return res.redirect("/urls/");
});
// Deletes a urlDatabase entry with shortURL, if logged in;
// Redirects to /urls following removal;
// Redirects to /login with message "Please Log in" in form if user isn't logged in;
// Returns an error if shorturl requested for deletion wasn't created by this user;
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.userID) return res.redirect("/login");
  if (req.session.userID !== urlDatabase[req.params.id]["userID"]) return res.status(403).send('Please login as the link owner to delete this link');
  if (req.params.id && urlDatabase[req.params.id]) delete urlDatabase[req.params.id];
  return res.redirect("/urls");
});
// Redirects to /urls if user is logged in;
// Renders login form if user is not logged in;
app.get("/login", (req, res) => {
  const templateVars = {user: null};
  if (req.session.userID) return res.redirect("/urls");
  return res.render("login", templateVars);
});
// Redirects to /urls if user is logged in;
// Renders Register form if user is not logged in;
app.get("/register", (req, res) => {
  let templateVars = {user: null};
  if (req.session.userID) return res.redirect("/urls");
  return res.render("register", templateVars);
});
// Sets userID Cookie and Redirects to /urls;
// Returns error messages if email or password is empty;
// Returns error messages if given email isn't found;
// Returns error messages if password and email don't match stored info;
app.post("/login", (req, res) => {
  const formEmail = req.body["email"];
  if (!formEmail) return res.status(400).send('Please enter an email');
  const formPassword = req.body["password"];
  if (!formPassword) return res.status(400).send('Please enter a password');
  const userEmail =  helpers.propertySearch(users, "email", formEmail);
  if (!userEmail) return res.status(400).send('Please enter an email registered with an account');
  const userID = Object.keys(userEmail)[0];
  if (!bcrypt.compareSync(formPassword, users[userID]["password"])) return res.status(400).send('Please enter a correct Email and Password');
  req.session.userID = userID;
  return res.redirect("/urls");
});
// Creates a new user and generates a new ID;
// Hashes password with bcrypt;
// Registers user info into users database, storing hashed password and NOT plaintext password;
// Sets userID Cookie and Redirects to /urls;
// Returns error messages if email or password is empty;
// Returns error messages if given email already exists;
app.post("/register", (req, res) => {
  const formEmail = req.body["email"];
  if (!formEmail) return res.status(400).send('Please enter an email');
  const formPassword = req.body["password"];
  if (!formPassword) return res.status(400).send('Please enter a password');
  const userEmail = helpers.getUserByEmail(formEmail, users);
  if (userEmail) return res.status(400).send('Please enter an Email not already in use on this website');
  const userID = helpers.generateRandomString(42, users);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = {};
  users[userID]["id"] = userID;
  users[userID]["email"] = req.body["email"];
  users[userID]["password"] = hashedPassword;
  req.session.userID = userID;
  return res.redirect("/urls/");
});
// Deletes user session cookie;
// Redirects to /urls page;
app.post("/logout", (req, res) => {
  delete req.session.userID;
  return res.redirect("/urls");
});
// Deletes a urlDatabase entry with shortURL, if logged in;
// Redirects to /urls following removal;
// Redirects to /login with message "Please Log in" in form if user isn't logged in;
// Returns an error if shorturl requested for deletion wasn't created by this user;
app.get("/urls/:id/delete", (req, res) => {
  if (!req.session.userID) return res.redirect("/login");
  if (req.session.userID !== urlDatabase[req.params.id]["userID"]) return res.status(403).send('Please login as the link owner to delete this link');
  if (req.params.id && urlDatabase[req.params.id]) delete urlDatabase[req.params.id];
  return res.redirect("/urls");
});