import { expect } from 'chai';
import * as nock from 'nock';
import { mergeDeepRight } from 'ramda';

import { UserConsent } from '../../src/services/user-consent';
import { APIMode } from '../../src/wrappers/helpers/api-mode';

import { ErrorWithData } from '../../src/utils/error';

const consentRecord = require('../responses/consent-api-consent-record.json');

const testEnv = {
	MEMBERSHIP_API_HOST_MOCK: 'http://mock-api-host.ft.com',
	MEMBERSHIP_API_KEY_MOCK: 'mock-api-key'
};

const { MEMBERSHIP_API_HOST_MOCK, MEMBERSHIP_API_KEY_MOCK } = process.env;

const test = {
	uuid: 'test-uuid',
	source: 'test-source',
	scope: 'TEST',
	category: 'marketing',
	channel: 'byEmail'
};

const consentUnit = consentRecord.data[test.category][test.channel];

function nockConsentAPI(
	path: string,
	method: string,
	statusCode: number,
	response?: any
): nock.Scope {
	return nock(testEnv.MEMBERSHIP_API_HOST_MOCK)
		[method](`/users/${test.uuid}/${test.scope}${path}`)
		.reply(statusCode, response);
}

describe.only('UserConsent - consent API wrapper', () => {
	let api;

	beforeEach(() => {
		Object.assign(process.env, testEnv);
		api = new UserConsent(test.uuid, test.source, APIMode.Mock, test.scope);
	});

	afterEach(() => {
		nock.cleanAll();
		Object.assign(process.env, {
			MEMBERSHIP_API_HOST_MOCK,
			MEMBERSHIP_API_KEY_MOCK
		});
	});

	it('defaults scope to FTPINK', () => {
		api = new UserConsent(test.uuid, test.source, APIMode.Mock);
		expect(api.scope).to.equal('FTPINK');
	});

	context('getConsent', () => {
		it('gets a consent unit for a user', async () => {
			nockConsentAPI(`/${test.category}/${test.channel}`, 'get', 200, consentUnit);
			const response = await api.getConsent(test.category, test.channel);
			expect(response).to.deep.equal(consentUnit);
		});

		it('errors with data', async () => {
			nockConsentAPI(`/${test.category}/${test.channel}`, 'get', 400);
			try {
				await api.getConsent(test.category, test.channel);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});

	context('getConsentRecord', () => {
		it('gets the consent record for a user', async () => {
			nockConsentAPI('', 'get', 200, consentRecord);
			const response = await api.getConsentRecord();
			expect(response).to.deep.equal(consentRecord);
		});

		it('errors with data', async () => {
			nockConsentAPI('', 'get', 400);
			try {
				await api.getConsentRecord();
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});

	context('createConsent', () => {
		it('creates a consent unit for a user', async () => {
			nockConsentAPI(`/${test.category}/${test.channel}`, 'post', 200, consentUnit);
			const response = await api.createConsent(test.category, test.channel, consentUnit);
			expect(response).to.deep.equal(consentUnit);
		});

		it('errors with data', async () => {
			nockConsentAPI(`/${test.category}/${test.channel}`, 'post', 400);
			try {
				await api.createConsent(test.category, test.channel, consentUnit);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});

	context('createConsentRecord', () => {
		it('creates a consent record for a user', async () => {
			nockConsentAPI('', 'post', 200, consentRecord);
			const response = await api.createConsentRecord(consentRecord.data);
			expect(response).to.deep.equal(consentRecord);
		});

		it('errors with data', async () => {
			nockConsentAPI('', 'post', 400);
			try {
				await api.createConsentRecord(consentRecord.data);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});

	context('updateConsent', () => {
		it('updates a consent unit for a user', async () => {
			nockConsentAPI(`/${test.category}/${test.channel}`, 'patch', 200, consentUnit);
			const response = await api.updateConsent(test.category, test.channel, consentUnit);
			expect(response).to.deep.equal(consentUnit);
		});

		it('errors with data', async () => {
			nockConsentAPI(`/${test.category}/${test.channel}`, 'patch', 400);
			try {
				await api.updateConsent(test.category, test.channel, consentUnit);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});

	context('updateConsentRecord', () => {
		const payload = {
			newCategory: {
				newChannel: {
					status: true,
					lbi: true,
					fow: 'string',
					source: 'string'
				}
			}
		};

		const updatedConsentRecord = mergeDeepRight(consentRecord, { data: payload });

		it('updates the consent record for a user', async () => {
			nockConsentAPI('', 'get', 200, consentRecord);
			nockConsentAPI('', 'put', 200, updatedConsentRecord);
			const response = await api.updateConsentRecord(payload);
			expect(response).to.deep.equal(updatedConsentRecord);
		});

		it('errors with data', async () => {
			nockConsentAPI('', 'put', 400);
			try {
				await api.updateConsentRecord(payload);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});
});
