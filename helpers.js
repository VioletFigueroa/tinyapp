// Libraries;

const lodash = require("lodash");

// Helper Functions:

const propertySearch = (object, key, value) => {
  // Takes an object of objects database, a key, and an expected value for that key value pair;
  let output = {};
  // Returns empty object if no matches found in objects;
  for (const id of Object.keys(object)) if (object[id][key] === value) output[id] = object[id];
  return output;
  // Returns the objects in object database that contains the key value pair in that object;
};

// Returns undefined if no matches found in objects;
const urlsForUser = (userID, database) => {
  // Takes in a UserID and an object of objects database;
  if (lodash.isEmpty(propertySearch(database, "userID", userID))) {
    return undefined;
  }
  return propertySearch(database, "userID", userID);
  // Returns the objects in object database that contains the UserID as a property is found in that object;
};

const getUserByEmail = (email, database) => {
  // Takes in a email and an object of objects database;
  if (lodash.isEmpty(propertySearch(database, "email", email))) {
    return undefined;
    // Returns undefined if no matches found in objects;
  }
  return propertySearch(database, "email", email)[Object.keys(database)[0]];
  // Returns the objects in object database that contains the email as a property is found in that object;
};

const generateRandomChar = () => {
  const chars = [
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
    '0','1','2','3','4','5','6','7','8','9'
  ];
  return chars[Math.floor(Math.random() * chars.length)];
  //Returns a random (lowercase only) a-z or 0-9 char;
};

const generateRandomString = (length, database) => {
  // Takes in a desired string length, an object of objects database the generated string will be used for;
  let randomString = ''; // If length is 0 or less, an empty string is returned;
  for (let i = 0; i < length; i++) {
    randomString += generateRandomChar();
  // Runs generateRandomChar() the given length amount of times, storing each return into a string output;
  }
  if (!lodash.isEmpty(propertySearch(database, "shortURL", randomString))) {
    return generateRandomString(length);
    // If the generated string matches a string already present in database, recursion is used to generate a different string;
  }
  return randomString;
  // Once a string generated is not already present in database, it returns that random string;
};

// Exports:

module.exports = {
  propertySearch,
  urlsForUser,
  generateRandomString,
  getUserByEmail
};