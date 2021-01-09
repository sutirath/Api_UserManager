const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup Admin``````````````
var admin = require("firebase-admin");

var serviceAccount = require("../Beekeeper/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bee-app-65be5.firebaseio.com",
});

app.get("/", (req, res) => {
  res.json("Helloworld");
});

app.get("/getAllUser", (req, res) => {
  admin
    .auth()
    .listUsers()
    .then(function (userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      // console.log('Successfully fetched user data:', userRecord);
      res.json(userRecord);
    })
    .catch(function (error) {
      console.log("Error fetching user data:", error);
    });
});

app.post("/getUser", (req, res) => {
  admin
    .auth()
    .getUser(req.body.uid)
    .then((userRecord) => {
      console.log("Success");
      res.json(userRecord);
    })
    .catch((error) => {
      console.log("Error fetching user data:", error);
    });
});

app.post("/SetStatus", (req, res) => {
  admin
    .auth()
    .setCustomUserClaims(req.body.id, { User: req.body.UserStatus })
    .then(() => {
      res.json("Success");
    });
});

app.post("/CreateUser", async (req, res) => {
  await admin
    .auth()
    .createUser({
      email: req.body.email,
      password: req.body.password,
      displayName: req.body.displayName,
      phoneNumber: req.body.phoneNumber,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
      // res.json(userRecord.uid);
      admin
        .auth()
        .setCustomUserClaims(userRecord.uid, {
          User: req.body.UserStatus,
          Farm: req.body.idFarm,
          FarmName: req.body.farmName,
          IdCard:req.body.IdCard,
        })
        .then(() => {
          res.json(userRecord.uid);
        });
    })
    .catch((error) => {
      console.log("Error creating new user:", error);
    });
});

app.get("/ShowAdmin", (req, res) => {
  admin
    .auth()
    .getUser(req.body.id)
    .then((userRecord) => {
      // The claims can be accessed on the user record.
      console.log(userRecord.customClaims["admin"]);
      res.json(userRecord);
    });
});

app.delete("/DeleteUser", (req, res) => {
  admin
    .auth()
    .deleteUser(req.body.uid)
    .then(() => {
      res.json("Delete Success");
    })
    .catch((error) => {
      console.log("Error deleting user:", error);
      res.json(error);
    });
});

app.put("/UpdateUser", (req, res) => {
  admin
    .auth()
    .updateUser(req.body.uid, {
      email: req.body.email,
      displayName: req.body.displayName,
      phoneNumber: req.body.phoneNumber,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      admin
        .auth()
        .setCustomUserClaims(req.body.uid, {
          User: req.body.UserStatus,
          Farm: req.body.idFarm,
          FarmName: req.body.farmName,
        })
        .then(() => {
          res.json(userRecord.uid);
        })
        .catch((error) => {
          res.json(error);
        });
    })
    .catch((error) => {
      res.json(error);
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});

module.exports = app;
