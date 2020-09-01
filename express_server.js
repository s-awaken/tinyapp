const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());


const gerenateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//LOGIN
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});
//LOGOUT
app.post("/logout", (req, res) => {
  res.cookie('username', req.body.username);
  res.clearCookie('username');
  res.redirect("/urls");
});
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL, longURL: urlDatabase[shortURL]
  };
  res.render('urls_show', templateVars);
});

// NEW URL
app.post("/urls", (req, res) => {
  const shortURL = gerenateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});
// DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls/`);
});

// EDIT URL
app.post("/urls/:shortURL/edit", (req, res) => {
  console.log("inside edit post request");
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/`);
});
// GET URL JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port: http://localhost:${PORT}`);
});
