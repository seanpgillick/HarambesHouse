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

////////////////////////////////BLACKJACK////////////////////////////////
app.post("/blackjack", function (req, res) { 
    //Determine which putton the user clicked
    let action = req.body.action;
    betAmount = req.body.betAmount;

    connection.query("SELECT balance FROM accountInfo WHERE username = ? AND loginToken = ?", [req.body.user, req.body.dbToken], function(err, result){
        if (err) {
            console.error('Failed to pull balance: ' + err);
            res.status(500).send();
        }

        if (result.length > 0){
            dbBalance = parseFloat(result[0]["balance"]);            
            
            if (betAmount > dbBalance){
                res.status(403).json({"validBet":false}); 
            }
            let cardVals = {"A":11, "2": 2, "3": 3, "4":4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 10, "Q": 10, "K": 10};
             
            if (action == "startGame"){
                userCards = [];
                userVals = [];
                userSum = 0;
                dealerCards = [];
                dealerVals = [];
                dealerSum = 0;
                 
                //User has started a game
                //Need to generate and return 4 cards, 1 of the dealers card will be hidden to start.
                //Once a card as been used, remove it from the pile.
                cards = {0:"AS", 1: "2S", 2: "3S", 3: "4S", 4: "5S", 5: "6S", 6: "7S", 7: "8S", 8: "9S", 9: "10S", 10: "JS", 11: "QS", 12: "KS",
                         13:"AD", 14: "2D", 15: "3D", 16: "4D", 17: "5D", 18: "6D", 19: "7D", 20: "8D", 21: "9D", 22: "10D", 23: "JD", 24: "QD", 25: "KD",
                         26:"AH", 27: "2H", 28: "3H", 29: "4H", 30: "5H", 31: "6H", 32: "7H", 33: "8H", 34: "9H", 35: "10H", 36: "JH", 37: "QH", 38: "KH",
                         39:"AC", 40: "2C", 41: "3C", 42: "4C", 43: "5C", 44: "6C", 45: "7C", 46: "8C", 47: "9C", 48: "10C", 49: "JC", 50: "QC", 51: "KC"}

                for (let x = 3; x>=0; x--){
                    let cardNum = Math.floor(Math.random() * 52);
                    while (!(cardNum in cards) && Object.keys(cards).length > 0){
                        cardNum = Math.floor(Math.random() * 52);
                    }

                    let cardVal = cards[cardNum].slice(0,-1)
                    cardVal = cardVals[cardVal];

                    //Users cards
                    if (x >= 2){
                        userCards.push(cards[cardNum]);
                        userVals.push(cardVal);
                        delete cards[cardNum];
                    }
                    else{
                        dealerCards.push(cards[cardNum]);
                        dealerVals.push(cardVal);
                        delete cards[cardNum];
                    }
                }

                let wasBlackjackHit = false;
                if ( (userVals[0] == 11 && userVals[1] == 10) || (userVals[0] == 10 && userVals[1] == 11 ) ){
                    dbBalance += ( Number(betAmount) * 1.5 );
                    wasBlackjackHit = true;
                }

                if ( (dealerVals[0] == 11 && dealerVals[1] == 10 ) || (dealerVals[0] == 10 && dealerVals[1] == 11) ){
                    dbBalance -= Number(betAmount);
                    wasBlackjackHit = true;
                }

                if (wasBlackjackHit){
                    connection.query("Update accountInfo SET balance = ? WHERE username = ?", [dbBalance, req.body.user], function(err, result){
                        if (err) {
                            console.error('Failed to update blackjack results: ' + err);
                            res.status(500).send();
                        }
                    });
                }

                let dSumStart = dealerVals[0];
                userSum = userVals.reduce((a, b) => a + b, 0);
                dealerSum = dealerVals.reduce((a, b) => a + b, 0);

                let cardReturn = {"userCards": userCards, "userSum": userSum, "dSumStart" : dSumStart, "dealerCards": dealerCards, "dealerSum": dealerSum, "wasBlackjackHit": wasBlackjackHit, "validBet":true};
                res.status(200).json(cardReturn);
            }
            else if( action == "hit"){
                let cardNum = Math.floor(Math.random() * 52);
                while (!(cardNum in cards) && Object.keys(cards).length > 0){
                    cardNum = Math.floor(Math.random() * 52);
                }

                let cardVal = cards[cardNum].slice(0,-1)
                cardVal = cardVals[cardVal];
                userCards.push(cards[cardNum]);
                userVals.push(cardVal)
                userSum = userVals.reduce((a, b) => a + b, 0);
                delete cards[cardNum];

                if (userSum > 21){
                    while(dealerSum < 17){
                        cardNum = Math.floor(Math.random() * 52);
                        while (!(cardNum in cards) && Object.keys(cards).length > 0){
                            cardNum = Math.floor(Math.random() * 52);
                        }

                        cardVal = cards[cardNum].slice(0,-1)
                        cardVal = cardVals[cardVal];
                        dealerCards.push(cards[cardNum]);
                        dealerVals.push(cardVal)
                        dealerSum = dealerVals.reduce((a, b) => a + b, 0);
                        delete cards[cardNum];
                    }
                }
                gameResults(userSum, dealerSum, betAmount, dbBalance, req.body.user);
                let hitReturn = {"userCards":userCards, "userSum": userSum, "dealerCards": dealerCards, "dealerSum": dealerSum};
                res.status(200).json(hitReturn);
            }
            else if ( action = "stand"){
                while(dealerSum < 17){
                    cardNum = Math.floor(Math.random() * 52);
                    while (!(cardNum in cards) && Object.keys(cards).length > 0){
                        cardNum = Math.floor(Math.random() * 52);
                    }

                    cardVal = cards[cardNum].slice(0,-1);
                    cardVal = cardVals[cardVal];
                    dealerCards.push(cards[cardNum]);
                    dealerVals.push(cardVal)
                    dealerSum = dealerVals.reduce((a, b) => a + b, 0);
                    delete cards[cardNum];
                }
                gameResults(userSum, dealerSum, betAmount, dbBalance, req.body.user);
                let standReturn = {"dealerCards": dealerCards, "dealerSum": dealerSum};
                res.status(200).json(standReturn);
            }
        }

        function gameResults(userSum, dealerSum, bet, balance, username){
            bet = Number(bet);
            balance = Number(balance);
            //Dealer Busts and Users dont - Users win
            if (dealerSum > 21 && userSum <= 21){
                balance += bet;
            }
            //Both the dealer and user bust - No payout or loss
            if(dealerSum > 21 && userSum > 21){
                balance += 0;
            }
            //The user busts but the dealer didn't - User loses
            if(dealerSum <= 21 && userSum > 21){
                balance -= bet;
            }
            //Nobody busts, user > dealer - User wins
            if (userSum > dealerSum && userSum <= 21){
                balance += bet;
            }
            //Nobody busts, dealer > user - User loses
            if(userSum <= dealerSum && dealerSum <= 21){
                balance -= bet;
            }
            //tie
            if (userSum == dealerSum && dealerSum <= 21){
                balance += 0;
            }
            
            connection.query("Update accountInfo SET balance = ? WHERE username = ?", [balance, username], function(err, gameRes){
                if (err) {
                    console.error('Failed to update blackjack results: ' + err);
                    res.status(500).send();
                }
            });
        }

    });
});

