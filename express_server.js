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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "13be14": {
    id: "13be14",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "12bn13": {
    id: "12bn13",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const gerenateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const findEmailInUsers = (email) => {
  let found = null;
  for (const user in users) {
    if (user.email === email)
      found = true;
  }
  return found;
};

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const id = req.cookies["user_id"];
    const user = users[id];
    console.log(user);
    let templateVars = {
      email: user.email, // problem here
      urls: urlDatabase
    };
    console.log(req.cookies);
    res.render("urls_index", templateVars);
  } else {
    res.send("You have to log in or register first");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const shortURL = req.params.shortURL;
  let templateVars = {
    email: user.email,
    shortURL: req.params.shortURL, longURL: urlDatabase[shortURL]
  };
  res.render('urls_show', templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  let templateVars = {email: user.email };
  res.render("urls_new", templateVars);
});
// REGISTER
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const id = gerenateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const found = findEmailInUsers(email);

  if (!email && !password) {
    return res.send('400 email or password cannot be blank');
  }
  if (found) {
    return res.send('400 email is already in use');
  }

  users[id] = {id, email, password};
  console.log(users);
  res.cookie("user_id", id);

  res.redirect("/urls");
});

//LOGIN
app.post("/login", (req, res) => {

  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  res.render("login");
});
//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
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
