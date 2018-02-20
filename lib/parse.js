const {fromString} = require('alg').cube;

module.exports = {
	notations: {
		sign: {
			puzzle: 'cube', // denotes any NxNxN cube
			parse: function (alg) {
				return fromString(alg).map(move => ({base: move.base, amount: move.amount, layer: move.layer || 1}));
			}
		}
	},

	parse: function (alg, notation) {
		return this.notations[(notation || 'sign').toLowerCase()].parse(alg);
	}
};
