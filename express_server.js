const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcrypt');

const { generateRandomString,findUserByEmail, findEmailByID, urlsForUser, hashPassword } = require("./helpers");

const app = express();
const PORT = 8080;


app.set("view engine", "ejs");

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', "key2"]
}));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123"
  },
  "12bn13": {
    id: "12bn13",
    email: "user2@example.com",
    password: '456'
  }
};
// --- URLs ---
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/urls", (req, res) => {
  if (req.session["user_id"]) {
    const id = req.session["user_id"];
    const email = findEmailByID(id, users);
    console.log(email);
    const URLs = urlsForUser(id, urlDatabase);
    let templateVars = {
      userId: id,
      email: email,
      urls: URLs
    };
    res.render("urls_index", templateVars);
  } else {
    res.render("login");
  }
});
app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
    const id = req.session["user_id"];
    const email = findEmailByID(id, users);
    let templateVars = {userId: id, email: email};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
app.get("/urls/:shortURL", (req, res) => {
  if (req.session["user_id"]) {
    const shortURL = req.params.shortURL;
    const id = req.session["user_id"];
    const email = findEmailByID(id, users);
    let templateVars = {
      shortURL: req.params.shortURL, longURL: urlDatabase[shortURL].longURL, userId: id, email: email
    };
    res.render('urls_show', templateVars);
  }
});
// --- REGISTER ---

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = findUserByEmail(email, users);

  if (email && password && foundUser === null) {
    
    const hashedPassword = hashPassword(password);
    
    users[id] =  {id: id, email: email, password: hashedPassword};
    
    req.session["user_id"] = id;
    
    res.redirect("/urls");
  } else {
    res.redirect("/register");
  }
});

// --- LOGIN ---
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  

  const foundUser = findUserByEmail(email, users);

  if (foundUser) {
    console.log(foundUser);
    bcrypt.compare(password, users[foundUser.id].password, (err, result) => {
      if (result) {
        req.session['user_id'] = foundUser.id;
        res.redirect("/urls");
      } else {
        res.redirect("/register");
      }
    });
    
  } else {
    res.redirect("/login");

  }
  
});
app.get("/login", (req, res) => {
  if (!req.session['user_id']) {
    res.render("login");
  } else {
    res.redirect("/urls");
  }
});

// --- LOGOUT ---
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/login");
});

// --- NEW URL ---
app.post("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: longURL, userID: req.session["user_id"] };
    res.redirect("/urls");
  }
});

// --- DELETE URL ---
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session["user_id"]) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect(`/urls/`);
  } else {
    res.redirect("/login");
  }
});

// EDIT URL
app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session["user_id"]) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session["user_id"]};
    res.redirect(`/urls`);
  } else {
    res.redirect("/login");
  }
});
app.get("/urls/:shortURL/edit", (req, res) => {
  if (req.session["user_id"]) {
    const shortURL = req.params.shortURL;
    const id = req.session["user_id"];
    const email = findEmailByID(id, users);
    let templateVars = {
      shortURL: req.params.shortURL, longURL: urlDatabase[shortURL].longURL, userId: id, email: email
    };
    res.render('urls_edit', templateVars);
  }
});
// --- GET URL JSON ---
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: http://localhost:${PORT}`);
});


module.exports = { findUserByEmail, findEmailByID, urlsForUser, hashPassword};