// Libraries;
const lodash = require("lodash");
// Takes an object of objects database, a key, and an expected value for that key value pair;
// Returns the objects in object database that contains the key value pair in that object;
// Returns empty object if no matches found in objects;
const propertySearch = (object, key, value) => {
  let output = {};
  for (const id of Object.keys(object)) if (object[id][key] === value) output[id] = object[id];
  return output;
};
// Takes in a UserID and an object of objects database;
// Returns the objects in object database that contains the UserID as a property is found in that object;
// Returns undefined if no matches found in objects;
const urlsForUser = (userID, database) => lodash.isEmpty(propertySearch(database, "userID", userID)) ? undefined : propertySearch(database, "userID", userID);
// Takes in a email and an object of objects database;
// Returns the objects in object database that contains the email as a property is found in that object;
// Returns undefined if no matches found in objects;
const getUserByEmail = (email, database) => lodash.isEmpty(propertySearch(database, "email", email)) ? undefined : propertySearch(database, "email", email)[Object.keys(database)[0]];
//Returns a random (lowercase only) a-z or 0-9 char;
const generateRandomChar = () => {
  const chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'];
  return chars[Math.floor(Math.random() * chars.length)];
};
// Takes in a desired string length, an object of objects database the generated string will be used for;
// If length is 0 or less, an empty string is returned;
// Runs generateRandomChar() the given length amount of times, storing each return into a string output;
// If the generated string matches a string already present in database, recursion is used to generate a different string;
// Once a string generated is not already present in database, it returns that random string;
const generateRandomString = (length, database) => {
  let randomString = '';
  for (let i = 0; i < length; i++) randomString += generateRandomChar();
  if (!lodash.isEmpty(propertySearch(database, "shortURL", randomString))) return generateRandomString(length);
  return randomString;
};

module.exports = { propertySearch, urlsForUser, generateRandomString, getUserByEmail };