import { expect } from 'chai';

import * as ConsentValidator from '../../src/validation/consent-api';

import { ErrorWithData } from '../../src/utils/error';
import { test } from '../constants';

const consentRecordResponse = require('../responses/consent-api-consent-record.json');

const consentRecord = consentRecordResponse.data;
const consentUnit = consentRecordResponse.data[test.category][test.channel];

describe('ConsentValidator - consent API validation', () => {
	it('should destructure consent from a record', () => {
		const { category, channel, consent } =
			ConsentValidator.destructureConsentFromRecord(consentRecord);
		expect(category).to.equal(test.category);
		expect(channel).to.equal(test.channel);
		expect(consent).to.equal(consentUnit);
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
			expect(
				ConsentValidator.validateConsent(consent, test.source)
			).to.have.property('source', test.source);
		});

		it('should not overwrite consent source', () => {
			consent.source = `${test.source}Original`;
			expect(
				ConsentValidator.validateConsent(consent, test.source)
			).to.have.property('source', `${test.source}Original`);
		});

		it('should error for invalid consent payloads', async () => {
			consent.status = 'not-a-boolean';
			try {
				await ConsentValidator.validateConsent(consent, test.source);
			} catch (error) {
				expect(error).to.be.instanceof(ErrorWithData);
			}
		});

		it('should strip consent payloads of invalid properties', async () => {
			consent.invalidProperty = 'foo';
			const validConsent = await ConsentValidator.validateConsent(
				consent,
				test.source
			);
			delete consent.invalidProperty;
			expect(validConsent).to.deep.equal(consent);
		});

		it('should default lbi:false on consent payloads', async () => {
			delete consent.lbi;
			const validConsent = await ConsentValidator.validateConsent(
				consent,
				test.source
			);
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
					}
				}
			};
			const validConsent = await ConsentValidator.validateConsentRecord(
				consent
			);
			delete consent.category.channel.unknownProperty;
			consent.category.channel.lbi = false;
			expect(validConsent).to.deep.equal(consent);
		});
	});
});
