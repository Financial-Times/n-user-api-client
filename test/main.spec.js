const {expect} = require('chai');
const API = require('../dist/main');

describe('Public API', () => {

	const publicFunctions = [
		'getUserBySession',
		'getUserIdAndSessionData',
		'updateUserProfile',
		'changeUserPassword',
		'loginUser'
	];

	it('should export correct functions', () => {
		publicFunctions.map(funcName => {
			expect(typeof API[funcName], `API doesn't export ${funcName}!`).to.equal('function');
		});
	});

});
