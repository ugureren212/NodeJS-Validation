IMPORTANT: for application and test to run you must be in the /GLUE REPLY TEST directory 

How to run application
--------------------------------------------

1) install all dependencies using "npm install" in the terminal

2) Type "npm start" or "nodemon server" to start the server.
a message like "Example app listening at http://localhost:3000" should appear on the terminal.
This means the server is running.

3) I used "Postman" to send post requests with the json data. As there is no front end/UI i used postman to send data.

The format I used for the JSON data is 
 {
    username: "*must not contain spaces*",
    password: "*min length 8, at least one upper case letter & number*",
    email: "*must be in email format*",
    DOB: "*must be in the format of YYYY-MM-DD like (2000-02-29)*",
    creditCardNumber: "*credit card number must be 16 digits long and start with the number 4",
  }

IMPORTANT: for the post requests (like creating a new user) i only send one user details object. This application cant create multiple users at once.

4) You can test the /users, /users/Yes, /users/No endpoint by typing the endpoint (like http://localhost:3000/users) into the browser URL
Some user JSON data should be displayed to the screen


How to run jest test
--------------------------------------------

1) in the terminal enter "npm test"

--------------------------------------------

The .prettierrc file is just for the prettier file format extension i use to automatically format my code 