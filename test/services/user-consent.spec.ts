import { expect } from 'chai';
import * as nock from 'nock';
import { mergeDeepRight } from 'ramda';

import { UserConsent } from '../../src/services/user-consent';
import { APIMode } from '../../src/wrappers/helpers/api-mode';

import { ErrorWithData } from '../../src/utils/error';

const consentRecordResponse = require('../responses/consent-api-consent-record.json');

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

const consentRecord = consentRecordResponse.data;
const consentUnit = consentRecordResponse.data[test.category][test.channel];
const consentResponse = { data: consentUnit };

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

describe('UserConsent - consent API wrapper', () => {
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

	it('should default scope to FTPINK', () => {
		api = new UserConsent(test.uuid, test.source, APIMode.Mock);
		expect(api.scope).to.equal('FTPINK');
	});

	context('validation', () => {
		let consent;

		beforeEach(() => {
			consent = {
				fow: 'test-fow',
				lbi: false,
				source: test.source,
				status: true
			};
		});

		it('should decorate consent with source if not specified', () => {
			delete consent.source;
			expect(api.decorateConsent(consent)).to.have.property(
				'source',
				test.source
			);
		});

		it('should not overwrite consent source', () => {
			consent.source = `${test.source}-other`;
			expect(api.decorateConsent(consent)).to.have.property(
				'source',
				`${test.source}-other`
			);
		});

		it('should error for invalid consent payloads', async () => {
			consent.status = 'not-a-boolean';
			try {
				await api.validateConsentPayload(consent);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});

		it('should strip consent payloads of invalid properties', async () => {
			consent.invalidProperty = 'foo';
			const validConsent = await api.validateConsentPayload(consent);
			delete consent.invalidProperty;
			expect(validConsent).to.deep.equal(consent);
		});

		it('should default lbi:false on consent payloads', async () => {
			delete consent.lbi;
			const validConsent = await api.validateConsentPayload(consent);
			consent.lbi = false;
			expect(validConsent).to.deep.equal(consent);
		});

		it('should create valid consent record payloads', async () => {
			consent = {
				category: {
					channel: {
						fow: 'test-fow',
						status: true
					}
				}
			};
			const validConsent = await api.validateConsentRecordPayload(consent);
			consent.category.channel.lbi = false;
			consent.category.channel.source = test.source;
			expect(validConsent).to.deep.equal(consent);
		});
	});

	context('getConsent', () => {
		it('should get a consent unit for a user', async () => {
			nockConsentAPI(
				`/${test.category}/${test.channel}`,
				'get',
				200,
				consentResponse
			);
			const response = await api.getConsent(test.category, test.channel);
			expect(response).to.deep.equal(consentUnit);
		});

		it('should throw a decorated error', async () => {
			nockConsentAPI(`/${test.category}/${test.channel}`, 'get', 400);
			try {
				await api.getConsent(test.category, test.channel);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});

	context('getConsentRecord', () => {
		it('should get the consent record for a user', async () => {
			nockConsentAPI('', 'get', 200, consentRecordResponse);
			const response = await api.getConsentRecord();
			expect(response).to.deep.equal(consentRecord);
		});

		it('should throw a decorated error', async () => {
			nockConsentAPI('', 'get', 400);
			try {
				await api.getConsentRecord();
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});

	context('createConsent', () => {
		it('should create a consent unit for a user', async () => {
			nockConsentAPI(
				`/${test.category}/${test.channel}`,
				'post',
				200,
				consentResponse
			);
			const response = await api.createConsent(
				test.category,
				test.channel,
				consentUnit
			);
			expect(response).to.deep.equal(consentUnit);
		});

		it('should throw a decorated error', async () => {
			nockConsentAPI(`/${test.category}/${test.channel}`, 'post', 400);
			try {
				await api.createConsent(test.category, test.channel, consentUnit);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});

	context('createConsentRecord', () => {
		it('should create a consent record for a user', async () => {
			nockConsentAPI('', 'post', 200, consentRecordResponse);
			const response = await api.createConsentRecord(consentRecord);
			expect(response).to.deep.equal(consentRecord);
		});

		it('should throw a decorated error', async () => {
			nockConsentAPI('', 'post', 400);
			try {
				await api.createConsentRecord(consentRecord);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});

	context('updateConsent', () => {
		it('should update a consent unit for a user', async () => {
			nockConsentAPI(
				`/${test.category}/${test.channel}`,
				'patch',
				200,
				consentResponse
			);
			const response = await api.updateConsent(
				test.category,
				test.channel,
				consentUnit
			);
			expect(response).to.deep.equal(consentUnit);
		});

		it('should throw a decorated error', async () => {
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

		const updatedConsentRecord = mergeDeepRight(consentRecordResponse, {
			data: payload
		});

		it('should update the consent record for a user', async () => {
			nockConsentAPI('', 'get', 200, consentRecordResponse);
			nockConsentAPI('', 'put', 200, updatedConsentRecord);
			const response = await api.updateConsentRecord(payload);
			expect(response).to.deep.equal(updatedConsentRecord.data);
		});

		it('should throw a decorated error', async () => {
			nockConsentAPI('', 'put', 400);
			try {
				await api.updateConsentRecord(payload);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});
	});
});
