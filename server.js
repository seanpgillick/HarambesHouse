const express = require("express");
const app = express();

app.use(express.json())
app.use(express.static("public_html"));

////////////Database/////////////////

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

app.listen(process.env.PORT || 5000);
module .export = app; 
