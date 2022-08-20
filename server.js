const express = require("express");
const app = express();

app.use(express.json())
app.use(express.static("public_html"));


app.get("/", function (req, res){
    res.send("It worked!");
})

app.get("/new", function (req, res){
    res.send("New also worked!");
})

app.listen(process.env.PORT || 5000);
module .export = app;