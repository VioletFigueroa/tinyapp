const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const lodash = require("lodash");

const bcrypt = require('bcrypt');


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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "fz7rsp6sc7wky8qohzsfeiw0qhachayizw18kkunff" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "3oqdszqj6vi2u7mnmqa9qr5z3tf08sz1oboq4kgv6g" }
};

const propertySearch = (object, key, value) => {
  //takes in object of objects, a key, and an expected value.
  let output = {};
  for (const id of Object.keys(object)) {
    if (object[id][key] === value) output[id] = object[id]; //Returns object in object if value is found in that object
  }
  return output;
  //returns empty object if no matches;
};

const urlsForUser = id => propertySearch(urlDatabase, "userID", id);

const generateRandomString = length => {
  const generateRandomChar = () => {
    const chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'];
    return chars[Math.floor(Math.random() * chars.length)];
  };
  let randomString = '';
  for (let i = 0; i < length; i++) randomString += generateRandomChar();
  if (!lodash.isEmpty(propertySearch(urlDatabase, "shortURL", randomString))) return generateRandomString(length);
  return randomString;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[userID], urls: urlsForUser(userID) };
  return res.render("urls_index", templateVars);
});

app.post("/urls/new", (req, res) => {
  const shortURL = generateRandomString(6);
  if (req.body.longURL) {
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  }
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  return res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  const templateVars = {user: null};
  if (req.cookies["user_id"]) return res.redirect("/urls");
  return res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  if (lodash.isEmpty(req.body["email"])) return res.status(403).send('Please Enter an email');
  const formEmail = req.body["email"];
  const userEmail = propertySearch(users, "email", formEmail);
  if (lodash.isEmpty(userEmail)) return res.status(403).send('Email or Password incorrect.');
  const formPassword = req.body["password"];
  const userID = userEmail[Object.keys(userEmail)[0]]["id"];
  if (!bcrypt.compareSync(formPassword, users[userID]["password"])) return res.status(403).send('Email or Password incorrect.');
  res.cookie("user_id", userID);
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  let templateVars = {user: null};
  if (req.cookies["user_id"]) return res.redirect("/urls");
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (lodash.isEmpty(req.body["email"])) return res.status(400).send('Email form is empty.');
  if (lodash.isEmpty(req.body["password"])) return res.status(400).send('Password form is empty.');
  if (!lodash.isEmpty(propertySearch(users, "email", req.body["email"]))) return res.status(400).send('Email already exists.');
  const userID = generateRandomString(42);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = {};
  users[userID]["id"] = userID;
  users[userID]["email"] = req.body["email"];
  users[userID]["password"] = hashedPassword;
  res.cookie("user_id", userID);
  return res.redirect("/urls");
});
app.post("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"] || req.cookies["user_id"] !== urlDatabase[req.params.id]["userID"]) return res.redirect("/login");
  urlDatabase[req.params.id]["longURL"] = req.body["longURL"];
  return res.redirect(`/urls/${req.params.id}`);
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"] || req.cookies["user_id"] !== urlDatabase[req.params.id]["userID"]) return res.redirect("/login");
  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]["longURL"];
  const templateVars = { user, shortURL, longURL };
  if (!urlsForUser(user.shortURL)) return res.redirect("/urls");
  return res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]["longURL"];
  return res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies["user_id"] || req.cookies["user_id"] !== urlDatabase[req.params.id]["userID"]) return res.redirect("/login");
  if (req.params.id && urlDatabase[req.params.id]) delete urlDatabase[req.params.id];
  return res.redirect("/urls");
});

app.get("/urls/:id/delete", (req, res) => {
  if (!req.cookies["user_id"] || req.cookies["user_id"] !== urlDatabase[req.params.id]["userID"]) return res.redirect("/login");
  if (req.params.id && urlDatabase[req.params.id]) delete urlDatabase[req.params.id];
  return res.redirect("/urls");
});
