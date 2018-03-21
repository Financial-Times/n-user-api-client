import { expect } from 'chai';
import * as nock from 'nock';
import * as sinon from 'sinon';

import { PlatformAPI } from '../../src/wrappers/platform-api';
import { APIMode } from '../../src/wrappers/helpers/api-mode';

import { ErrorWithData } from '../../src/utils/error';

const testEnv = {
	MEMBERSHIP_API_HOST_MOCK: 'http://mock-api-host.ft.com',
	MEMBERSHIP_API_KEY_MOCK: 'mock-api-key'
};

const { MEMBERSHIP_API_HOST_MOCK, MEMBERSHIP_API_KEY_MOCK } = process.env;

function nockPlatformAPI(
	method: string,
	statusCode: number,
	response?: any
): nock.Scope {
	return nock(testEnv.MEMBERSHIP_API_HOST_MOCK)
		[method]('/')
		.reply(statusCode, response);
}

describe('PlatformAPI wrapper', () => {
	let api;
	let spy: sinon.SinonSpy;

	beforeEach(() => {
		Object.assign(process.env, testEnv);
		api = new PlatformAPI('/', APIMode.Mock);
		spy = sinon.spy(api, '_fetch');
	});

	afterEach(() => {
		nock.cleanAll();
		Object.assign(process.env, {
			MEMBERSHIP_API_HOST_MOCK,
			MEMBERSHIP_API_KEY_MOCK
		});
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
		nockPlatformAPI('get', 200);
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
		nockPlatformAPI('get', 400);
		try {
			await api.request('GET', '', 'Error message');
		} catch (error) {
			expect(error).to.be.instanceof(ErrorWithData);
			expect(error.message).to.equal('Error message');
		}
	});

	it('should resolve a request', async () => {
		nockPlatformAPI('get', 200, 'test-ok-response');
		const response = await api.request('GET', '', 'Error message');
		expect(response.status).to.equal(200);
		expect(await response.text()).to.equal('test-ok-response');
	});
});
