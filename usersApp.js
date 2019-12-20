const express = require("express");
const app = express();


const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");



// const path = require ('path');

//Routes

const usersRoutes = require("./api/usersRoutes");




mongoose.connect( process.env.database, { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true)
const db = mongoose.connection;

db.on('error', err => {
    console.log('DataBase Error:'+err );
})

db.once('connected', () =>{
  console.log( 'connected to Users DB' );
})




//Log
app.use(morgan("dev"));

// app.use('/uploads', express.static('uploads'));




//Body Parser MW
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//Cors

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});



// Set Static Folder
app.use(express.static(path.join(__dirname,'../client')));

// Routes which should handle requests

app.use('/users', usersRoutes);


app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;