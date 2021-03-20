const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const users = {
  "fz7rsp6sc7wky8qohzsfeiw0qhachayizw18kkunff": {
    id: "fz7rsp6sc7wky8qohzsfeiw0qhachayizw18kkunff",
    "email": "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "3oqdszqj6vi2u7mnmqa9qr5z3tf08sz1oboq4kgv6g": {
    id: "3oqdszqj6vi2u7mnmqa9qr5z3tf08sz1oboq4kgv6g",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const propertySearch = (object, key, value) => {
  //takes in object of objects, a key, and an expected value.
  for (const obj of Object.keys(object)) {
    if (object[obj][key] === value) return object[obj]; //Returns object in object if value is found in that object
  }
  return false;
  //returns false if not found on any of the objects in object;
};

const generateRandomString = length => {
  const generateRandomChar = () => {
    const chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'];
    return chars[Math.floor(Math.random() * chars.length)];
  };
  let randomString = '';
  for (let i = 0; i < length; i++) randomString += generateRandomChar();
  for (const shortURL in Object.keys(urlDatabase)) if (shortURL === randomString) return generateRandomString(length);
  return randomString;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (!req.cookies) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies.user_id], urls:  urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls/new", (req, res) => {
  const shortURL = generateRandomString(6);
  if (req.body['longURL']) urlDatabase[shortURL] = req.body['longURL'];
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies.user_id] };
  return res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  let templateVars = {user: null};
  if (req.cookies.user_id) res.redirect(`/urls/`);
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const formEmail = req.body["email"];
  const userEmail = propertySearch(users, "email", formEmail);
  const formPassword = req.body["password"];
  const userPassword = propertySearch(users, "password", formPassword);
  if (!userEmail || !userPassword || userEmail["password"] !== formPassword) {
    return res.status(403).send('Username or Password incorrect.');
  }
  const user = userEmail["id"];
  res.cookie("user_id", user);
  res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls/`);
});

app.get("/register", (req, res) => {
  let templateVars = {user: null};
  if (req.cookies.user_id) return res.redirect(`/urls/`);
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "") return res.status(400).send('Email form is empty.');
  if (req.body.password === "") return res.status(400).send('Password form is empty.');
  if (propertySearch(users, "email", req.body.email)) return res.status(400).send('Email already exists.');
  const id = generateRandomString(42);
  users[id] = req.body;
  users[id]["id"] = id;
  //console.log(users);
  res.cookie("user_id", id);
  res.redirect(`/urls/`);
});

app.post("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: req.body['longURL']};
  urlDatabase[templateVars.shortURL] = templateVars.longURL;
  res.redirect(`/urls/`);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.params.shortURL && urlDatabase[req.params.shortURL]) delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

app.get("/urls/:shortURL/delete", (req, res) => {
  if (req.params.shortURL && urlDatabase[req.params.shortURL]) delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});
