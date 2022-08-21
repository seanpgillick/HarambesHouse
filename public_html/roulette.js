let red = document.getElementById("red-button");
let black = document.getElementById("black-button");
let betNum = document.getElementById("bet-number")
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
        balElement.innerText = "$" + parseFloat(data.balance).toFixed(2);
    });
}

//CODE for Roulette.js adapted from https://codepen.io/barney-parker/pen/OPyYqy, user Barney Parker
//See more here https://codepen.io/barney-parker
//Logic for spinning wheel taken from open source, edited and adpapted for Roulette Purposes

var options = ["0", "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27", "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1", "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"];

var startAngle = 0;
var arc = Math.PI / (options.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

var ctx;

document.getElementById("spin-button").addEventListener("click", spin);

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function RGB2Color(r,g,b) {
	return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = Math.PI*2/maxitem;
  
  red   = Math.sin(frequency*item+2+phase) * width + center;
  green = Math.sin(frequency*item+0+phase) * width + center;
  blue  = Math.sin(frequency*item+4+phase) * width + center;
  
  return RGB2Color(red,green,blue);
}

function drawRouletteWheel() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 200;
    var textRadius = 160;
    var insideRadius = 125;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,500,500);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.font = 'bold 12px Helvetica, Arial';

    for(var i = 0; i < options.length; i++) {
      var angle = startAngle + i * arc;
      //ctx.fillStyle = colors[i];
      if(options[i]==0) {
          ctx.fillStyle = 'green';
      }
      else if (i%2==0)
      {
          ctx.fillStyle = '#972a27';
      }
      else
      { 
        ctx.fillStyle = 'black';
      }
      ctx.beginPath();
      ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
      ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur    = 0;
      ctx.shadowColor   = "rgb(220,220,220)";
      ctx.fillStyle = "white";
      ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 
                    250 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = options[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    } 

    //Arrow
    ctx.fillStyle = "#ADD8E6";
    ctx.beginPath();
    ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
    ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.fill();
  }
}

let betColor = "none";
let betNumber = document.getElementById("bet-number").value;
let bet;

function spin() {
    bet = document.getElementById("bet").value;
    console.log(bet);
    fetch(`/rouletteSpin/?bet=${bet}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({
            "user": username, "dbToken": token
        }),
    })
    .then(response => response.json())
    .then(async function(data){
        document.getElementById("payout").innerText = parseFloat(data.payout - bet).toFixed(2);
        document.getElementById("balance").innerText = "$"+parseFloat(data.dbBalance).toFixed(2);
    })
    .catch((error) => {
        console.error('Error', error);
    })
    document.getElementById("spin-button").disabled = true;
    red.disabled = true;
    black.disabled = true;
    betNumber = document.getElementById("bet-number").value;
    betNum.disabled = true;
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 1000;
  rotateWheel();
}

function rotateWheel() {
  spinTime += 30;
  if(spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = options[index]

  console.log("Color:" + betColor);
  console.log("Number:" + betNumber);
  if ((index % 2 == 0 && betColor == "red") || (index % 2 != 0 && betColor == "black")) {
    fetch(`/colorWin/?bet=${bet}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({
            "user": username, "dbToken": token
        }),
    })
    .then(response => response.json())
    .then(async function(data){
        document.getElementById("payout").innerText = parseFloat(data.payout - bet).toFixed(2);
        document.getElementById("balance").innerText = "$"+parseFloat(data.dbBalance).toFixed(2);
        console.log("Some win");
    })
    .catch((error) => {
        console.error('Error', error);
    })
  }
  else if (betNumber == parseInt(options[index])) {
    fetch(`/numberWin/?bet=${bet}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({
            "user": username, "dbToken": token
        }),
    })
    .then(response => response.json())
    .then(async function(data){
        document.getElementById("payout").innerText = parseFloat(data.payout - bet).toFixed(2);
        document.getElementById("balance").innerText = "$"+parseFloat(data.dbBalance).toFixed(2);
    })
    .catch((error) => {
        console.error('Error', error);
    })
  }

  ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  ctx.restore();
  document.getElementById("spin-button").disabled = false;
  red.disabled = false;
  black.disabled = false;
  betNum.disabled = false;
  betColor = "";
}

function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}

drawRouletteWheel();

red.addEventListener("click", function() {
    betColor = "red";
    red.disabled = true;
    black.disabled = false;
});

black.addEventListener("click", function() {
    betColor = "black";
    black.disabled = true;
    red.disabled = false;
});