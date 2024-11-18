const boardContainer = document.getElementById("boardContainer");
var board = null;

const pieceBin = document.getElementById("pieceBin");

let bitColors = ["red", "orange", "yellow", "green", "blue", "purple"];

let maxPieceSize = 5;

var holdingPiece = null;

// TOP LEFT JUSTIFIED
let pieces = [
  [
    [1, 1],
    [1, 1],
  ],
  [[1], [1], [1], [1], [1]],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
];

var heldPieceData = null;

var potentialSpaces = [];
function createBoard(width, height) {
  boardContainer.innerHTML = `<table class="board" id="board"></table>`;
  board = document.getElementById("board");

  for (let y = 0; y < height; y++) {
    board.innerHTML += `<tr id="row${y}"></tr>`;
    for (let x = 0; x < width; x++) {
      let row = document.getElementById("row" + y);
      row.innerHTML += `<td class="space" id="space(${x},${y})"></td>`;
    }
  }

  let spaces = document.getElementsByClassName("space");
  for (let i = 0; i < spaces.length; i++) {
    spaces[i].addEventListener("mouseover", (e) => {
      for (let i = 0; i < spaces.length; i++) {
        spaces[i].classList.remove("hoverSpace");
      }

      if (!holdingPiece) return;

      heldPieceData = createdPieces[holdingPiece.id.replace("piece", "")];
      let heldPiecePattern = pieces[heldPieceData.pattern];

      let hoverSpace = e.target.id
        .replace("space(", "")
        .replace(")", "")
        .split(",");

      potentialSpaces = [];
      for (let y = 0; y < heldPiecePattern.length; y++) {
        for (let x = 0; x < heldPiecePattern[y].length; x++) {
          if (heldPiecePattern[y][x] === 0) continue;

          let potSpace = document.getElementById(
            `space(${
              hoverSpace[0] * 1 + x - Math.floor(heldPiecePattern[y].length / 2)
            },${
              hoverSpace[1] * 1 + y - Math.floor(heldPiecePattern.length / 2)
            })`
          );

          if (!potSpace) return;

          potSpace.classList.add("hoverSpace");

          if (potSpace.innerHTML.length > 0) return;

          potentialSpaces.push(potSpace);
        }
      }

      for (let i = 0; i < potentialSpaces.length; i++) {
        potentialSpaces[i].classList.add("hoverSpace");
      }
    });
  }

  board.addEventListener("mouseout", (e) => {
    potentialSpaces = [];
  });
}

let pieceCount = 0;
let createdPieces = [];
function createPiece(id, color) {
  pieceCount = createdPieces.length;
  pieceBin.innerHTML += `<table class="piece" id="piece${pieceCount}"></table>`;

  // Create the piece
  let piece = document.getElementById("piece" + pieceCount);
  for (let y = 0; y < maxPieceSize; y++) {
    piece.innerHTML += `<tr id="piece${pieceCount}row${y}"></tr>`;
    for (let x = 0; x < maxPieceSize; x++) {
      document.getElementById(`piece${pieceCount}row${y}`).innerHTML += `
            <td id="piece${pieceCount}space(${x},${y})"></td>
        `;
    }
  }

  let pattern = pieces[id];

  // Math used to center bits in the piece
  let offsetX = Math.floor((maxPieceSize - pattern[0].length) / 2);
  let offsetY = Math.floor(maxPieceSize - pattern.length);

  // Place the bits
  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[y].length; x++) {
      if (pattern[y][x] !== 1) continue;
      document.getElementById(
        `piece${pieceCount}space(${x + offsetX},${y + offsetY})`
      ).innerHTML = `
            <div class="minibit bit-${color}" id="piece${pieceCount}-bit(${x},${y})"></div>
        `;
    }
  }

  // Event Listeners:
  let bits = document.getElementsByClassName("minibit");
  for (let i = 0; i < bits.length; i++) {
    bits[i].addEventListener("mousedown", function (e) {
      holdingPiece = document.getElementById(e.target.id.split("-")[0]);
      holdingPiece.classList.add("holding");
      holdingPiece.style.left = e.clientX + "px";
      holdingPiece.style.top = e.clientY + "px";

      heldPieceData = createdPieces[holdingPiece.id.replace("piece", "")];
    });
  }

  createdPieces.push({
    index: pieceCount,
    pattern: id,
    color: color,
    element: piece,
  });
}

document.addEventListener("mousemove", (e) => {
  if (!holdingPiece) return;

  holdingPiece.style.left = e.clientX + "px";
  holdingPiece.style.top = e.clientY + "px";
});

document.addEventListener("mouseup", (e) => {
  if (!holdingPiece) return;

  holdingPiece.classList.remove("holding");

  if (potentialSpaces.length > 0) {
    for (let i = 0; i < potentialSpaces.length; i++) {
      let position = potentialSpaces[i].id
        .replace("space(", "")
        .replace(")", "")
        .split(",");
      placeBit(position[0], position[1], heldPieceData.color);

      holdingPiece.remove();
    }
  }

  holdingPiece = null;
  heldPieceData = null;

  if (pieceBin.childNodes.length <= 0) {
    createdPieces = [];

    newPieceSet();
  }
});

function placeBit(x, y, color) {
  document.getElementById(`space(${x},${y})`).innerHTML = `
        <div class="bit bit-${color}"></div>
    `;
}

function placePiece(posX, posY, id, color) {
  let piece = pieces[id];
  for (let y = 0; y < piece.length; y++) {
    for (let x = 0; x < piece[y].length; x++) {
      if (piece[y][x] === 1) placeBit(posX + x, posY + y, color);
    }
  }
}

function newPieceSet() {
  for (let i = 0; i < 3; i++)
    createPiece(
      Math.floor(Math.random() * pieces.length),
      bitColors[Math.floor(Math.random() * bitColors.length)]
    );
}

createBoard(8, 8);

newPieceSet();
