const { Console } = require("console");
const express = require("express");
//library i used to validate user post requests
const { body, validationResult, check } = require("express-validator");

const app = express();
const port = 3000;

//users[] is an array of temp user accounts
//I used an array to simulate a DB
var users = [
  {
    username: "user1withcard",
    password: "saaaa!!!!Aaaada1sd",
    email: "email@gmail.com",
    DOB: "2000-02-29",
    creditCardNumber: "4123456789456123",
  },
  {
    username: "user2withcard",
    password: "saaaa!!!!Aaaada1sd",
    email: "email@gmail.com",
    DOB: "2000-02-29",
    creditCardNumber: "4123456789456123",
  },
  {
    username: "user1nocard",
    password: "saaaa!!!!Aaaada1sd",
    email: "email@gmail.com",
    DOB: "2000-02-29",
    creditCardNumber: "",
  },
];

//allows me to access req data as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse the incoming requests with JSON payloads

//schema to validate user details before actuall account/user object is created
//This scheme uses the express-validator library. In this library the methods are chained
//together. For example .isAlphanumeric will check if the object property "username" is aplhanumeric.
//If false is returned then the .withMessage() will attach a custom error message to the errors array object
const userSchema = [
  check("username")
    .isAlphanumeric()
    .withMessage("username must be alphanumeric and must not contain spaces"),

  check("username")
    .custom((username) => {
      if (isInUsers(username)) {
        console.log("username exists already");
        return false;
      } else {
        console.log("user does not exist");
        return true;
      }
    })
    .withMessage("Username already exists"),

  check("password")
    .isLength({ min: 8 })
    .withMessage("password must contain minimum 8 characters")
    .matches(/^(?=.*[0-9])(?=.*[A-Z])/)
    .withMessage(
      "password must contain at least one uppercase letter and numbers"
    ),

  check("email").isEmail().withMessage("email is not a valid"),

  check("DOB")
    .isISO8601({ strict: false, strictSeparator: false })
    .withMessage(
      "DOB not in ISO 8601 format. Format must look like (2021-09-07T12:33:07.231Z) or (2009-02-29)"
    ),

  check("DOB").custom((DOB, { req, loc, path }) => {
    if (getAge(req.body.DOB) < 18) {
      throw new Error("user is under the age of 18 years old");
    } else {
      return true;
    }
  }),

  check("creditCardNumber")
    //visa credit card regex (card must start with number 4)
    .matches(/^4[0-9]{12}(?:[0-9]{3})?$/)
    .optional({ checkFalsy: true })
    .withMessage(
      "Credit Card number must be 16 digit long and must start with a number 4"
    ),
];

//schema to validate user payment details for the /payments post request
const paymentSchema = [
  check("creditCardNumber")
    //visa credit card regex (card must start with number 4)
    .matches(/^4[0-9]{12}(?:[0-9]{3})?$/)
    .optional({ checkFalsy: true })
    .withMessage(
      "Credit Card number must be 16 digit long and must start with a number 4"
    ),

  check("amount")
    .matches(/^([0-9]{1,3}$)/)
    .withMessage("amount must be up to a maximum 3 digit number"),
];

//i created a /register post endpoint to create new users.
//im not sure if this is what i was supposed to do but this is how i interpreted the spec
//scheme is passed through as a parameter to the post method. This is check if the incoming post json data meets
//criteria specified in the spec. I used express-validator library for the validation
app.post("/register", userSchema, (req, res) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  //if an error exists from a post request the error methof is exstracted and the first error message in the error object
  //will be used to select the corresponding error code.
  if (!errors.isEmpty()) {
    var allErrors = allErrorMsg(req);
    var errorCode = selectErrorCode(allErrors);
    return res.status(errorCode).json({ errors: errors.array() });
  }

  //if there are no errors then a user is created (push a user object into users[]) and a 201 status code is sent
  createUsers(req.body);
  res.sendStatus(201);
});

//the /payments post endpoint works exactly like the /register endpoint
//the only difference is the scheme used (paymentScheme) and that there are no user/payment objects created
app.post("/payments", paymentSchema, (req, res) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var allErrors = allErrorMsg(req);
    var errorCode = selectErrorCode(allErrors);
    return res.status(errorCode).json({ errors: errors.array() });
  }
  res.sendStatus(201);
});

//from the spec i interpreted the "no filter" for the /users enpoint as "no parameter"
//that is why this endpoint only return all users
app.get("/users", (req, res) => {
  res.send(users);
});

//in this /users endpoint if the "filter"/parameter is "yes" then a new array with users with credit card details is created and sent as a response
//if the "filter"/parameter is "no" then a new array with users without credit card details is created and sent as a response
app.get("/users/:creditCard", (req, res) => {
  var usersWithCreditCard = [];
  var usersWithoutCreditCard = [];

  if (req.params.creditCard == "Yes" || req.params.creditCard == "yes") {
    users.forEach((user) => {
      if (user.creditCardNumber != "") {
        usersWithCreditCard.push(user);
      }
    });
    res.send(usersWithCreditCard);
  } else if (req.params.creditCard == "No" || req.params.creditCard == "no") {
    users.forEach((user) => {
      if (user.creditCardNumber == "") {
        usersWithoutCreditCard.push(user);
      }
    });
    res.send(usersWithoutCreditCard);
  }
});

//simple console log to show the dev that the server is running
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

//function to create user object and push it into users global array
function createUsers(user) {
  var user = {
    username: user.username,
    password: user.password,
    email: user.email,
    DOB: user.DOB,
    creditCardNumber: user.creditCardNumber,
  };
  users.push(user);
}

//function to get users age from the ISO 8601 format
//this function is used to validate a users age
function getAge(DOB) {
  var today = new Date();
  var birthDate = new Date(DOB);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

//function used to check if username already exists in users[]
function isInUsers(user) {
  if (users.length == 0) {
    //check if users array is empty
    return false;
  } else {
    //returns true if username already exists
    return users.some((existingUser) => existingUser.username == user);
  }
}

//the express-validator library has a errors object that contains all errors generated by the schema (like userSchema & paymentSchema)
//however to extract the error messages and be able to user it like a regular array i had to create this function
function allErrorMsg(req) {
  var allMsg = [];
  const result = validationResult(req);

  result.array().forEach((error) => {
    allMsg.push(error.msg);
  });
  return allMsg;
}

//to return the correct error code i created a function that returns a corresponsing error code depening on the FIRST error message
function selectErrorCode(allErrors) {
  var firstErrorMsg = allErrors[0];

  switch (firstErrorMsg) {
    case "user is under the age of 18 years old":
      return 403;
    case "Username already exists":
      return 409;
    case "Credit Card number must be 16 digit long and must start with a number 4":
      return 404;
    default:
      return 400;
  }
}

//these methods are exported for jest unit testing
//some methods I was not able to test properly, like "allErrorMsg()" as the errors object (generated by the express-validator library) was very complex.
//the documentation provided from them was not very clear so i decided to focus on other unit tests
module.exports = { selectErrorCode, isInUsers, getAge };
