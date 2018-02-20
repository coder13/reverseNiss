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
	edges: [4,10,11]
}, {
	name: 'DBR',
	corners: [5],
	edges: [5,9,10]
}, {
	name: 'DLB',
	corners: [6],
	edges: [4,8,9]
}, {
	name: 'DBR',
	corners: [7],
	edges: [5,11,8]
}];

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
			flipped: cornersFlipped
		},
		edges: {
			solved: edgesSolved,
			flipped: edgesFlipped
		},
		eo: {
			FB: cubeState.edges.orient.reduce((a,b) => a+b)
		},
		blocks
	}
}

let scramble = "R F2 R2 B2 L2 B D2 R2 D2 L2 B' U L U' B2 D2 U2 F U'";
let solution = "U D2 R L B2 L' D'";
let cube = Three.fromAlg(scramble + " " + solution);

console.log('Scramble: ' + scramble);
console.log('Solution: ' + solution);

let data = getData(cube);

let num = x => colors.blue(x);

console.log()

console.log(`Corners:`);
console.log(` - ${num(data.corners.solved)} solved`);
console.log(` - ${num(data.corners.flipped)} flipped`);

console.log(`Edges:`);
console.log(` - ${num(data.edges.solved)} solved`);
console.log(` - ${num(data.edges.flipped)} flipped`);

console.log('EO:');
console.log(` - FB: ${num(data.eo.FB)} flipped`);

let cube2 = Three.fromAlg(`y ${scramble} y'`);

console.log(` - RL: ${num(getData(cube2).eo.FB)} flipped`);

let cube3 = Three.fromAlg(`x ${scramble} x'`);
console.log(` - UD: ${num(getData(cube2).eo.FB)} flipped`);
console.log(`Blocks: ${data.blocks ? data.blocks.map(num).join(', ') : 'none'}`)
