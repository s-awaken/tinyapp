const { assert } = require('chai');

const {  findUserByEmail, findEmailByID, urlsForUser, hashPassword } = require("../helpers");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", users);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
});

describe("findEmailByID", () => {
  it("should return user@example.com", () => {
    const email = findEmailByID('userRandomID', users);
    const expectedOutput = "user@example.com";
    assert.equal(email, expectedOutput);
  });
});

describe("urlsForUser", () => {
  it("should return all urls belonging to that user", () => {
    const urls = urlsForUser('user2RandomID', urlDatabase);
    const expectedOutput = {
      b6UTxQ: "https://www.tsn.ca",
      i3BoGr: "https://www.google.ca"
    };
    assert.deepEqual(urls, expectedOutput);
  });
});