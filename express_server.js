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

app.post("/urls/new", (req, res) => {
  const shortURL = generateRandomString(6);
  if (req.body['longURL']) urlDatabase[shortURL] = req.body['longURL'];
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { user: null, urls:  urlDatabase };
  if (req.cookies) {
    //console.log(req.cookies);
    const user = req.cookies.user_id;
    //console.log(user);
    templateVars.user = users[user];
  }
  //console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {
  console.log(Object.keys(users));
  for (const user of Object.keys(users)) {
    if (users[user]["email"] === req.body["email"] && users[user]["password"] === req.body["password"]) {
      res.cookie("user_id", user);
    }
  }
  res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls/`);
});

app.get("/register", (req, res) => {
  let templateVars = {user: null};
  if (req.cookies.user_id) templateVars.user = users[req.cookies.user_id]['user'];
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "") return res.status(400).send('Email form is empty');
  if (req.body.password === "") return res.status(400).send('Password form is empty');
  for (const user of Object.keys(users)) {
    if (req.body.email === users[user]["email"]) return res.status(400).send('Email already exists');
  }
  const id = generateRandomString(42);
  users[id] = req.body;
  users[id]["id"] = id;
  console.log(users);
  res.cookie("user_id", id);
  res.redirect(`/urls/`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: null};
  if (req.cookies.user_id) templateVars.user = users[req.cookies.user_id]['user'];
  res.render("urls_new", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: req.body['longURL']};
  urlDatabase[templateVars.shortURL] = templateVars.longURL;
  res.redirect(`/urls/`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: null, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  if (req.cookies.user_id) templateVars.user = users[req.cookies.user_id]['user'];
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
