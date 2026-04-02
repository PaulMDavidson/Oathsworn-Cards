var ws = {};

const drawStacksY = 4;
const drawStacksX = 4;
const drawStacksYsep = 16;
const drawStacksXsep = 12;
const drawnStackY = 68;
const drawnStackYsep = 12;

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
var redraws = 0;

const cardFill = ['white', 'yellow', 'red', 'black'];
const textFill = ['black', 'black', 'black', 'white'];

var peer;
var conn;
var clientId;

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

var b1 = null;
var b2 = null;
var b3 = null;
var b4 = null;
var revealButton = null;
var discardButton = null;

function placeButtons() {
  b1.position(xscaled(6 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 0 * drawStacksYsep));
  b1.size(xscaled(drawStacksXsep * 0.8), yscaled(drawStacksYsep * 0.7));
  b2.position(xscaled(6 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 1 * drawStacksYsep));
  b2.size(xscaled(drawStacksXsep * 0.8), yscaled(drawStacksYsep * 0.7));
  b3.position(xscaled(6 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 2 * drawStacksYsep));
  b3.size(xscaled(drawStacksXsep * 0.8), yscaled(drawStacksYsep * 0.7));
  b4.position(xscaled(6 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 3 * drawStacksYsep));
  b4.size(xscaled(drawStacksXsep * 0.8), yscaled(drawStacksYsep * 0.7));
  revealButton.position(xscaled(6 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 4 * drawStacksYsep));
  revealButton.size(xscaled(drawStacksXsep * 0.8), yscaled(drawStacksYsep * 0.7));
  discardButton.position(xscaled(7 * drawStacksXsep + drawStacksX), yscaled(drawStacksY + 4 * drawStacksYsep));
  discardButton.size(xscaled(drawStacksXsep * 0.8), yscaled(drawStacksYsep * 0.7));
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
  revealButton.style('background-color: white');
  revealButton.mouseClicked(revealCards);
  revealButton.attribute('disabled', 'true');
  discardButton = createButton('Discard');
  discardButton.style('background-color: white');
  discardButton.mouseClicked(discardCards);
  discardButton.attribute('disabled', 'true');
  placeButtons();
}

