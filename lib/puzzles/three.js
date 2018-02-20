const Puzzle = require('./puzzle');
const parse = require('../parse').notations.sign.parse;
const {combine, cycle} = require('../util');
const {countMoves, fromString, simplify, toString} = require('alg').cube;

const cubeMap = {
  Uw: 'u',
  Rw: 'r',
  Fw: 'f',
  Dw: 'd',
  Lw: 'l',
  Bw: 'b'
}

const letters = 'ABCDEFGHIJKL';

const identity = {
  corners: {
    perm: [0,1,2,3,4,5,6,7],
    orient: [0,0,0,0,0,0,0,0],
    orientations: 3
  }, edges: {
    perm: [0,1,2,3,4,5,6,7,8,9,10,11],
    orient: [0,0,0,0,0,0,0,0,0,0,0,0],
    orientations: 2
  }, centers: {
    perm: [0,1,2,3,4,5],
    orient: [0,0,0,0,0,0],
    orientations: 1
  }
};

const invert = move => cycle(identity, move, -1);

let moves = {
  U: {
    corners: {
      perm: [3,0,1,2,4,5,6,7] 
    }, edges: {
      perm: [3,0,1,2,4,5,6,7,8,9,10,11]
    }
  },
  R: {
    corners: {
      perm: [0,2,6,3,4,1,5,7],
      orient: [0,2,1,0,0,1,2,0]
    }, edges: {
      perm: [0,6,2,3,4,1,9,7,8,5,10,11]
    }
  },
  F: {
    corners: {
      perm: [0,1,3,7,4,5,2,6],
      orient: [0,0,2,1,0,0,1,2]
    }, edges: {
      perm: [0,1,7,3,4,5,2,10,8,9,6,11],
      orient: [0,0,1,0,0,0,1,1,0,0,1,0]
    }
  },
  D: {
    corners: {
      perm: [0,1,2,3,5,6,7,4],
      orient: [0,0,0,0,0,0,0,0]
    }, edges: {
      perm: [0,1,2,3,4,5,6,7,9,10,11,8]
    }
  },
  L: {
    corners: {
      perm: [4,1,2,0,7,5,6,3],
      orient: [1,0,0,2,2,0,0,1]
    }, edges: {
      perm: [0,1,2,4,11,5,6,3,8,9,10,7]
    }
  },
  B: {
    corners: {
      perm: [1,5,2,3,0,4,6,7],
      orient: [2,1,0,0,1,2,0,0]
    },
    edges: {
      perm: [5,1,2,3,0,8,6,7,4,9,10,11],
      orient: [1,0,0,0,1,1,0,0,1,0,0,0]
    }
  },
  M: {
    edges: {
      perm: [8,1,0,3,4,5,6,7,10,9,2,11],
      orient: [1,0,1,0,0,0,0,0,1,0,1,0]
    },
    centers: {
      perm: [4,1,0,3,5,2]
    }
  },
  S: {
    edges: {
      // perm: [0,9,2,1,4,5,6,7,8,11,10,3],
      perm: [0,3,2,11,4,5,6,7,8,1,10,9],
      orient: [0,1,0,1,0,0,0,0,0,1,0,1]
    },
    centers: {
      perm: [1,5,2,0,4,3]
    }
  },
  E: {
    edges: {
      perm: [0,1,2,3,5,6,7,4,8,9,10,11],
      orient: [0,0,0,0,1,1,1,1,0,0,0,0]
    }, centers: {
      perm: [0,4,1,2,3,5]
    }
  }
};

moves.u = combine(identity, moves.U, invert(moves.E));
moves.r = combine(identity, moves.R, invert(moves.M));
moves.f = combine(identity, moves.F, moves.S);
moves.d = combine(identity, moves.D, moves.E);
moves.l = combine(identity, moves.L, moves.M);
moves.b = combine(identity, moves.B, invert(moves.S));

moves.y = combine(identity, moves.u, invert(moves.D));
moves.x = combine(identity, moves.r, invert(moves.L));
moves.z = combine(identity, moves.f, invert(moves.B));


module.exports = new Puzzle({
  pieces: {
    corners: [8, 3],
    edges: [12, 2],
    centers: [6, 1]
  },

  identity,

  moves,

  valid: () => true,

  normalize: function (alg) {
    let moves = fromString(alg);
    moves = moves.map(move => {
      move.base = cubeMap[move.base] ? cubeMap[move.base] : move.base;
      return move
    });

    return simplify(toString(moves));
  },

  moveCount: function (alg) {
    return {
      htm: countMoves(alg, {metric: 'obtm'}),
      stm: countMoves(alg, {metric: 'btm'}),
      qtm: countMoves(alg, {metric: 'obqtm'})
    };
  },

  parse,

  // serialize (pieces) {
  //   let corners = pieces.corners.perm.map((c, i) => letters[c] + pieces.corners.orient[i]).join('');
  //   let edges = pieces.edges.perm.map((c, i) => letters[c] + pieces.edges.orient[i]).join('');
  //   let centers = pieces.centers.perm.map(c => letters[c]).join('');
  //   return `${corners}-${edges}-${centers}`;
  // }
  serialize (pieces) {
    let corners = `${pieces.corners.perm.join('')}-${pieces.corners.orient.join('')}`;
    let edges = `${pieces.edges.perm.join('')}-${pieces.edges.orient.join('')}`;
    let centers = `${pieces.centers.perm.join('')}`;
    return `${corners},${edges},${centers}`;
  }
});