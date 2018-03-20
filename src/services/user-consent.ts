import { mergeDeepRight } from 'ramda';

import { PlatformAPI } from '../wrappers/platform-api';
import { APIMode } from '../wrappers/helpers/api-mode';
import { ConsentAPI } from '../types/consent-api';

import * as schema from './validation/consent-api';

export class UserConsent extends PlatformAPI {
	constructor(
		uuid: string,
		private source: string,
		mode: APIMode = APIMode.Production,
		private scope: string = 'FTPINK'
	) {
		super(`/users/${uuid}`, mode);
	}

	private decorateConsent(
		consent: ConsentAPI.ConsentChannel
	): ConsentAPI.ConsentChannel {
		consent.source = consent.source || this.source;
		consent.status = consent.status !== undefined
			? consent.status
			: consent.lbi || false;
		return consent;
	}

	private async validateConsentPayload(
		consent: ConsentAPI.ConsentChannel
	): Promise<ConsentAPI.ConsentChannel> {
		const decoratedConsent = this.decorateConsent(consent);
		return await schema.validateObject(decoratedConsent, schema.consent);
	}

	private async validateConsentRecordPayload(
		consents: ConsentAPI.ConsentCategories
	): Promise<ConsentAPI.ConsentCategories> {
		for (let [category, value] of Object.entries(consents)) {
			for (let [channel, consent] of Object.entries(value)) {
				consents[category][channel] = this.decorateConsent(consent);
			}
		}
		return await schema.validateObject(consents, schema.record);
	}

	public async getConsent(
		category: string,
		channel: string
	): Promise<ConsentAPI.ConsentUnit> {
		const consent = (await this.request(
			'GET',
			`/${this.scope}/${category}/${channel}`,
			'Could not retrieve consent'
		)) as ConsentAPI.ConsentUnit;

		return await (consent as any).json();
	}

	public async getConsentRecord(): Promise<ConsentAPI.ConsentRecord> {
		const consents = (await this.request(
			'GET',
			`/${this.scope}`,
			'Could not retrieve consent record'
		)) as ConsentAPI.ConsentRecord;

		return await (consents as any).json();
	}

	public async createConsent(
		category: string,
		channel: string,
		consent: ConsentAPI.ConsentChannel
	): Promise<ConsentAPI.ConsentUnit> {
		const payload = await this.validateConsentPayload(consent);

		const createdConsent = (await this.request(
			'POST',
			`/${this.scope}/${category}/${channel}`,
			'Could not create consent',
			{
				body: JSON.stringify({ data: payload })
			}
		)) as ConsentAPI.ConsentUnit;

		return await (createdConsent as any).json();
	}

	public async createConsentRecord(
		consents: ConsentAPI.ConsentCategories
	): Promise<ConsentAPI.ConsentRecord> {
		const payload = await this.validateConsentRecordPayload(consents);

		const createdConsents = (await this.request(
			'POST',
			`/${this.scope}`,
			'Could not create consents',
			{
				body: JSON.stringify({ data: payload })
			}
		)) as ConsentAPI.ConsentRecord;

		return await (createdConsents as any).json();
	}

	public async updateConsent(
		category: string,
		channel: string,
		consent: ConsentAPI.ConsentChannel
	): Promise<ConsentAPI.ConsentUnit> {
		const payload = await this.validateConsentPayload(consent);

		const updatedConsent = (await this.request(
			'PATCH',
			`/${this.scope}/${category}/${channel}`,
			'Could not update consent',
			{
				body: JSON.stringify({ data: payload })
			}
		)) as ConsentAPI.ConsentUnit;

		return await (updatedConsent as any).json();
	}

	public async updateConsentRecord(
		consents: ConsentAPI.ConsentCategories
	): Promise<ConsentAPI.ConsentRecord> {
		const payload = await this.validateConsentRecordPayload(consents);
		const { version, data: existingRecord } = await this.getConsentRecord();

		const updatedRecord = mergeDeepRight(existingRecord, consents);

		const updatedConsents = (await this.request(
			'PUT',
			`/${this.scope}`,
			'Could not update consent',
			{
				body: JSON.stringify({ version, data: updatedRecord })
			}
		)) as ConsentAPI.ConsentRecord;

		return await (updatedConsents as any).json();
	}
}
