import { expect } from 'chai';
import { nocks } from '../nocks';
import * as sinon from 'sinon';

import { PlatformAPI } from '../../src/wrappers/platform-api';
import { APIMode } from '../../src/wrappers/helpers/api-mode';

import { ErrorWithData } from '../../src/utils/error';

import { testEnv } from '../constants';


describe('PlatformAPI wrapper', () => {
	let api;
	let spy: sinon.SinonSpy;

	beforeEach(() => {
		api = new PlatformAPI('/', APIMode.Mock);
		spy = sinon.spy(api, '_fetch');
	});

	it('should throw if MEMBERSHIP_API_HOST_ENV is not set', () => {
		delete process.env.MEMBERSHIP_API_HOST_MOCK;
		try {
			new PlatformAPI('/', APIMode.Mock);
		} catch (error) {
			expect(error).to.be.instanceof(ErrorWithData);
		}
	});

	it('should throw if MEMBERSHIP_API_KEY_ENV is not set', () => {
		delete process.env.MEMBERSHIP_API_KEY_MOCK;
		try {
			new PlatformAPI('/', APIMode.Mock);
		} catch (error) {
			expect(error).to.be.instanceof(ErrorWithData);
		}
	});

	it('should deep merge request options', async () => {
		nocks.platformApi('get', 200);
		const options = {
			headers: {
				foo: 'bar'
			}
		};
		const response = await api.request('GET', '', 'Error message', options);
		sinon.assert.calledOnce(spy);
		sinon.assert.calledWithMatch(
			spy,
			'',
			sinon.match(options),
			'Error message'
		);
	});

	it('should throw if request errors', async () => {
		nocks.platformApi('get', 400);
		try {
			await api.request('GET', '', 'Error message');
		} catch (error) {
			expect(error).to.be.instanceof(ErrorWithData);
			expect(error.message).to.equal('Error message');
		}
	});

	it('should resolve a request', async () => {
		nocks.platformApi('get', 200, 'test-ok-response');
		const response = await api.request('GET', '', 'Error message');
		expect(response.status).to.equal(200);
		expect(await response.text()).to.equal('test-ok-response');
	});
});
