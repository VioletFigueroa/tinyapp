const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.deepEqual(user, testUsers[expectedOutput], "Correct user object was not passed.");
  });
  it('should return undefined with a invalid email', () => {
    const user = getUserByEmail("notUser@example.com", testUsers);
    assert.isUndefined(user, "Invalid email did not return undefined.");
  });
});