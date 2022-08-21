//adapted from and improved upon from prior classwork 


let spin = document.getElementById("spin-button");
let demo = document.getElementById("demo-button");
let balElement = document.getElementById("balance");
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('user');
const token = urlParams.get('token');

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
        balElement.innerText = $+ parseFloat(data.balance).toFixed(2);
    });
}

spin.addEventListener("click", function(){
    spin.disabled = true;
    if (checkBal()){
        spin.disabled = false;
        return;
    }
    let bet = document.getElementById("bet").value;

    document.getElementById("amount").innerText = bet;
    
    fetch('/spin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"bet": bet, "user": username, "dbToken": token})
    })
    .then(response => response.json())
    .then(async function(data){
        if(data.hasOwnProperty("validBet")){
            spin.disabled = false;
            return;
        }
        else{
            let size = Object.keys(data).length;
            if (document.getElementById("0").childElementCount > 0) {
                for (var x = 0; x < 9; x ++) {
                    document.getElementById(x).removeChild(document.getElementById(x).firstChild);
                }
            }
            document.getElementById("0").append(findImg(data[0][0]));
            document.getElementById("1").append(findImg(data[0][1]));
            document.getElementById("2").append(findImg(data[0][2]));
            document.getElementById("3").append(findImg(data[1][0]));
            document.getElementById("4").append(findImg(data[1][1]));
            document.getElementById("5").append(findImg(data[1][2]));
            document.getElementById("6").append(findImg(data[2][0]));
            document.getElementById("7").append(findImg(data[2][1]));
            document.getElementById("8").append(findImg(data[2][2]));
            for(var x = 0; x < 3; x++) {
                let runT = Math.floor(Math.random() * ((size*2) - size) + size);
                for (var i = 0; i < runT; i++){
                    let top = i;
                    let mid;
                    let bot;
                    if (i >= size) {
                        if (i >= (size*2)){
                            top = i - (size*2);
                        }
                        else {
                            top = i - size;
                        }
                    }

                    mid = top - 1;
                    bot = top - 2;

                    if(mid < 0){
                        mid = size + mid;
                    }

                    if(bot < 0){
                        bot = size + bot;
                    }

                    if (x === 0) {

                        document.getElementById("0").removeChild(document.getElementById("0").firstChild);
                        document.getElementById("1").removeChild(document.getElementById("1").firstChild);
                        document.getElementById("2").removeChild(document.getElementById("2").firstChild);
                        document.getElementById("3").removeChild(document.getElementById("3").firstChild);
                        document.getElementById("4").removeChild(document.getElementById("4").firstChild);
                        document.getElementById("5").removeChild(document.getElementById("5").firstChild);
                        document.getElementById("6").removeChild(document.getElementById("6").firstChild);
                        document.getElementById("7").removeChild(document.getElementById("7").firstChild);
                        document.getElementById("8").removeChild(document.getElementById("8").firstChild);


                        document.getElementById("0").append(findImg(data[top][x]));
                        document.getElementById("1").append(findImg(data[top][x+1]));
                        document.getElementById("2").append(findImg(data[top][x+2]));
                        document.getElementById("3").append(findImg(data[mid][x]));
                        document.getElementById("4").append(findImg(data[mid][x+1]));
                        document.getElementById("5").append(findImg(data[mid][x+2]));
                        document.getElementById("6").append(findImg(data[bot][x]));
                        document.getElementById("7").append(findImg(data[bot][x+1]));
                        document.getElementById("8").append(findImg(data[bot][x+2]))
                    }

                    else if (x === 1) {
                        document.getElementById("1").removeChild(document.getElementById("1").firstChild);
                        document.getElementById("2").removeChild(document.getElementById("2").firstChild);
                        document.getElementById("4").removeChild(document.getElementById("4").firstChild);
                        document.getElementById("5").removeChild(document.getElementById("5").firstChild);
                        document.getElementById("7").removeChild(document.getElementById("7").firstChild);
                        document.getElementById("8").removeChild(document.getElementById("8").firstChild);

                        document.getElementById("1").append(findImg(data[top][x]));
                        document.getElementById("2").append(findImg(data[top][x+1]));
                        document.getElementById("4").append(findImg(data[mid][x]));
                        document.getElementById("5").append(findImg(data[mid][x+1]));
                        document.getElementById("7").append(findImg(data[bot][x]));
                        document.getElementById("8").append(findImg(data[bot][x+1]));
                    }

                    else {
                        document.getElementById("2").removeChild(document.getElementById("2").firstChild);
                        document.getElementById("5").removeChild(document.getElementById("5").firstChild);
                        document.getElementById("8").removeChild(document.getElementById("8").firstChild);

                        document.getElementById("2").append(findImg(data[top][x]));
                        document.getElementById("5").append(findImg(data[mid][x]));
                        document.getElementById("8").append(findImg(data[bot][x]));
                    }
                    await sleep(50);
                }
            }

            let responseArr = [
                                [document.getElementById("0").firstChild.value, document.getElementById("1").firstChild.value, document.getElementById("2").firstChild.value],
                                [document.getElementById("3").firstChild.value, document.getElementById("4").firstChild.value, document.getElementById("5").firstChild.value],
                                [document.getElementById("6").firstChild.value, document.getElementById("7").firstChild.value, document.getElementById("8").firstChild.value]
                            ];

            spin.disabled = false;

            fetch(`/pay/?bet=${bet}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    "board": responseArr, "user": username, "dbToken": token
                }),
            })
            .then(response => response.json())
            .then(async function(data){
                let iWin = document.createElement("img");
                iWin.src = "symbols/win.png";
                document.getElementById("payout").innerText = parseFloat(data.payout - bet).toFixed(2);
                if(data.payout > 0) {
                    for(var x = 0; x < 10; x++){
                        for(var i = 0; i < data.lines.length; i++){
                            let symbol = document.getElementById(data.lines[i]).firstChild;

                            document.getElementById(data.lines[i]).removeChild(document.getElementById(data.lines[i]).firstChild);
                            document.getElementById(data.lines[i]).append(iWin);

                            await sleep(100);

                            document.getElementById(data.lines[i]).removeChild(document.getElementById(data.lines[i]).firstChild);
                            document.getElementById(data.lines[i]).append(symbol);
                        }
                    }
                }
                document.getElementById("balance").innerText = parseFloat(data.dbBalance).toFixed(2);
            })
            .catch((error) => {
                console.error('Error', error);
            })
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    })
});


demo.addEventListener("click", function(){
    demo.disabled = true;

    let bet = 0;
    
    fetch('/spin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"bet": bet, "user": username, "dbToken": token})
    })
    .then(response => response.json())
    .then(async function(data){
            let size = Object.keys(data).length;
            if (document.getElementById("0").childElementCount > 0) {
                for (var x = 0; x < 9; x ++) {
                    document.getElementById(x).removeChild(document.getElementById(x).firstChild);
                }
            }
            document.getElementById("0").append(findImg(data[0][0]));
            document.getElementById("1").append(findImg(data[0][1]));
            document.getElementById("2").append(findImg(data[0][2]));
            document.getElementById("3").append(findImg(data[1][0]));
            document.getElementById("4").append(findImg(data[1][1]));
            document.getElementById("5").append(findImg(data[1][2]));
            document.getElementById("6").append(findImg(data[2][0]));
            document.getElementById("7").append(findImg(data[2][1]));
            document.getElementById("8").append(findImg(data[2][2]));
            for(var x = 0; x < 3; x++) {
                let runT = Math.floor(Math.random() * ((size*2) - size) + size);
                for (var i = 0; i < runT; i++){
                    let top = i;
                    let mid;
                    let bot;
                    if (i >= size) {
                        if (i >= (size*2)){
                            top = i - (size*2);
                        }
                        else {
                            top = i - size;
                        }
                    }

                    mid = top - 1;
                    bot = top - 2;

                    if(mid < 0){
                        mid = size + mid;
                    }

                    if(bot < 0){
                        bot = size + bot;
                    }

                    if (x === 0) {

                        document.getElementById("0").removeChild(document.getElementById("0").firstChild);
                        document.getElementById("1").removeChild(document.getElementById("1").firstChild);
                        document.getElementById("2").removeChild(document.getElementById("2").firstChild);
                        document.getElementById("3").removeChild(document.getElementById("3").firstChild);
                        document.getElementById("4").removeChild(document.getElementById("4").firstChild);
                        document.getElementById("5").removeChild(document.getElementById("5").firstChild);
                        document.getElementById("6").removeChild(document.getElementById("6").firstChild);
                        document.getElementById("7").removeChild(document.getElementById("7").firstChild);
                        document.getElementById("8").removeChild(document.getElementById("8").firstChild);


                        document.getElementById("0").append(findImg(data[top][x]));
                        document.getElementById("1").append(findImg(data[top][x+1]));
                        document.getElementById("2").append(findImg(data[top][x+2]));
                        document.getElementById("3").append(findImg(data[mid][x]));
                        document.getElementById("4").append(findImg(data[mid][x+1]));
                        document.getElementById("5").append(findImg(data[mid][x+2]));
                        document.getElementById("6").append(findImg(data[bot][x]));
                        document.getElementById("7").append(findImg(data[bot][x+1]));
                        document.getElementById("8").append(findImg(data[bot][x+2]))
                    }

                    else if (x === 1) {
                        document.getElementById("1").removeChild(document.getElementById("1").firstChild);
                        document.getElementById("2").removeChild(document.getElementById("2").firstChild);
                        document.getElementById("4").removeChild(document.getElementById("4").firstChild);
                        document.getElementById("5").removeChild(document.getElementById("5").firstChild);
                        document.getElementById("7").removeChild(document.getElementById("7").firstChild);
                        document.getElementById("8").removeChild(document.getElementById("8").firstChild);

                        document.getElementById("1").append(findImg(data[top][x]));
                        document.getElementById("2").append(findImg(data[top][x+1]));
                        document.getElementById("4").append(findImg(data[mid][x]));
                        document.getElementById("5").append(findImg(data[mid][x+1]));
                        document.getElementById("7").append(findImg(data[bot][x]));
                        document.getElementById("8").append(findImg(data[bot][x+1]));
                    }

                    else {
                        document.getElementById("2").removeChild(document.getElementById("2").firstChild);
                        document.getElementById("5").removeChild(document.getElementById("5").firstChild);
                        document.getElementById("8").removeChild(document.getElementById("8").firstChild);

                        document.getElementById("2").append(findImg(data[top][x]));
                        document.getElementById("5").append(findImg(data[mid][x]));
                        document.getElementById("8").append(findImg(data[bot][x]));
                    }
                    await sleep(50);
                }
            }

            let responseArr = [
                                [document.getElementById("0").firstChild.value, document.getElementById("1").firstChild.value, document.getElementById("2").firstChild.value],
                                [document.getElementById("3").firstChild.value, document.getElementById("4").firstChild.value, document.getElementById("5").firstChild.value],
                                [document.getElementById("6").firstChild.value, document.getElementById("7").firstChild.value, document.getElementById("8").firstChild.value]
                            ];

            demo.disabled = false;

            fetch(`/pay/?bet=${bet}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    "board": responseArr, "user": username, "dbToken": token
                }),
            })
            .then(response => response.json())
            .then(async function(data){
                let iWin = document.createElement("img");
                iWin.src = "symbols/win.png";
                document.getElementById("payout").innerText = data.payout;
                if(data.payout > 0) {
                    for(var x = 0; x < 10; x++){
                        for(var i = 0; i < data.lines.length; i++){
                            let symbol = document.getElementById(data.lines[i]).firstChild;

                            document.getElementById(data.lines[i]).removeChild(document.getElementById(data.lines[i]).firstChild);
                            document.getElementById(data.lines[i]).append(iWin);

                            await sleep(100);

                            document.getElementById(data.lines[i]).removeChild(document.getElementById(data.lines[i]).firstChild);
                            document.getElementById(data.lines[i]).append(symbol);
                        }
                    }
                }
                document.getElementById("balance").innerText = parseFloat(data.dbBalance).toFixed(2);
            })
            .catch((error) => {
                console.error('Error', error);
            })
    })
    .catch((error) => {
        console.error('Error:', error);
    })
});

