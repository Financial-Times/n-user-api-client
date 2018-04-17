import * as sinon from 'sinon';
import { expect } from 'chai';
import { mergeDeepRight } from 'ramda';
import { consentApi } from '../nocks';

import { UserConsent } from '../../src/services/user-consent';
import { APIMode } from '../../src/wrappers/helpers/api-mode';

import { ErrorWithData } from '../../src/utils/error';

import { test, testEnv } from '../constants';

const consentRecordResponse = require('../responses/consent-api-consent-record.json');

const consentRecord = consentRecordResponse.data;
const consentUnit = consentRecordResponse.data[test.category][test.channel];
const consentResponse = { data: consentUnit };

describe('UserConsent - consent API wrapper', () => {
	let api;

	beforeEach(() => {
		api = new UserConsent(test.uuid, test.source, APIMode.Mock, test.scope);
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
			expect(api.validateConsent(consent)).to.have.property(
				'source',
				test.source
			);
		});

		it('should not overwrite consent source', () => {
			consent.source = `${test.source}Original`;
			expect(api.validateConsent(consent)).to.have.property(
				'source',
				`${test.source}Original`
			);
		});

		it('should error for invalid consent payloads', async () => {
			consent.status = 'not-a-boolean';
			try {
				await api.validateConsent(consent);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
				expect(error).to.haveOwnProperty('data');
				expect(error.data).to.deep.include({ type: 'VALIDATION' });
			}
		});

		it('should strip consent payloads of invalid properties', async () => {
			consent.invalidProperty = 'foo';
			const validConsent = await api.validateConsent(consent);
			delete consent.invalidProperty;
			expect(validConsent).to.deep.equal(consent);
		});

		it('should default lbi:false on consent payloads', async () => {
			delete consent.lbi;
			const validConsent = await api.validateConsent(consent);
			consent.lbi = false;
			expect(validConsent).to.deep.equal(consent);
		});

		it('should create valid consent record payloads', async () => {
			consent = {
				category: {
					channel: {
						fow: 'test-fow',
						source: test.source,
						status: true,
						unknownProperty: true
					},
				}
			};
			const validConsent = await api.validateConsentRecord(consent);
			delete consent.category.channel.unknownProperty;
			consent.category.channel.lbi = false;
			expect(validConsent).to.deep.equal(consent);
		});
	});

	context('getConsent', () => {
		it('should get a consent unit for a user', async () => {
			consentApi(
				`/${test.category}/${test.channel}`,
				'get',
				200,
				consentResponse
			);
			const response = await api.getConsent(test.category, test.channel);
			expect(response).to.deep.equal(consentUnit);
		});

		it('should throw a decorated error', async () => {
			consentApi(`/${test.category}/${test.channel}`, 'get', 404);
			try {
				await api.getConsent(test.category, test.channel);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
				expect(error).to.haveOwnProperty('data');
				expect(error.data).to.deep.include({ statusCode: 404 });
			}
		});
	});

	context('getConsentRecord', () => {
		it('should get the consent record for a user', async () => {
			consentApi('', 'get', 200, consentRecordResponse);
			const response = await api.getConsentRecord();
			expect(response).to.deep.equal(consentRecord);
		});

		it('should include version in the response if called with includeVersion = true', async () => {
			consentApi('', 'get', 200, consentRecordResponse);
			const response = await api.getConsentRecord(true);
			const { version, data } = consentRecordResponse;
			expect(response).to.deep.equal({ version, data });
		});

		it('should throw a decorated error', async () => {
			consentApi('', 'get', 404);
			try {
				await api.getConsentRecord();
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
				expect(error).to.haveOwnProperty('data');
				expect(error.data).to.deep.include({ statusCode: 404 });
			}
		});
	});

	context('createConsent', () => {
		it('should create a consent unit for a user', async () => {
			consentApi(
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
			consentApi(`/${test.category}/${test.channel}`, 'post', 404);
			try {
				await api.createConsent(test.category, test.channel, consentUnit);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
				expect(error).to.haveOwnProperty('data');
				expect(error.data).to.deep.include({ statusCode: 404 });
			}
		});
	});

	context('createConsentRecord', () => {
		it('should create a consent record for a user', async () => {
			consentApi('', 'post', 200, consentRecordResponse);
			const response = await api.createConsentRecord(consentRecord);
			expect(response).to.deep.equal(consentRecord);
		});

		it('should throw a decorated error', async () => {
			consentApi('', 'post', 404);
			try {
				await api.createConsentRecord(consentRecord);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
				expect(error).to.haveOwnProperty('data');
				expect(error.data).to.deep.include({ statusCode: 404 });
			}
		});
	});

	context('updateConsent', () => {
		it('should update a consent unit for a user', async () => {
			consentApi(
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
			consentApi(`/${test.category}/${test.channel}`, 'patch', 404);
			try {
				await api.updateConsent(test.category, test.channel, consentUnit);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
				expect(error).to.haveOwnProperty('data');
				expect(error.data).to.deep.include({ statusCode: 404 });
			}
		});
	});

	context('updateConsentRecord', () => {
		let payload;

		beforeEach(() => {
			consentApi('', 'get', 200, consentRecordResponse);
			payload = {
				newCategory: {
					newChannel: {
						status: true,
						lbi: true,
						fow: 'string',
						source: 'string'
					}
				}
			};
		});

		it('should update the consent record for a user', async () => {
			const updatedConsentRecord = mergeDeepRight(consentRecordResponse, {
				data: payload
			});
			consentApi('', 'put', 200, updatedConsentRecord);
			const response = await api.updateConsentRecord(payload);
			expect(response).to.deep.equal(updatedConsentRecord.data);
		});

		it('should not overwrite existing lbi=true', async () => {
			consentApi('', 'put', 200, {});
			const putRequestSpy = sinon
				.spy(UserConsent.prototype, 'request')
				.withArgs(
					'PUT',
					sinon.match.any,
					sinon.match.any,
					sinon.match.any
				);

			// build a payload based on the existing consent record
			payload = JSON.parse(
				JSON.stringify(
					consentRecordResponse.data
				)
			);
			// change the status to check for a correct update
			payload.marketing.byEmail.status = false;

			// request payload should have status = false
			const expectedPayload = JSON.stringify({
				version: consentRecordResponse.version,
				data: payload
			});

			// lbi = false here should not overwrite lbi for the existing record
			payload.marketing.byEmail.lbi = false;

			await api.updateConsentRecord(payload);
			expect(putRequestSpy.calledOnce).to.equal(true);
			expect(putRequestSpy.calledWith(
				'PUT',
				sinon.match.any,
				sinon.match.any,
				{ body: expectedPayload }
			)).to.equal(true);
		});

		it('should throw a decorated error', async () => {
			consentApi('', 'put', 404);
			try {
				await api.updateConsentRecord(payload);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
				expect(error).to.haveOwnProperty('data');
				expect(error.data).to.deep.include({ statusCode: 404 });
			}
		});
	});
});
