const colors = require('colors')
const { Three } = require('./lib/puzzles');

const Blocks = [{
	name: 'UBL',
	corners: [0],
	edges: [0,3,4]
}, {
	name: 'URB',
	corners: [1],
	edges: [1,2,5]
}, {
	name: 'UFR',
	corners: [2],
	edges: [1,2,6]
}, {
	name: 'ULF',
	corners: [3],
	edges: [2,3,7]
}, {
	name: 'DLB',
	corners: [4],
	edges: [4,11,8]
}, {
	name: 'DBR',
	corners: [5],
	edges: [5,8,9]
}, {
	name: 'DRF',
	corners: [6],
	edges: [6,9,10]
}, {
	name: 'DFL',
	corners: [7],
	edges: [7,10,11]
}];

const getCycles = function (pieceSet) {
	let piecesLookedAt = [];
	let cycles = [];
	for (let i = 0; i < pieceSet.perm.length; i++) {
		if (piecesLookedAt.indexOf(i) > -1)
			continue;
		// iterate till we find an unsolved piece, use as buffer
		if (pieceSet.perm[i] !== i) {
			// we found our unsolved piece
			let unsolved = i;
			let p = pieceSet.perm[i], length = 1, pieces = [];
			pieces.push(p);
			piecesLookedAt.push(p);
			// iterate till p == unsolved;
			while (p !== unsolved) {
				p = pieceSet.perm[p];
				length++;
				pieces.push(p);
				piecesLookedAt.push(p);
			}
			cycles.push(
				pieces
			)
		}
	}
	return cycles;
}

const getData = function (cubeState) {
	let cornersSolved = 0,
			cornersFlipped = 0;
	let edgesSolved = 0,
			edgesFlipped = 0;

	for (let i = 0; i < cubeState.corners.perm.length; i++) {
		cornersSolved += (cubeState.corners.perm[i] === i && cubeState.corners.orient[i] === 0);
		cornersFlipped += (cubeState.corners.perm[i] === i && cubeState.corners.orient[i] !== 0);
	}

	for (let i = 0; i < cubeState.edges.perm.length; i++) {
		edgesSolved += (cubeState.edges.perm[i] === i && cubeState.edges.orient[i] === 0);
		edgesFlipped += (cubeState.edges.perm[i] === i && cubeState.edges.orient[i] !== 0);
	}

	let blocks = [];
	Blocks.forEach(block => {
		if (block.corners.every(i => cubeState.corners.perm[i] === i && cubeState.corners.orient[i] === 0) &&
				block.edges.every(i => cubeState.edges.perm[i] === i && cubeState.edges.orient[i] === 0)) {
			blocks.push(block.name)
		}
	});

	return {
		corners: {
			solved: cornersSolved,
			flipped: cornersFlipped,
			cycles: getCycles(cubeState.corners)
		},
		edges: {
			solved: edgesSolved,
			flipped: edgesFlipped,
			cycles: getCycles(cubeState.edges)
		},
		eo: {
			FB: cubeState.edges.orient.reduce((a,b) => a+b)
		},
		blocks
	}
}

let CORNERS = ['UBL', 'URB', 'UFR', 'ULF', 'DLB', 'DBR', 'DRF', 'DFL'];
let EDGES = ['UB', 'UR', 'UF', 'UL', 'BL', 'BR', 'FR', 'BL', 'DB', 'DR', 'DF', 'DL'];

const printData = function (moves, options) {
	if (!options) {
		options = {
			EO: true
		};
	}

	let cube = Three.fromAlg(moves);
	let data = getData(cube);

	let num = x => colors.blue(x);

	console.log()

	console.log(`Corners:`);
	console.log(` - ${num(data.corners.solved)} solved`);
	console.log(` - ${num(data.corners.flipped)} flipped`);
	console.log(' - Cycles:');
	data.corners.cycles.forEach(cycle => {
		console.log(`   - ${cycle.map(c => colors.blue(CORNERS[c])).join(' -> ')} (length ${cycle.length + (cycle.length.length === 2 ? ' parity'.red : '')})`);
	});
	if (data.corners.cycles.length === 0) {
		console.log('  none'.red)
	}

	console.log(`Edges:`);
	console.log(` - ${num(data.edges.solved)} solved`);
	console.log(` - ${num(data.edges.flipped)} flipped`);
	console.log(' - Cycles:');
	data.edges.cycles.forEach(cycle => {
		console.log(`   - ${cycle.map(c => colors.blue(EDGES[c])).join(' -> ')} (length ${cycle.length + (cycle.length.length === 2 ? ' parity'.red : '')})`);
	});
	if (data.edges.cycles.length === 0) {
		console.log('  none'.red)
	}

	if (options.EO) {
		console.log('EO:');
		console.log(` - FB: ${num(data.eo.FB)} flipped`);

		let cube2 = Three.fromAlg(`y ${moves} y'`);

		console.log(` - RL: ${num(getData(cube2).eo.FB)} flipped`);

		let cube3 = Three.fromAlg(`x ${moves} x'`);
		console.log(` - UD: ${num(getData(cube2).eo.FB)} flipped`);
		console.log(`Blocks: ${data.blocks.length ? data.blocks.map(num).join(', ') : 'none'}`)
	}
}

let scramble = "B' L' D2 R U F' U' L U2 D R2 U2 F B R2 B U2 B L2 B2 U2";
let solution = "B' F D2 L' B R2 F2 D F' D2 F R' D' R D2 F U2";

console.log('moves:');
console.log('scramble: ' + colors.green(scramble));
console.log('solution: ' + colors.blue(solution));

const opts = {
	EO: false
}

printData(scramble + solution, opts);

let A = solution, B = '';

while (A.trim() !== '') {

	B = A.split(' ').slice(-1).concat(B.split(' ')).join(' ').trim();
	A = A.split(' ').slice(0,-1).join(' ');

	console.log('\nmoves:')
	console.log(`B: ${colors.blue(B)}`);
	console.log(`S: ${colors.green(scramble)}`)
	console.log(`A: ${colors.blue(A)}`)

	printData(B + scramble + A, opts);
}