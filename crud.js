// Assigning the database to a variable
// Import core and local modules
const studentDB = require("./db/database.json");
//Calling the http module
const http = require("http");
//Assigning the port number
const PORT = 8080;
//Calling our fs module
const fs = require("fs");

//Creating the server and the server uses a call back function for handling the request and response
const server = http.createServer((req, res) => {
  // Destructuring the url and method from the request object
  const { url, method } = req;
  const uuid = require("uuid").v4();

  // Handle POST request to /create-student

  //Making sure our URL is strictly equal to /students and the method is POST
  if (url === "/create-student" && method === "POST") {
    //Assigning an empty string to the body variable
    //This will hold the data that will be sent in the request body
    let body = "";
    //Registering an event listener for the 'data' event on the request object
    // Triggered when data chunks are received from the client.
    //The chunks of data are received in the form of a buffer
    req.on("data", (chunks) => {
      // Appending the chunks of data to the body variable i.e the body variable will hold the complete data sent from postman
      body += chunks;
    });
    // Registering an event listener for the 'end' event on the request object through a callback function
    //The end event is triggered when all the data has been received
    // At this point, we can parse the body variable to get the data in JSON format
    req.on("end", () => {
      // Parsing the body variable to get the data in JSON format
      const data = JSON.parse(body);

      // Assigning the data of the student to a variable
      // This will be used to create a new student object making sure that each student has a unique ID
      // The student object will have the following properties: name, age, gender, isEmployed
      // Assigning and making sure that the data sent from postman is in the correct format
      const student = {
        // Assigning the id of the student to the length of the studentDB array + 1
        // This will ensure that each student has a unique ID
        id: uuid,
        //Making sure that the key name is in the correct format and the value is the name of the student
        name: data.name,
        //Making sure that the key age is in the correct format and the value is the age of the student
        age: data.age,
        //Making sure that the key gender is in the correct format and the value is the gender of the student
        gender: data.gender,
        //Making sure that the key isEmployed is in the correct format and the value is a boolean
        isEmployed: data.isEmployed,
      };
      // Pushing the student object to the studentDB array
      studentDB.push(student);
      //   console.log(studentDB);
      //Using the fs module to write the studentDB array to the database.json file
      // Convert studentDB to a formatted JSON string and write it to the database.

      //Calling a callback function that takes an error and data as parameters
      fs.writeFile("./db/database.json", JSON.stringify(studentDB, null, 2), (err, data) => {
        // Checking if there is an error
        if (err) {
          //If there is an error, send a response with a status code of 400 and a message indicating that there was an error
          res.writeHead(400, { "content-type": "text/plain" });
          // Sending the error message as the response
          res.end("Bad Request");
          // If there is no error, send a response with a status code of 201 and a message indicating that the student was created successfully
        } else {
          res.writeHead(201, { "content-type": "application/json" });
          // Sending the response message as a JSON string for postman to understand and display the message
          // Send JSON response back to the client.

          res.end(
            JSON.stringify({
              // The message showing that the student was created successfully
              message: "Student created successfully",
              // The data of the student that was created
              data: student,
            })
          );
        }
      });
    });
  } else if (url.startsWith("/students") && method === "GET") {
    if (studentDB.length < 1) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("No student found");
    } else {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Welcome to the Student Management System",
          total: studentDB.length,
          data: studentDB,
        })
      );
    }
  } else if (url.startsWith("/student/") && method === "GET") {
    const id = url.split("/")[2];
    const student = studentDB.find((s) => s.id === id);
    if (!student) {
      res.writeHead(500, { "content-type": "text/plain" });
      res.end("Error Updating Student");
    } else {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Student found",
          data: student,
        })
      );
    }
  } else if (url.startsWith("/delete-student/") && method === "DELETE") {
    const id = url.split("/")[2];
    const index = studentDB.findIndex((s) => s.id === id);
    if (index !== -1) {
      studentDB.splice(index, 1);
      fs.writeFile("./db/database.json", JSON.stringify(studentDB, null, 2), (err) => {
        if (err) {
          res.writeHead(400, { "content-type": "text/plain" });
          res.end("student not found");
        } else {
          res.writeHead(200, { "content-type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Student deleted successfully",
              data: { id },
            })
          );
        }
      });
    }
  } else {
    res.writeHead(400, { "content-type": "text/plain" });
    res.end("Invalid URL");
  }
});

//Listening to the server port that has been assigned
// the server will listen to the port and will log a message to the console when it is running
server.listen(PORT, () => {
  //The message that will be logged to the console when the server is running
  console.log(`Server is running on port: ${PORT}`);
});
