const _ = require('lodash');

const next = module.exports.next = (how) => (p,i,what) => what[how[i]];
const prev = module.exports.prev = (how) => (p) => how.indexOf(p);
const rotate = module.exports.rotate = (how, n) => (p,i,what) => (p + how[i]) % n;

// Creates an Identity array [0,1,2,...], then maps that by prev
const invertCycle = module.exports.invertCycle = pieces => pieces.map((p,i) => i).map(prev(pieces));

/*  moves pieces based on move spec and amount
      move: object containing perm and orient arrays and orientations number
    returns function to be applied on piece set
*/
const cyclePieces = module.exports.cyclePieces = (move, amount) => {
  amount = amount || 1; // No reason to ever cycle 0;

  return (pieces) => {
    let newPerm = next(amount < 0 ? invertCycle(move.perm) : move.perm);

    let permute = perm => perm.map(newPerm);
    let orientate = orient => orient.map(newPerm).map(rotate(move.orient, pieces.orientations));

    let perm = pieces.perm;
    let orient = pieces.orient;

    for (let i = Math.abs(amount); i > 0; i--) {
      perm = permute(perm);
      if (move.orient) {
        orient = orientate(orient);
      }
    }

    return _.extend({}, pieces, move.orient ? {perm, orient} : {perm});
  };
};

const cycle = module.exports.cycle = function (pieces, move, amount) {
  let newPieces = {};

  Object.keys(pieces).forEach(piecesName => {
    newPieces[piecesName] = move[piecesName] ? cyclePieces(move[piecesName], amount)(pieces[piecesName]) : pieces[piecesName];
  });

  return newPieces;
};

const combine = module.exports.combine = (...moves) => moves.reduce((a,b) => cycle(a,b,1));

const diff = module.exports.diff = function (algs) {
  let split = algs.map(alg => alg.split(''))
  return split[0].map((s,index) =>
    _.every(split, m => s === m[index]) ? s : '*'
  ).join('');
};
