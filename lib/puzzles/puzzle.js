const _ = require('lodash');
const {cycle} = require('../util');

const createPieces = function (pieceSpec) {
  let pieces = {};

  Object.keys(pieceSpec).forEach(piece => {
    let perms = pieceSpec[piece][0]; // numbers of pieces

    pieces[piece] = {
      perm: _.range(perms).map((i,index) => index),
      orient: _.range(perms).map(() => 0),
      orientations: pieceSpec[piece][1]
    };
  }, this);

  return pieces;
};

/*
  new Puzzle({spec})

  spec: {
    pieces: {
      <name>: [<permutations>, <orientations>],
      ...
    },
    moves: {
      <base>: {
        <piece>: {
          perm: [...swaps],
          orient:[...orientations]
        },
        ...
      }
    },
    parse: function (alg),
    serialize: function (pieces)
  }
*/
const Puzzle = module.exports = function (spec) {
  if (!spec) {
    throw new Error('missing spec object');
  }

  _.extend(this, spec);

  if (!spec.parse) {
    throw new Error('No parse function defined for puzzle spec');
  }

  this._pieceSpec = createPieces(spec.pieces); // Pieces Object

  this.identity = _.extend({}, spec.identity, this._pieceSpec) // tac on orientations properties and any missing picees;
}

Puzzle.prototype.fromAlg = function (alg) {
  let pieces = this.solved();
  let moves = this.parse(alg);

  moves.forEach(function (move) {
    pieces = this.doMove(pieces, move.base, move.amount);
  }, this);

  return pieces;
}

Puzzle.prototype.doMove = function (pieces, base, amount) {
  if (!this.moves[base]) {
    console.error(`Warning: Move ${base} is undefined!`);
    return pieces;
  }

  pieces = _.merge({}, this.solved(), pieces);
  let move = _.merge({}, this.solved(), this.moves[base]);

  return cycle(pieces, move, amount);
};

// Returns the pieces object for the solved state
Puzzle.prototype.solved = function () {
  return _.cloneDeep(this.identity);
};