function setup() {
  // Graphics
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);

  angleMode(DEGREES);
  strokeWeight(0.15);
  stroke(96, 64, 128);
  document.body.style.margin = 0;
  document.body.style.padding = 0;
  document.body.style.overflow = 'hidden';

  // GUI elements
  setupButtons();

  // Card decks
  resetDeck(whiteCards);
  resetDeck(yellowCards);
  resetDeck(redCards);
  resetDeck(blackCards);

  // Networking

  // EITHER: Hardcoded IP connection
  ws = new WebSocket('ws://192.168.1.3:8081');
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
  // OR: Indirect IP from github file (note these are cached for 300s)
  /*
  axios.get('https://raw.githubusercontent.com/PaulMDavidson/server-id/refs/heads/main/id')
    .then(function (response) {
      // handle success
      console.log(response);
      ws = new WebSocket('ws://' + response.data + ':8081');
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

  for (let colour = 0; colour < 4; colour++) {
    let slots_taken = [0, 0, 0, 0, 0, 0];
    cards[colour].forEach((card, index) => {
      let slot = floor(cardnum[colour][index] / 3);
      let x = slot * drawStacksXsep + drawStacksX;
      let y = drawStacksY + colour * drawStacksYsep + slots_taken[slot] * 2;
      ++slots_taken[slot];
      fill(cardFill[colour]);
      rect(x, y, 10, 8, 1, 1, 1, 1);
      fill(textFill[colour]);
      text(cards[colour][index], x, y, 10, 8);
      if (slots_taken[slot] > 1) {
        textSize(1);
        text(cards[colour][index], x + 4, y - 5, 10, 8);
        textSize(5);
      }
    });
    fill('black');
    // Count how many cards of this colour in discard
    text(discards.filter((discard) => discard[0] == colour).length, drawStacksXsep * 7 + drawStacksX, drawStacksY + colour * drawStacksYsep, 10, 8);
  }

  line(2, drawnStackY - 2, 98, drawnStackY - 2);

  if (cardsRevealed) {
    let drawTotal = 0;
    let miss_count = 0;
    cardsDrawn.forEach((cardlist, index) => {
      cardlist.forEach((card, crit_index) => {
        colour = card[0];
        fill(cardFill[colour]);
        x = drawStacksXsep * (index % 6) + drawStacksX;
        y = drawnStackY + floor(index / 6) * drawnStackYsep + crit_index * 2;
        rect(x, y, 10, 8, 1, 1, 1, 1);
        if (cardsRevealed) {
          if (crit_index < cardlist.length - 1) {
            textSize(1);
            fill(textFill[colour]);
            text(card[1], x + 4, y - 3, 10, 8);
            textSize(5);
          } else {
            fill(textFill[colour]);
            text(card[1], x, y, 10, 8);
          }
          drawTotal += parseInt("0" + card[1]);
          if ((crit_index == 0) && (card[1] == "")) ++miss_count;
        }
      });
    });
    fill('black');
    text(drawTotal, drawStacksXsep * 6 + drawStacksX, drawnStackY + drawnStackYsep, 10, 8);
    if (miss_count >= 2) text('Miss', drawStacksXsep * 7 + drawStacksX, drawnStackY + drawnStackYsep, 10, 8);
    if (redraws > 0) text('Redraws '+redraws, 0, drawnStackY + 2 * drawnStackYsep, 100, 8);

  } else {
    cardsPicked.forEach((colour, index) => {
      c = color(cardFill[colour]);
      c.setAlpha(64);
      fill(c);
      x = drawStacksXsep * (index % 6) + drawStacksX;
      y = drawnStackY + floor(index / 6) * drawnStackYsep;
      rect(x, y, 10, 8, 1, 1, 1, 1);
      textSize(2);
      fill(textFill[colour]);
      text('Remove', x, y, 10, 8);
      textSize(5);
    });
  }

  if (mouseIsPressed && handleMousePress) {
    if ((millis() - mousePressTime) > longPressTime) {
      longClick();
      handleMousePress = false;
    }
  }

  clientId = -1;
}

// GUI user interactions
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

function longClick() {
  var clickX = mouseX / windowWidth * 100;
  var clickY = mouseY / windowHeight * 100;
  if (clickY > drawnStackY) {
    if (cardsRevealed) {
      if (clickX < drawStacksX + drawStacksXsep * 6) {
        drawnCard = floor((clickX - drawStacksX) / drawStacksXsep) + (floor((clickY - drawnStackY) / drawnStackYsep) * 6);
        if ((drawnCard >= 0) && (drawnCard < cardsDrawn.length)) {
          redrawCard(drawnCard);
        }
      }
    }
  } else if (clickX > drawStacksX + drawStacksXsep * 6) {
    // (move to button action) Reset Deck - Shuffle discards back
    let colour = floor((clickY - drawStacksY) / drawStacksYsep);
    console.log('shuffle ' + colour);
    shuffleIn(colour);
  }
}

function drawCardClick() {
  var clickX = mouseX / windowWidth * 100;
  var clickY = mouseY / windowHeight * 100;
  let clickedRow = floor((clickY - drawStacksY) / drawStacksYsep);
  let clickedCard = floor((clickX - drawStacksX) / drawStacksXsep) + (floor((clickY - drawnStackY) / drawnStackYsep) * 6);
  if ((clickedRow > 3) && (clickX < drawStacksX + drawStacksXsep * 6)) {
    if (cardsRevealed) {
      drawCrit(clickedCard);
    } else {
      unpickCard(clickedCard);
    }
  }
}

// Card deck utilities

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

// User Actions

function redrawCard(card) {
  if ((card >= 0) && (card < cardsDrawn.length)) {
    console.log('redraw');
    if (cardsDrawn[card].length == 1) {
      discards.push(cardsDrawn[card][0]);
      colour = cardsDrawn[card][0][0];
      cardsDrawn[card] = [];
      drawCard(colour, card);
      redraws++;
      sendMessage('cardRedrawn '+card+' c'+cardsDrawn[card][0][1]);
    }
  }
}

function drawCrit(card) {
  if ((card >= 0) && (card < cardsDrawn.length)) {
    // Check that last card drawn in this stack was a crit
    if (cardsDrawn[card].at(-1)[1].substr(-1) == "+") {
      console.log('draw crit');
      drawCard(cardsDrawn[card][0][0], card);
      sendMessage('critDrawn '+card+' c'+cardsDrawn[card].at(-1)[1]);
    }
  }
}

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

function revealCards() {
  let revealed = '';
  cardsPicked.forEach((colour, index) => {
    drawCard(colour, cardsDrawn.length);
    revealed += ',' + cardsDrawn.at(-1)[0][1];
  });
  cardsPicked.length = 0;
  cardsRevealed = true;
  b1.attribute('disabled', 'true');
  b2.attribute('disabled', 'true');
  b3.attribute('disabled', 'true');
  b4.attribute('disabled', 'true');
  revealButton.attribute('disabled', 'true');
  discardButton.removeAttribute('disabled');
  sendMessage('cardsRevealed ' + revealed.substring(1));
}

function discardCards() {
  // Discard all drawn cards
  cardsDrawn.forEach((critStack) => {
    console.log('discards ' + critStack)
    discards.push(...critStack);
  });
  cardsDrawn.length = 0;
  cardsRevealed = false;
  redraws = 0;
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
  ws.send(clientId + ' ' + msg);
}

function handleMessage(msg) {
  console.log(msg);
  msg_cmd = msg.split(" ");
  clientId = msg_cmd[0];
  switch (msg_cmd[1]) {
    case 'pickCard':
      // parameter is card colour (0-3)
      pickCard(msg_cmd[2]);
      break;
    case 'unpickCard':
      // parameter is sequence number of picked card
      unpickCard(msg_cmd[2]);
      break;
    case 'revealCards':
      clientId = -1; //replies should go to all clients, even the one that asked for the reveal
      revealCards();
      break;
    case 'drawCrit':
      clientId = -1; //replies should go to all clients, even the one that asked for the reveal
      drawCrit(msg_cmd[2]);
      break;
    case 'redrawCard':
      clientId = -1; //replies should go to all clients, even the one that asked for the reveal
      redrawCard(msg_cmd[2]);
      break;
    case 'discardCards':
      discardCards();
      break;
  }

}