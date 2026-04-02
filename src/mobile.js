const drawStacksY = 4;
const drawStacksX = 4;
const drawStacksYsep = 20;
const drawStacksXsep = 24;
const drawnStackY = 45;
const drawnStackYsep = 18;

const cards = new Array(4);
const cardnum = new Array(4);
const discards = new Array(4);
const whiteCards = 0;
const yellowCards = 1;
const redCards = 2;
const blackCards = 3;
const cardsDrawn = [];
const cardsPicked = []; // Colours selected for draw
let handleMousePress = false;
const longPressTime = 750;
let cardsRevealed = false;
var clientId = -2;
var cmd_from;

var ws = {};

const cardFill = ['white', 'yellow', 'red', 'black'];
const textFill = ['black', 'black', 'black', 'white'];

function resetDeck(colour) {
  switch (colour) {
    case whiteCards:
      cards[colour] = ["", "", "", "", "", "", "1", "1", "1", "1", "1", "1", "2", "2", "2", "2+", "2+", "2+"];
      break;
    case yellowCards:
      cards[colour] = ["", "", "", "", "", "", "1", "1", "1", "2", "2", "2", "3", "3", "3", "3+", "3+", "3+"];
      break;
    case redCards:
      cards[colour] = ["", "", "", "", "", "", "2", "2", "2", "3", "3", "3", "3", "3", "3", "4+", "4+", "4+"];
      break;
    case blackCards:
      cards[colour] = ["", "", "", "", "", "", "3", "3", "3", "3", "3", "3", "4", "4", "4", "5+", "5+", "5+"];
      break;
  }
  cardnum[colour] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  discards[colour] = [];
}

function xscaled(x) { return x * windowWidth / 100; }
function yscaled(y) { return y * windowHeight / 100; }

var b1, b2, b3, b4;
var revealButton, discardButton;

function placeButtons() {
  b1.position(xscaled(0 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 0 * drawStacksYsep));
  b1.size(xscaled(drawStacksXsep * 0.8), yscaled(drawStacksYsep * 0.7));
  b2.position(xscaled(1 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 0 * drawStacksYsep));
  b2.size(xscaled(drawStacksXsep * 0.8), yscaled(drawStacksYsep * 0.7));
  b3.position(xscaled(2 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 0 * drawStacksYsep));
  b3.size(xscaled(drawStacksXsep * 0.8), yscaled(drawStacksYsep * 0.7));
  b4.position(xscaled(3 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 0 * drawStacksYsep));
  b4.size(xscaled(drawStacksXsep * 0.8), yscaled(drawStacksYsep * 0.7));
  revealButton.position(xscaled(0 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 1 * drawStacksYsep));
  revealButton.size(xscaled(drawStacksXsep * 1.8), yscaled(drawStacksYsep * 0.7));
  discardButton.position(xscaled(2 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 1 * drawStacksYsep));
  discardButton.size(xscaled(drawStacksXsep * 1.8), yscaled(drawStacksYsep * 0.7));
}

function setupButtons() {
  b1 = createButton('Draw');
  b1.style('background-color: white');
  b1.mouseClicked(pickWhiteCard);
  b2 = createButton('Draw');
  b2.style('background-color: yellow');
  b2.mouseClicked(pickYellowCard);
  b3 = createButton('Draw');
  b3.style('background-color: red');
  b3.mouseClicked(pickRedCard);
  b4 = createButton('Draw');
  b4.style('background-color: black');
  b4.style('color: white');
  b4.mouseClicked(pickBlackCard);
  revealButton = createButton('Reveal');
  revealButton.style('background-color: #4f4;');
  revealButton.mouseClicked(revealCards);
  revealButton.attribute('disabled', 'true');
  discardButton = createButton('Discard');
  discardButton.style('background-color: #4f4');
  discardButton.mouseClicked(discardCards);
  discardButton.attribute('disabled', 'true');
  placeButtons();
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);

  angleMode(DEGREES);
  strokeWeight(0.15);
  stroke(96, 64, 128);
  document.body.style.margin = 0;
  document.body.style.padding = 0;
  document.body.style.overflow = 'hidden';

  setupButtons();

  resetDeck(whiteCards);
  resetDeck(yellowCards);
  resetDeck(redCards);
  resetDeck(blackCards);

  // EITHER: Hardcoded IP connection
  ws = new WebSocket('ws://192.168.1.11:8080');
  ws.onopen = () => {
    console.log(`Connected`);
    ws.send('Hello Server!');
  };
  ws.onmessage = (event) => {
    console.log(`Received: ${event.data}`);
    handleMessage(event.data);
  };
  ws.onclose = () => {
    console.log(`Disconnected`);
  };
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  // OR: IP from github file (note these are cached for 300s)
  /*
  axios.get('https://raw.githubusercontent.com/PaulMDavidson/server-id/refs/heads/main/id')
    .then(function (response) {
      // handle success
      console.log(response);
      ws = new WebSocket('ws://'+response.data+':8080'); // Use 'wss://' for secure connections
      ws.onopen = () => {
        console.log(`Connected`);
        ws.send('Hello Server!');
      };
      ws.onmessage = (event) => {
        console.log(`Received: ${event.data}`);
        handleMessage(event.data);
      };
      ws.onclose = () => {
        console.log(`Disconnected`);
      };
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // always executed
    });
  */

}

