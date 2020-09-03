const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcrypt');


const app = express();
const PORT = 8080;


app.set("view engine", "ejs");

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', "key2"]
}));


const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};
const findUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};
const findEmailByID = (id) => {
  for (const user in users) {
    if (user.id === id) {
      return user.email;
    }
  }
  return;
};
const urlsForUser = (id) => {
  const URLs = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      URLs[url] = urlDatabase[url].longURL;
    }
  }
  return URLs;
};
const hashPassword = (password) => {
  return bcrypt.hashSync(password, 2);
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123",
    logged: false
  },
  "12bn13": {
    id: "12bn13",
    email: "user2@example.com",
    password: '456',
    logged: false
  }
};
// --- URLs ---
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/urls", (req, res) => {
  if (req.session["user_id"]) {
    const id = req.session["user_id"];
    const user = findEmailByID(id);
    const URLs = urlsForUser(id);
    let templateVars = {
      userId: id,
      email: user,
      urls: URLs
    };
    res.render("urls_index", templateVars);
  } else {
    res.render("login");
  }
});

app.get("/urls/:shortURL/show", (req, res) => {
  if (req.session["user_id"]) {
    const shortURL = req.params.shortURL;
    const id = req.session["user_id"];
    const user = findEmailByID(id);
    let templateVars = {
      shortURL: req.params.shortURL, longURL: urlDatabase[shortURL], userId: id, email: user
    };
    res.render('urls_show', templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
    const id = req.session["user_id"];
    const user = findEmailByID(id);
    let templateVars = {userId: id, email: user};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
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
  const foundUser = findUserByEmail(email);
  const hashedPassword = hashPassword(password);

  if (!email && !password) {
    return res.sendStatus(400);
  }
  if (foundUser) {
    return res.sendStatus(400);
  }
  const newUser = {id: id, email: email, password: hashedPassword};
  users[id] = newUser;
  req.session["user_id"] = id;

  res.redirect("/login");
});

// --- LOGIN ---
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const hashedPassword = hashPassword(password);

  const foundUser = findUserByEmail(email);

  if (foundUser !== null) {

    bcrypt.compare(users[foundUser.id].password, hashedPassword, (err, result) => {
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
  res.clearCookie('user_id');
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
// --- GET URL JSON ---
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: http://localhost:${PORT}`);
});
