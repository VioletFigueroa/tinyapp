const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = (length) => {
  const generateRandomChar = () => {
    const chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'];
    return chars[Math.floor(Math.random() * chars.length)];
  };
  let randomString = '';
  for (let i = 0; i < length; i++) randomString += generateRandomChar();
  for (const shortURL in Object.keys(urlDatabase)) if (shortURL === randomString) return generateRandomString(length);
  return randomString;
};

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.params[LongURL];
  console.log(urlDatabase[shortURL]);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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