function draw() {
  textAlign(CENTER, CENTER);
  textSize(5);
  scale(windowWidth / 100.0, windowHeight / 100.0);
  background(220);

  line(2, drawnStackY - 5, 98, drawnStackY - 5);
  if (cardsRevealed) {
    textSize(2);
    text('Tap card to pull crits -- Press & hold card to redraw', 0, drawnStackY - 4, 98, 4);
    textSize(5);
  }

  if (cardsRevealed) {
    let drawTotal = 0;
    let miss_count = 0;
    cardsDrawn.forEach((cardlist, index) => {
      cardlist.forEach((card, crit_index) => {
        colour = card[0];
        fill(cardFill[colour]);
        x = drawStacksXsep * (index % 4) + drawStacksX;
        y = drawnStackY + floor(index / 4) * drawnStackYsep + crit_index * 2;
        rect(x, y, 19, 15, 2);
        if (crit_index < cardlist.length - 1) {
          textSize(1);
          fill(textFill[colour]);
          text(card[1], x + 4, y - 3, 19, 15);
          textSize(5);
        } else {
          fill(textFill[colour]);
          text(card[1], x, y, 19, 15);
        }
        drawTotal += parseInt("0" + card[1]);
        if ((crit_index == 0) && (card[1] == "")) ++miss_count;
      });
    });
    fill('black');
    text(drawTotal, drawStacksXsep * 4 + drawStacksX, drawnStackY + drawnStackYsep, 10, 8);
    if (miss_count >= 2) text('Miss', drawStacksXsep * 7 + drawStacksX, drawnStackY + drawnStackYsep, 10, 8);
  } else {
    cardsPicked.forEach((colour, index) => {
      c = color(cardFill[colour]);
      c.setAlpha(64);
      fill(c);
      x = drawStacksXsep * (index % 4) + drawStacksX;
      y = drawnStackY + floor(index / 4) * drawnStackYsep;
      rect(x, y, 19, 15, 2);
      textSize(2);
      fill(textFill[colour]);
      text('Remove', x, y, 19, 15);
      textSize(5);
    });
  }

  if (mouseIsPressed && handleMousePress) {
    if ((millis() - mousePressTime) > longPressTime) {
      longClick();
      handleMousePress = false;
    }
  }

  cmd_from = clientId;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  placeButtons();
}

var mousePressTime;

function mousePressed() {
  mousePressTime = millis();
  handleMousePress = true;
}

function mouseClicked() {
  console.log(millis() - mousePressTime);
  if ((millis() - mousePressTime) < (longPressTime - 50)) {
    drawCardClick();
  }
}

function shuffleIn(colour) {
  let j = 0;
  discards.forEach((discard, i) => {
    if (discard[0] == colour) {
      cards[colour].push(discard[1]);
      cardnum[colour].push(discard[2]);
    } else {
      if (i !== j) discards[j] = discard;
      j++;
    }
  });
  discards.length = j;
}

function longClick() {
  var clickX = mouseX / windowWidth * 100;
  var clickY = mouseY / windowHeight * 100;
  if (clickY > drawnStackY) {
    if (cardsRevealed) {
      if (clickX < drawStacksX + drawStacksXsep * 6) {
        drawnCard = floor((clickX - drawStacksX) / drawStacksXsep) + (floor((clickY - drawnStackY) / drawnStackYsep) * 6);
        if ((drawnCard >= 0) && (drawnCard < cardsDrawn.length)) {
          sendMessage('redrawCard '+drawnCard);
        }
      } else {
      }
    } else {
      // Reveal picked cards
      //revealCards();
    }
  } else if (clickX > drawStacksX + drawStacksXsep * 6) {
    // Shuffle discards back
    let colour = floor((clickY - drawStacksY) / drawStacksYsep);
    console.log('shuffle ' + colour);
    shuffleIn(colour);
  }
}

