const { selectErrorCode, isInUsers, getAge } = require("./server");

//some methods I was not able to test properly, like "allErrorMsg()" as the errors object (generated by the express-validator library) was very complex.
//the documentation provided from them was not very clear so i decided to focus on other unit tests

describe("all unit tests", () => {
  test("test if a 400 code is returned with the allErrors[] is not empty", () => {
    expect(
      selectErrorCode(
        "Credit Card number must be 16 digit long and must start with a number 4"
      )
    ).toEqual(400);
  });

  //cannot test if selectErrorCode(errors) return other error code (402, 403) for other error messages not listed in switch case
  //this is because the errors array object is from the express-validator library. So it is not documented how to test it
  //but if an there are any error messages in the errors array a 400 error must be returned
});

describe("isInUsers", () => {
  test("test if isInUsers() returns true if user already exists in users[]", () => {
    expect(isInUsers("user1withcard")).toEqual(true);
  });

  test("test if isInUsers() returns false if user does not exists in users[]", () => {
    expect(isInUsers("aUserThatDoesNotExist")).toEqual(false);
  });
});

describe("getAge", () => {
  test("test if getAge() returns users age (user DOB must be in IS0 8601 format)", () => {
    expect(getAge("1999-03-21")).toEqual(22);
  });
});
