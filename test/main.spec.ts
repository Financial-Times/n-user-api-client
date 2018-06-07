import { expect } from 'chai';
import * as API from '../src/main';

describe('Public API', () => {

	const publicFunctions = [
		'getUserBySession',
		'getUserIdAndSessionData',
		'getPaymentDetailsBySession',
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