function checkBal(){
    return (balElement.value <= 0);
}

function findImg(num) {
    let number = parseInt(num);
    
    let iTen = document.createElement("img");
    iTen.src = "symbols/ten.png";
    iTen.value = "1";
    iTen.id = "ten";

    let iPlum = document.createElement("img");
    iPlum.src = "symbols/plum.png";
    iPlum.value = "2";
    iPlum.id = "plum";

    let iLemon = document.createElement("img");
    iLemon.src = "symbols/lemon.png";
    iLemon.value = "3";
    iLemon.id = "lemon";

    let iDiamond = document.createElement("img");
    iDiamond.src = "symbols/diamond.png";
    iDiamond.value = "4";
    iDiamond.id = "diamond";
    
    if (number === parseInt(iTen.value)) {
        return iTen;
    }
    
    if (number === parseInt(iPlum.value)) {
        return iPlum;
    }
    
    if (number === parseInt(iLemon.value)) {
        return iLemon;
    }
    
    if (number === parseInt(iDiamond.value)) {
        return iDiamond;
    }
    
    return;
}

function createTable(rows, cols) {
    let tables = document.getElementById("game-container");
    let tabObj = document.createElement("table");
    tabObj.id = "slots";
    let count = 0;

    for(var r = 0; r < rows; r++){
        let row = document.createElement("tr");

        for(var c = 0; c < cols; c++){
            var col = document.createElement("td");
            col.style.border = "3px solid #654321";
            col.id = count;
            row.append(col);
            count++;
        }
        tabObj.append(row);   
    }
    tabObj.style.marginLeft = "auto";
    tabObj.style.marginRight = "auto";
    tabObj.style.border = "7px solid #654321";

    tables.append(tabObj);
    document.getElementById("0").append(findImg(1));
    document.getElementById("1").append(findImg(1));
    document.getElementById("2").append(findImg(1));
    document.getElementById("3").append(findImg(2));
    document.getElementById("4").append(findImg(4));
    document.getElementById("5").append(findImg(2));
    document.getElementById("6").append(findImg(3));
    document.getElementById("7").append(findImg(3));
    document.getElementById("8").append(findImg(3));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

window.onload = function() {
    createTable(3,3);
}