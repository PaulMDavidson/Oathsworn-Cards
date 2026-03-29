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

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  strokeWeight(0.15);
  stroke(96, 64, 128);
  document.body.style.margin = 0;
  document.body.style.padding = 0;
  document.body.style.overflow = 'hidden';
  resetDeck(whiteCards);
  resetDeck(yellowCards);
  resetDeck(redCards);
  resetDeck(blackCards);
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
    text(discards.filter((discard) => discard[0] == colour).length, drawStacksXsep * 6 + drawStacksX, drawStacksY + colour * drawStacksYsep, 10, 8);
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
    text(drawTotal, drawStacksXsep * 6 + drawStacksX, drawnStackY - 2, 10, 8);
    if (miss_count >= 2) text('(FAIL)', drawStacksXsep * 6 + drawStacksX, drawnStackY + 4, 10, 8);
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
      text('click to remove', x, y, 10, 8);
      textSize(5);
    });
  }

  if (mouseIsPressed && handleMousePress) {
    if ((millis() - mousePressTime) > longPressTime) {
      longClick();
      handleMousePress = false;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function pickCard(colour) {
  console.log(' pick ' + colour + ' of ' + cards[colour].length);
  cardsPicked.push(colour);
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

function revealCards() {
  cardsPicked.forEach((colour, index) => {
    drawCard(colour, cardsDrawn.length);
  });
  cardsPicked.length = 0;
  cardsRevealed = true;
}

function longClick() {
  var clickX = mouseX / windowWidth * 100;
  var clickY = mouseY / windowHeight * 100;
  if (clickY > drawnStackY) {
    if (cardsRevealed) {
      if (clickX < drawStacksX + drawStacksXsep * 6) {
        drawnCard = floor((clickX - drawStacksX) / drawStacksXsep) + (floor((clickY - drawnStackY) / drawnStackYsep) * 6);
        if ((drawnCard >= 0) && (drawnCard < cardsDrawn.length)) {
          // TODO redraw a card
          console.log('redraw card ' + drawnCard);
          colour = cardsDrawn[drawnCard][0];
        }
      } else {
        // Discard all drawn cards
        cardsDrawn.forEach((critStack) => {
          console.log('discards ' + critStack)
          discards.push(...critStack);
        });
        cardsDrawn.length = 0;
        cardsRevealed = false;
      }
    } else {
      // Reveal picked cards
      revealCards();
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
  if ((colourDrawn >= 0) && (colourDrawn <= 3) && (!cardsRevealed)) {
    pickCard(colourDrawn);
  } else if (colourDrawn > 3) {
    if (clickX < drawStacksX + drawStacksXsep * 6) {
      drawnCard = floor((clickX - drawStacksX) / drawStacksXsep) + (floor((clickY - drawnStackY) / drawnStackYsep) * 6);
      if (cardsRevealed) {
        if ((drawnCard >= 0) && (drawnCard < cardsDrawn.length)) {
          // Check that last card drawn in this stack was a crit
          if (cardsDrawn[drawnCard].at(-1)[1].substr(-1) == "+") {
            console.log('draw crit');
            drawCard(cardsDrawn[drawnCard][0][0], drawnCard);
          }
        }
      } else {
        if ((drawnCard >= 0) && (drawnCard < cardsPicked.length)) {
          cardsPicked.splice(drawnCard, 1);
        }
      }
    }
  }
}