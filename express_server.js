const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
const gerenateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = { shortURL: req.params.shortURL, longURL:  urlDatabase[shortURL]};
  res.render('urls_show', templateVars);
});
app.get("/urls/:shortURL/delete", (req, res) => {
  const urltoDelete = req.params.shortURL;
  console.log(urltoDelete);
  delete urlDatabase[urltoDelete];
  console.log(urlDatabase);
  res.redirect("urls/");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  const shortURL = gerenateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port: http://localhost:${PORT}`);
});