app.post("/getBal", function (req, res) {
    let dbBal;
    let dbToken;
    connection.query("SELECT balance FROM accountInfo WHERE username = ? AND loginToken = ?", [req.body.username, req.body.token], function(err, result){
        if (err) {
            console.error('Failed to pull balance: ' + err);
            res.status(500).send();
        }
        console.log(result[0]);

        if (result.length > 0){
            dbBal = parseFloat(result[0]["balance"]);            
            res.status(200).json({"balance" : dbBal});
        }
    });
});

app.post("/spin", function(req, res) {
    connection.query("SELECT balance FROM accountInfo WHERE username = ? AND loginToken = ?", [req.body.user, req.body.dbToken], function(err, result){
        if(err) {
            console.log(err);
        }
        if (result.length > 0){
            let dbBalance = parseFloat(result[0]["balance"]);
            let betAmount = parseFloat(req.body.bet);
                        
            if (betAmount > dbBalance){
                res.send({"validBet": false}); 
            }
            
            else {
                let resJson = {};
                for(var i = 0; i < 30; i++){
                    let list = [];
                    let rand1 = Math.floor(Math.random() * (5-1) + 1);
                    let rand2 = Math.floor(Math.random() * (5-1) + 1);
                    let rand3 = Math.floor(Math.random() * (5-1) + 1);
                    list.push(rand1);
                    list.push(rand2);
                    list.push(rand3);
                    resJson[i] = list;

                }
                res.status = 200;
                res.json(resJson);
            }
        }
    });
});

app.post("/pay/", (req, res) => {
    connection.query("SELECT balance FROM accountInfo WHERE username = ? AND loginToken = ?", [req.body.user, req.body.dbToken], function(err, result){
        if(err) {
            console.log(err);
        }
        if (result.length > 0){
            dbBalance = parseFloat(result[0]["balance"]);            

            
            let boardArray = req.body.board;
            let bet = req.query.bet;
            let payout = 0;
            let wLines = [];
            if (checkH(boardArray, 0)){
                payout += (boardArray[0][0] === .1)  ? bet*2 : bet*(boardArray[0][0]**2);
                wLines.push(0,1,2);
            }
            if (checkH(boardArray, 1)){
                payout += (boardArray[1][0] === .1)  ? bet*2 : bet*(boardArray[1][0]**2);
                wLines.push(3,4,5);
            }
            if (checkH(boardArray, 2)){
                payout += (boardArray[2][0] === .1)  ? bet*2 : bet*(boardArray[2][0]**2);
                wLines.push(6,7,8);
            }
            if (checkDr(boardArray)){
                payout += (boardArray[0][0] === .1)  ? bet*2 : bet*(boardArray[0][0]**2);
                wLines.push(0,4,8);
            }
            if(checkDl(boardArray)){
                payout += (boardArray[2][0] === .1)  ? bet*2 : bet*(boardArray[2][0]**2);
                wLines.push(2,4,6);
            }
            dbBalance += (payout-bet);
            connection.query("Update accountInfo SET balance = ? WHERE username = ?", [dbBalance, req.body.user], function(err, result){
                if (err) {
                    console.error('Failed to update slot results: ' + err);
                    res.status(500).send();
                }
            });
            res.send({"payout": payout, "lines": wLines, "dbBalance": dbBalance});
        }
    })
});


function checkH(arr, row){
    return ((arr[row][0] === arr[row][1]) && (arr[row][1] === arr[row][2]));
}
function checkDr(arr){
    return ((arr[0][0] === arr[1][1]) && (arr[1][1] === arr[2][2]));
}
function checkDl(arr){
    return ((arr[0][2] === arr[1][1]) && (arr[1][1] === arr[2][0]));
}

app.get("/", function (req, res){
    res.send("It worked!");
})

app.get("/new", function (req, res){
    res.send("New also worked!");
})

app.listen(process.env.PORT || 5000);
module .export = app; 
