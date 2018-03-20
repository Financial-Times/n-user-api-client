import { expect } from 'chai';
import * as nock from 'nock';

import { UserConsent } from '../../src/services/user-consent';
import { APIMode } from '../../src/wrappers/helpers/api-mode';

const testEnv = {
	MEMBERSHIP_API_HOST_MOCK: 'http://mock-api-host.ft.com',
	MEMBERSHIP_API_KEY_MOCK: 'mock-api-key'
};

const { MEMBERSHIP_API_HOST_MOCK, MEMBERSHIP_API_KEY_MOCK } = process.env;

const testUUID = 'test-uuid';

const nockConsentAPI = (path, statusCode, response) =>
	nock(testEnv.MEMBERSHIP_API_HOST_MOCK)
		.post(`/users/${testUUID}${path}`)
		.reply(statusCode, response);

describe.only('UserConsent - consent API wrapper', () => {
	let api;

	beforeEach(() => {
		api = new UserConsent(testUUID, APIMode.Mock);
		Object.assign(process.env, testEnv);
	});

	afterEach(() => {
		nock.cleanAll();
		Object.assign(process.env, {
			MEMBERSHIP_API_HOST_MOCK,
			MEMBERSHIP_API_KEY_MOCK
		});
	});

	it('defaults scope to FTPINK', () => {
		expect(api.scope).to.equal('FTPINK');
	});

	it('gets the consent record for a user', async () => {

	})
});
