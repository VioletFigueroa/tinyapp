//Libraries
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const express = require("express");
const helpers = require('./helpers.js');
const lodash = require("lodash");
//Express Settings
const app = express();
const PORT = 8080;
//Bodyparser Settings
app.use(bodyParser.urlencoded({extended: true}));
//CookieSeesion Settings
app.use(cookieSession({
  name: 'session',
  keys: ["error-keys-must-be-provided."],
  //Cookie Options
  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));

//Sets express view engine as ejs files
app.set("view engine", "ejs");

//Sample users database with test user accounts
const users = {
  "fz7rsp6sc7wky8qohzsfeiw0qhachayizw18kkunff": {
    id: "fz7rsp6sc7wky8qohzsfeiw0qhachayizw18kkunff",
    "email": "user@example.com",
    password: "$2b$10$.Wf0XouumqkD2DpCjP9tLuDZcCipHvE9DsfoCaDQvfCU3BfcNpCAC"
  },
  "3oqdszqj6vi2u7mnmqa9qr5z3tf08sz1oboq4kgv6g": {
    id: "3oqdszqj6vi2u7mnmqa9qr5z3tf08sz1oboq4kgv6g",
    email: "user2@example.com",
    password: "$2b$10$BRfGePMEvRzNThK3lNaKJudM1VFhmiouvX4zY8nzmhDYRLcU9hL.W"
  }
};
//Sample URL Database with test shortened link string, longURL with website link info, and userID to determine which user created the shortened URL
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "fz7rsp6sc7wky8qohzsfeiw0qhachayizw18kkunff" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "3oqdszqj6vi2u7mnmqa9qr5z3tf08sz1oboq4kgv6g" }
};

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (!userID) return res.redirect("/login");
  return res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID) return res.redirect("/login");
  const templateVars = { user: users[userID], urls: helpers.urlsForUser(userID, urlDatabase) };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!userID) return res.redirect("/login");
  const templateVars = { user: users[userID] };
  return res.render("urls_new", templateVars);
});

app.post("/urls/", (req, res) => {
  if (!req.body.longURL) {
    res.status(400).send('Please enter a link');
    return res.redirect("/urls/new");
  }
  const shortURL = helpers.generateRandomString(6, urlDatabase);
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.userID};
  return res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  if (userID !== urlDatabase[shortURL]["userID"]) return res.send('Please login first to access this link.');
  const userID = req.session.userID;
  if (userID !== urlDatabase[shortURL]["userID"]) return res.send('Please login first to access this link.');
  if (lodash.isUndefined(helpers.urlsForUser(userID, urlDatabase))) return res.send('Please login first to access this link.');
  const user = users[userID];
  const longURL = urlDatabase[shortURL]["longURL"];
  const templateVars = { user, shortURL, longURL };
  return res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  if (userID !== urlDatabase[req.params.id]["userID"]) {
    res.status(400).send('Please login as this links owner to access this link');
    return res.redirect("/urls");
  }
  urlDatabase[req.params.id]["longURL"] = req.body["longURL"];
  return res.redirect(`/urls/${req.params.id}`);
});



app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]["longURL"]) {
    res.status(404).send(`Please try another link. This link was not found. \n Here's another link instead to make up for it ;P`);
    return res.redirect("https://youtu.be/GNZMCS2dbag");
  }
  const longURL = urlDatabase[req.params.id]["longURL"];
  return res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session.userID !== urlDatabase[req.params.id]["userID"]) {
    res.status(400).send('Please login as the link owner to delete this link');
    return res.redirect("/login");
  }
  if (req.params.id && urlDatabase[req.params.id]) delete urlDatabase[req.params.id];
  return res.redirect("/urls");
});

app.get("/urls/:id/delete", (req, res) => {
  if (!req.session.userID || req.session.userID !== urlDatabase[req.params.id]["userID"]) {
    res.status(400).send('Please login first to delete this link');
    return res.redirect("/login");
  }
  if (req.params.id && urlDatabase[req.params.id]) delete urlDatabase[req.params.id];
  return res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {user: null};
  if (req.session.userID) return res.redirect("/urls");
  return res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  if (lodash.isEmpty(req.body["email"])) {
    res.status(400).send('Please enter an email');
    return res.redirect("/login");
  }
  const formEmail = req.body["email"];
  const userEmail = helpers.propertySearch(users, "email", formEmail);
  if (lodash.isEmpty(userEmail)) {
    res.status(400).send('Please enter a correct Email and Password');
    return res.redirect("/login");
  }
  const formPassword = req.body["password"];
  const userID = userEmail[Object.keys(userEmail)[0]]["id"];
  if (!bcrypt.compareSync(formPassword, users[userID]["password"])) {
    res.status(400).send('Please enter a correct Email and Password');
    return res.redirect("/login");
  }
  req.session.userID = userID;
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  delete req.session.userID;
  return res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = {user: null};
  if (req.session.userID) return res.redirect("/urls");
  return res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (lodash.isEmpty(req.body["email"]) || lodash.isEmpty(req.body["password"])) {
    res.status(400).send('Please enter an Email and Password');
    return res.redirect("/register");
  }
  if (!lodash.isEmpty(helpers.propertySearch(users, "email", req.body["email"]))) {
    res.status(400).send('Please enter an Email not already in use on this website');
    return res.redirect("/register");
  }
  const userID = helpers.generateRandomString(42, users);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = {};
  users[userID]["id"] = userID;
  users[userID]["email"] = req.body["email"];
  users[userID]["password"] = hashedPassword;
  req.session.userID = userID;
  return res.redirect("/urls/");
});