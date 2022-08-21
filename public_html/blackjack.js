let userBody = document.getElementById("userTable");
let dealerBody = document.getElementById("dealerTable");
let userSumElement = document.getElementById("userSum");
let dealerSumElement = document.getElementById("dealerSum");
let bustMessage = document.getElementById("bustMessage");
let matchResults = document.getElementById("matchResults");
let betElement = document.getElementById("betAmount");

let balElement = document.getElementById("balance");
let username = getParameterByName('user');
let token = getParameterByName('token');

// get starting bal
getBalance(username,token);

function getBalance(user, dbToken){
    fetch("/getBal", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: user,
            token: dbToken
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("GET BAL");

        balElement.innerText = '$'+parseFloat(data.balance).toFixed(2);
    });
}

//access query string
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function printUserHand(userCards, userSum){
    while(userBody.firstChild){
        userBody.removeChild(userBody.firstChild);
    }
    let userTr = document.createElement("tr");

    for (let x = 0; x<userCards.length; x++){
        let userPics = userCards[x]+".png";
        let userPicElement = document.createElement("img");
        userPicElement.src = "cards/"+userPics;
        userPicElement.style.height = "100px";
        userTr.append(userPicElement);
    }
    
	userBody.append(userTr);
    console.log("userSum: "+userSum);
    userSumElement.innerText = userSum;
}

function printDealerHand(dealerCards, dealerSum){
    while(dealerBody.firstChild){
        dealerBody.removeChild(dealerBody.firstChild);
    }

    let dealerTr = document.createElement("tr");
    for (let x = 0; x<dealerCards.length; x++){
        let dealerPics = dealerCards[x]+".png";
        let dealerPicElement = document.createElement("img");
        dealerPicElement.src = "cards/"+dealerPics;
        dealerPicElement.style.height = "100px";
        dealerTr.append(dealerPicElement);
    }

	dealerBody.append(dealerTr);
    dealerSumElement.innerText = dealerSum;
    getBalance(username, token);
}

document.getElementById("hitButton").disabled = true;
document.getElementById("standButton").disabled = true;

//Start the game
document.getElementById("startGame").addEventListener("click", function () {
        betVal = betElement.value;
	fetch("/blackjack", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			action: "startGame",
            betAmount: betElement.value,
            user : username,
            dbToken : token
		})
	})
    .then(response => response.json())
    .then(data => {
        if (data.validBet == true){
            let hiddenHand = [data.dealerCards[0]];
            hiddenHand.push("gray_back");
            if (data.wasBlackjackHit == true){
                printUserHand(data.userCards, data.userSum);
                printDealerHand(data.dealerCards, data.dealerSum);
            }
            else{
                document.getElementById("hitButton").disabled = false;
                document.getElementById("standButton").disabled = false;
                printUserHand(data.userCards, data.userSum);
                printDealerHand(hiddenHand, data.dSumStart);
            }
        }
    });
});

//Hit
document.getElementById("hitButton").addEventListener("click", function () {
	fetch("/blackjack", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			action: "hit",
            betAmount: betElement.value,
            user : username,
            dbToken : token
		})
	})
    .then(response => response.json())
    .then(data => {
        printUserHand(data.userCards, data.userSum);

        if (data.userSum > 21){
            printDealerHand(data.dealerCards, data.dealerSum);
            document.getElementById("hitButton").disabled = true;
            document.getElementById("standButton").disabled = true;
        }
    });
});

//Stand
document.getElementById("standButton").addEventListener("click", function () {
	fetch("/blackjack", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			action: "stand",
            betAmount: betElement.value,
            user : username,
            dbToken : token
		})
	})
    .then(response => response.json())
    .then(data => {
        printDealerHand(data.dealerCards, data.dealerSum);
        document.getElementById("hitButton").disabled = true;
        document.getElementById("standButton").disabled = true;
    });
});