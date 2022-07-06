// require modules and packages
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");

// set up middleware
/*
Read this stackoverflow post on express.json() and express.urlencoded(): 
https://stackoverflow.com/questions/23259168/what-are-express-json-and-express-urlencoded
*/
// express.json() and express.urlencoded() are needed to handle POST and PUT/PATCH requests
// (Line below) so the server recognises the request object as a JSON object
app.use(express.json());
// (Line below) so the server recognises the request object as strings/arrays
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static("public"));

// instantiate variables
const cache = {};
const uploadDirectory = __dirname + path.sep + "uploaded";

// Promise Version of functions -- seperated
function write(name, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(uploadDirectory + path.sep + name, data, (error) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      resolve(name);
    });
  }).then(read);
}

function read(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(uploadDirectory + path.sep + file, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

// handle a request to list out all of the files within the folder uploaded
app.get("/directoryInformation", (req, res) => {
  fs.readdir(__dirname + "/uploaded", (error, information) => {
    if (error) {
      console.log(error);
    } else {
      console.log(information);
      res.send(information);
    }
  });
});

// handle file being sent to the server
app.post("/", (req, res) => {
  console.log(req.files.file);
  if (req.files.file) {
    cache[req.files.file.name] = write(
      req.files.file.name,
      req.files.file.data
    );
    cache[req.files.file.name].then(() => {
      // (Line below) it creates a downloadable link on the page
      res.send(req.files.file.name);
      // res.redirect("/"); // use the inbuilt html form methods post and action
    });
  }
});

// handle downloading a file from server
app.get("/uploaded/:filename", (req, res) => {
  console.log(cache, "<<<<< cache");
  // handle download if the item is in cache
  if (cache[req.params.filename]) {
    console.log(" in cache?");
    cache[req.params.filename].then((data) => {
      res.send(data);
    });
    // handle the download by first storing value in cache then giving it back
  } else {
    console.log(" not in cache?");
    cache[req.params.filename] = read(req.params.filename);
    cache[req.params.filename].then((data) => {
      console.log(cache, "<<<< cache after population");
      res.send(data);
    });
  }
});

app.delete("/uploaded/:filename", (req, res) => {
  console.log(req.params.filename);

  // (Lines below) fs.unlink() is used to asynchronously remove a file
  fs.unlink(__dirname + "/uploaded/" + req.params.filename, (error) => {
    if (error) {
      console.log(error);
    } else {
      res.send("deleted");
    }
  });
});

app.listen(8080, () => {
  console.log("Application listening to port 8080");
});
