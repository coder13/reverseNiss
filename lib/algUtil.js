const _ = require('lodash');
const {cloneMove, expand, fromString, makeAlgTraversal, simplify, toMoves} = require('alg').cube;

const rotations = {
  y: {
    fixed: ["y", "U", "D", "E", "Uw", "u", "Dw", "d"],
    sliceMap: {
      "U": "D", "Uw": "Dw", "u": "u",                     "y": "y",
      "F": "L", "Fw": "Lw", "f": "l", "S": "M", "s": "m", "z": "x",
      "R": "F", "Rw": "Fw", "r": "f",                     "x": "z'",
      "B": "R", "Bw": "Rw", "b": "r",
      "L": "B", "Lw": "Bw", "l": "b", "M": "S'",
      "D": "D", "Dw": "Dw", "d": "d", "E": "E", "e": "e"
    }
  },
  x: {
    fixed: ["x", "R", "L", "M", "Rw", "r", "Lw", "l"],
    sliceMap: {
      "U": "B", "Uw": "Bw", "u": "b",                      "y": "z'",
      "F": "U", "Fw": "Uw", "f": "u", "S": "E'", "s": "e", "z": "y",
      "R": "R", "Rw": "Rw", "r": "r",                      "x": "x",
      "B": "D", "Bw": "Dw", "b": "d",
      "L": "L", "Lw": "Lw", "l": "l", "M": "M",
      "D": "F", "Dw": "Fw", "d": "f", "E": "S", "e": "s"
    }
  },
  z: {
    fixed: ["z", "F", "B", "S", "Fw", "f", "Bw", "b"],
    sliceMap: {
      "U": "R", "Uw": "Rw", "u": "r",                     "y": "x",
      "F": "F", "Fw": "Fw", "f": "f", "S": "S", "s": "s", "z": "z",
      "R": "D", "Rw": "Dw", "r": "d",                     "x": "y'",
      "B": "B", "Bw": "Bw", "b": "b",
      "L": "U", "Lw": "Uw", "l": "u", "M": "E'",
      "D": "L", "Dw": "Lw", "d": "l", "E": "M", "e": "s"
    }
  }
};

const rotateAlg = module.exports.rotateAlg = makeAlgTraversal();
rotateAlg.move = function (move, data) {
  let rotatedMove = cloneMove(move);
  let rotation = rotations[data.rotation];
  if (!rotation) {
    return [];
  }

  let amount = data.amount ? (data.amount < 0 ? 4 + (data.amount % 4) : data.amount % 4) : 1;


  let i = 0;
  while (i < amount) {
    if (rotation.fixed.indexOf(rotatedMove.base) === -1) {
      let newBase = rotation.sliceMap[rotatedMove.base];
      // Not all moves map simply when you rotate. Some moves get inverted
      if (newBase.indexOf("'") !== -1) {
        rotatedMove.base = newBase.substring(0, newBase.indexOf("'"))
        rotatedMove.amount *= -1;
      } else {
        rotatedMove.base = newBase;
      }
    }

    i++;
  }

  return rotatedMove;
}

const getBase = module.exports.getBase = makeAlgTraversal();
getBase.sequence = function (moves, data) {
  let state = {
    rotations: []
  };

  moves = expand(moves);
  moves = _(moves).map(move => this[move.type](move, state, data), this).flatten().reject(_.isEmpty).value();

  return simplify(moves);
}

getBase.transformations = {
  "Rw": ["L", {rotation: 'x', amount: -1}], "r": ["L", {rotation: 'x', amount: -1}],
  "Lw": ["R", {rotation: 'x', amount:  1}], "l": ["R", {rotation: 'x', amount:  1}],
  "Fw": ["B", {rotation: 'z', amount: -1}], "f": ["B", {rotation: 'z', amount: -1}],
  "Bw": ["F", {rotation: 'z', amount:  1}], "b": ["F", {rotation: 'z', amount:  1}],
  "Uw": ["D", {rotation: 'y', amount: -1}], "u": ["D", {rotation: 'y', amount: -1}],
  "Dw": ["U", {rotation: 'y', amount:  1}], "d": ["U", {rotation: 'y', amount:  1}],
  "M": ["R L'", {rotation: 'x', amount:  1}],
}

getBase.move = function (move, state, data) {
  state.rotations.forEach((rotation) => {
    move = rotateAlg.move(move, rotations[move.base] ? {
      rotation: rotation.rotation,
      amount: -rotation.amount // ?
    } : rotation);
  });

  if (this.transformations[move.base]) {
    let trans = this.transformations[move.base];

    let rotation = _.clone(trans[1]);
    rotation.amount = move.amount * trans[1].amount;
    state.rotations.push(rotation)

    let moves = fromString(trans[0]);

    moves.forEach(m => {
      m.amount *= move.amount;
    });

    return moves;
  } else if (rotations[move.base]) {
    state.rotations.push({
      rotation: move.base,
      amount: -move.amount
    });

    return [];
  }

  return move;
}

getBase.pause = toMoves.pause;
getBase.newline = toMoves.newline;
getBase.comment_short = toMoves.comment_short;
getBase.comment_long = toMoves.comment_long;
getBase.timestamp = toMoves.timestamp;
