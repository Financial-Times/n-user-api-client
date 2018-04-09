import { mergeDeepRight } from 'ramda';

import { PlatformAPI } from '../wrappers/platform-api';
import { APIMode } from '../wrappers/helpers/api-mode';
import { ConsentAPI } from '../types/consent-api';

import * as ConsentValidator from './validation/consent-api';

export class UserConsent extends PlatformAPI {
	constructor(
		uuid: string,
		private source: string,
		mode: any = APIMode.Production,
		private scope: string = 'FTPINK',
		envPrefix?: string
	) {
		super(`/consent/users/${uuid}`, mode, {}, envPrefix);
	}

	private validateConsent(
		consent: ConsentAPI.ConsentChannel
	): ConsentAPI.ConsentChannel {
		return ConsentValidator.validateConsent(consent, this.source);
	}

	private validateConsentRecord(
		consents: ConsentAPI.ConsentCategories
	): ConsentAPI.ConsentCategories {
		return ConsentValidator.validateConsentRecord(consents);
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

		const { data } = await (consent as any).json();
		return data;
	}

	public async getConsentRecord(
		includeVersion: boolean = false
	): Promise<ConsentAPI.ConsentRecord> {
		const consents = (await this.request(
			'GET',
			`/${this.scope}`,
			'Could not retrieve consent record'
		)) as ConsentAPI.ConsentRecord;

		const { version, data } = await (consents as any).json();

		return includeVersion
			? { version, data }
			: data;
	}

	public async createConsent(
		category: string,
		channel: string,
		consent: ConsentAPI.ConsentChannel
	): Promise<ConsentAPI.ConsentUnit> {
		const payload = this.validateConsent(consent);

		const createdConsent = (await this.request(
			'POST',
			`/${this.scope}/${category}/${channel}`,
			'Could not create consent',
			{
				body: JSON.stringify({ data: payload })
			}
		)) as ConsentAPI.ConsentUnit;

		const { data } = await (createdConsent as any).json();
		return data;
	}

	public async createConsentRecord(
		consents: ConsentAPI.ConsentCategories
	): Promise<ConsentAPI.ConsentRecord> {
		const payload = this.validateConsentRecord(consents);

		const createdConsents = (await this.request(
			'POST',
			`/${this.scope}`,
			'Could not create consents',
			{
				body: JSON.stringify({ data: payload })
			}
		)) as ConsentAPI.ConsentRecord;

		const { data } = await (createdConsents as any).json();
		return data;
	}

	public async updateConsent(
		category: string,
		channel: string,
		consent: ConsentAPI.ConsentChannel
	): Promise<ConsentAPI.ConsentUnit> {
		const payload = this.validateConsent(consent);

		const updatedConsent = (await this.request(
			'PATCH',
			`/${this.scope}/${category}/${channel}`,
			'Could not update consent',
			{
				body: JSON.stringify({ data: payload })
			}
		)) as ConsentAPI.ConsentUnit;

		const { data } = await (updatedConsent as any).json();
		return data;
	}

	public async updateConsentRecord(
		consents: ConsentAPI.ConsentCategories
	): Promise<ConsentAPI.ConsentRecord> {
		const payload = this.validateConsentRecord(consents);

		// get the user's consent record, including version	
		const {
			version,
			data: existingRecord
		} = await this.getConsentRecord(true);

		let updatedConsentRecord = mergeDeepRight(existingRecord, payload);

		for (let [category, categoryConsents] of Object.entries(existingRecord)) {
			for (let [channel, channelConsent] of Object.entries(categoryConsents)) {
				if (channelConsent.lbi === true) {
					updatedConsentRecord[category][channel].lbi = true;
				}
			}
		}

		const updatedConsents = (await this.request(
			'PUT',
			`/${this.scope}`,
			'Could not update consent',
			{
				body: JSON.stringify({
					version,
					data: updatedConsentRecord
				})
			}
		)) as ConsentAPI.ConsentRecord;

		const { data } = await (updatedConsents as any).json();
		return data;
	}
}

export { ConsentValidator };
