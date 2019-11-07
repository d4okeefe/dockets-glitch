"use strict";

var express = require("express");
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "pug");

var router = require("./routes/router");
app.use("/", router);

// // MONGOOSE DB
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
//var mongoDB = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0-jdy6d.gcp.mongodb.net/dockets2?retryWrites=true&w=majority`;
var mongoDB = `mongodb+srv://d4okeefe:vHAIB3JXlgIBnWRz@cluster0-jdy6d.gcp.mongodb.net/dockets2?retryWrites=true&w=majority`;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
    console.log("Your app is listening on port " + listener.address().port);
});
