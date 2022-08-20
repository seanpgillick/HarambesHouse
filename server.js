const bcrypt = require('bcryptjs');
const express = require("express");
const app = express();
const port = process.env.port || 3000;

app.use(express.json())
app.use(express.static("public_html"));

////////////Database/////////////////
var mysql = require('mysql');

app.get("/", function (req, res){
    res.send("It worked!");
})

app.get("/new", function (req, res){
    res.send("New also worked!");
})

app.listen(port, () => {
    console.log(`Listening at port: ${port}!!! :)`);
}); 
///////////////////////////
app.get('/', (req, res) => {
    res.send("Welcome to the home page")
});

module .export = app; 
