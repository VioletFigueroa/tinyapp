const lodash = require("lodash");

const propertySearch = (object, key, value) => {
  //takes in object of objects, a key, and an expected value.
  let output = {};
  for (const id of Object.keys(object)) {
    if (object[id][key] === value) output[id] = object[id]; //Returns object in object if value is found in that object
  }
  return output;
  //returns empty object if no matches;
};

const urlsForUser = (id, database) => lodash.isEmpty(propertySearch(database, "userID", id)) ? undefined : propertySearch(database, "userID", id);

const getUserByEmail = (email, database) => lodash.isEmpty(propertySearch(database, "email", email)) ? undefined : propertySearch(database, "email", email)[Object.keys(database)[0]];

const generateRandomChar = () => {
  const chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'];
  return chars[Math.floor(Math.random() * chars.length)];
};

const generateRandomString = (length, database) => {
  let randomString = '';
  for (let i = 0; i < length; i++) randomString += generateRandomChar();
  if (!lodash.isEmpty(propertySearch(database, "shortURL", randomString))) return generateRandomString(length);
  return randomString;
};

module.exports = { propertySearch, urlsForUser, generateRandomString, getUserByEmail };