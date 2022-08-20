const bcrypt = require('bcryptjs');
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(express.static("public_html"));

////////////Database/////////////////
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : "awseb-e-j9he8xpf7w-stack-awsebrdsdatabase-yc6x43yxbvqs.csom7akhuxci.us-east-1.rds.amazonaws.com",
    user     : "harambe",
    password : "password!",
    port     : "3306",
    database : "Harambe"
});

app.post("/login", function (req, res) {
    let accountInfo = [[req.body.username, req.body.plaintextPassword]]; 
    const saltRounds = 10;
    let hashVal;

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(req.body.plaintextPassword, salt, (err, hash) => {
            if (err) {
                console.error('Failed to bcrypt: ' + err);
            }
            else{
                hashVal = hash;
                let loginToken = Math.floor(Math.random() * 99999999) + 10000000;

                connection.query("SELECT hashed_password FROM accountInfo WHERE username = ?", [req.body.username], function(err, result){
                    if (err) {
                        console.error('Failed to search: ' + err);
                        res.status(500).send();
                    }
                    else if (result.length > 0) {
                        let storedHash = result[0]["hashed_password"];
                        if (storedHash.length > 0){
                            bcrypt.compare(req.body.plaintextPassword, storedHash, function(err, hashMatch) {
                                if (hashMatch){
                                    //passwords match, insert a login token
                                    connection.query("Update accountInfo SET loginToken = ? WHERE username = ?", [loginToken, req.body.username], function(err, result){
                                        if (err) {
                                            console.error('Failed to insert token: ' + err);
                                            res.status(500).send();
                                        }
                                        else{
                                            res.status(200).send();
                                        }
                                    });

                                }
                                else{
                                    res.status(501).send("Invalid Password");
                                }
                            });
                        }
                    }
                    //username not in db
                    else{
                        console.log("LoginToken: "+loginToken);
                        connection.query("INSERT INTO accountInfo (username, hashed_password, loginToken) VALUES ?", [[[req.body.username, hashVal, loginToken]]], function(err, result){
                            if (err) {
                                console.log("FAILED insert with new account token")
                                console.log(err);
                                res.status(500).send();
                            }
                            else{
                                console.log("Inserted token: "+loginToken);
                                res.status(200).send();
                            }
                        })
                    }
                });
            }
        })
    });
});

app.post("/deposit", function (req, res) {
    let dbBal;
    let dbToken;
    connection.query("SELECT * FROM accountInfo WHERE username = ?", [req.body.username], function(err, result){
        if (err) {
            console.error('Failed to search: ' + err);
            res.status(500).send();
        }
        console.log(result[0]);

        if (result.length > 0){
            dbBal = parseFloat(result[0]["balance"]);
            dbBal += parseFloat(req.body.deposit);
            dbToken = result[0]["loginToken"];
            
            connection.query("Update accountInfo SET balance = ? WHERE username = ?", [dbBal, req.body.username], function(err, result){
                if (err) {
                    console.error('Failed to search: ' + err);
                    res.status(500).send();
                }
                else{
                    depositReturn = {"username" : req.body.username, "balance" : dbBal, "dbToken" : dbToken};
                    res.status(200).json(depositReturn);
                }
            });
        }
    });
});

app.get("/", function (req, res){
    res.send("It worked!");
})

app.get("/new", function (req, res){
    res.send("New also worked!");
})

// app.listen(port, () => {
//     console.log(`Listening at port: ${port}!!! :)`);
// }); 
// ///////////////////////////
// app.get('/', (req, res) => {
//     res.send("Welcome to the home page")
// });

app.listen(process.env.PORT || 5000);
module .export = app; 