function drawCardClick() {
  var clickX = mouseX / windowWidth * 100;
  var clickY = mouseY / windowHeight * 100;
  let colourDrawn = floor((clickY - drawStacksY) / drawStacksYsep);
  console.log('clickX ' + clickX + ' colourDrawn ' + colourDrawn);
  if (colourDrawn > 1) {
    if (clickX < drawStacksX + drawStacksXsep * 6) {
      drawnCard = floor((clickX - drawStacksX) / drawStacksXsep) + (floor((clickY - drawnStackY) / drawnStackYsep) * 6);
      if (cardsRevealed) {
        sendMessage('drawCrit '+drawnCard);
        /*
        if ((drawnCard >= 0) && (drawnCard < cardsDrawn.length)) {
          // Check that last card drawn in this stack was a crit
          if (cardsDrawn[drawnCard].at(-1)[1].substr(-1) == "+") {
            console.log('draw crit');
            drawCard(cardsDrawn[drawnCard][0][0], drawnCard);
          }
        }
        */
      } else {
        console.log('unpick ' + drawnCard)
        unpickCard(drawnCard);
      }
    }
  }
}

//User Actions

function pickWhiteCard() {
  pickCard(0);
}
function pickYellowCard() {
  pickCard(1);
}
function pickRedCard() {
  pickCard(2);
}
function pickBlackCard() {
  pickCard(3);
}

function pickCard(colour) {
  console.log(' pick ' + colour + ' of ' + cards[colour].length);
  cardsPicked.push(colour);
  sendMessage('pickCard ' + colour);
  revealButton.removeAttribute('disabled');
}

function unpickCard(card) {
  if ((card >= 0) && (card < cardsPicked.length)) {
    cardsPicked.splice(card, 1);
    sendMessage('unpickCard ' + card);
    if (cardsPicked.length == 0) revealButton.attribute('disabled', 'true');
  }
}

/*
function drawCard(colour, baseCard) {
  console.log(' draw ' + colour + ' ' + baseCard);
  console.log(' draw ' + colour + ' ' + baseCard + ' ' + cards[colour].length);
  if (cards[colour].length == 0) {
    // reshuffle discard
    shuffleIn(colour);
  }
  if (cards[colour].length > 0) {
    let cardIndex = floor(random(cards[colour].length));
    cardsDrawn[baseCard] = cardsDrawn[baseCard] || [];
    cardsDrawn[baseCard].push([colour, cards[colour][cardIndex], cardnum[colour][cardIndex]]);
    cards[colour].splice(cardIndex, 1);
    cardnum[colour].splice(cardIndex, 1);
  }
}
*/

function revealCards() {
  sendMessage('revealCards');
}

function cardRedrawn(card, newCard) {
    console.log('redraw '+card+' '+newCard);
    colour = cardsDrawn[card][0][0];
    cardsDrawn[card] = [];
    console.log(cardsDrawn);
    cardsDrawn[card].push([colour, newCard, 0]);
}

function critDrawn(baseCard, critDraw) {
    cardsDrawn[baseCard].push([cardsDrawn[baseCard][0][0], critDraw, 0]);
}

function setRevealedCards(cards) {
  revealed = cards.split(',');
  cardsPicked.forEach((colour, index) => {
    cardsDrawn[index] = [];
    cardsDrawn[index].push([cardsPicked[index], revealed[index], 0]);
    console.log(cardsPicked[index]);
  });
  cardsPicked.length = 0;
  cardsRevealed = true;
  b1.attribute('disabled', 'true');
  b2.attribute('disabled', 'true');
  b3.attribute('disabled', 'true');
  b4.attribute('disabled', 'true');
  revealButton.attribute('disabled', 'true');
  discardButton.removeAttribute('disabled');
}

function discardCards() {
  // Discard all drawn cards
  cardsDrawn.forEach((critStack) => {
    console.log('discards ' + critStack)
    discards.push(...critStack);
  });
  cardsDrawn.length = 0;
  cardsRevealed = false;
  b1.removeAttribute('disabled');
  b2.removeAttribute('disabled');
  b3.removeAttribute('disabled');
  b4.removeAttribute('disabled');
  revealButton.attribute('disabled', 'true');
  discardButton.attribute('disabled', 'true');
  sendMessage('discardCards');
}

// Network message handling

function sendMessage(msg) {
  if (cmd_from == clientId) ws.send(clientId + ' ' + msg);
}

function handleMessage(msg) {
  console.log(msg);
  msg_cmd = msg.split(" ");
  cmd_from = msg_cmd[0];
  if (cmd_from != clientId) {
    switch (msg_cmd[1]) {
      case 'hello':
        clientId = msg_cmd[2];
        console.log('i am client ' + clientId);
        break;
      case 'pickCard':
        pickCard(msg_cmd[2]);
        break;
      case 'unpickCard':
        unpickCard(msg_cmd[2]);
        break;
      case 'revealCards':
        revealCards();
        break;
      case 'cardsRevealed':
        // This is a server only message, containing values of revealed cards
        setRevealedCards(msg_cmd[2]);
        break;
      case 'cardRedrawn':
        cardRedrawn(msg_cmd[2], msg_cmd[3].substring(1));
        break;
      case 'critDrawn':
        critDrawn(msg_cmd[2], msg_cmd[3].substring(1));
        break;
      case 'discardCards':
        discardCards();
        break;
    }
  } else {
    console.log('ignored recursive cmd');
  }
}