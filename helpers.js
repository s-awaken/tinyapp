const bcrypt = require('bcrypt');

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};
const findUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};
const findEmailByID = (id, users) => {
  for (const userId in users) {
    if (userId === id) {
      return users[id].email;
    }
  }
  return;
};
const urlsForUser = (id, database) => {
  const URLs = {};
  for (const url in database) {
    if (id === database[url].userID) {
      URLs[url] = database[url].longURL;
    }
  }
  return URLs;
};
const hashPassword = (password) => {
  return bcrypt.hashSync(password, 2);
};
module.exports = {
  generateRandomString,
  findUserByEmail,
  findEmailByID,
  urlsForUser,
  hashPassword
};