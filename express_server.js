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

const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};
// --- URLs ---
app.get("/", (req, res) => {
  res.render("index");
});
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
    res.render("index");
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

// --- REGISTER ---

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const id = gerenateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = findUserByEmail(email);

  if (!email && !password) {
    return res.sendStatus(400);
  }
  if (foundUser) {
    return res.sendStatus(400);
  }
  const newUser = {id: id, email: email, password: password};
  users[id] = newUser;
  console.log(users);
  res.cookie("user_id", id);

  res.redirect("/login");
});

// --- LOGIN ---
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.send('email and password cannot be blank');
  }

  const foundUser = findUserByEmail(email);

  if (foundUser === null || foundUser.password !== password) {
    return res.sendStatus(403);
  }
  res.cookie('user_id', foundUser.id);
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  
  res.render("login");
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
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
