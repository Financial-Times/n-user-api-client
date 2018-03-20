import { PlatformAPI } from '../wrappers/platform-api';
import { APIMode } from '../wrappers/helpers/api-mode';
import { ConsentAPI } from '../types/consent-api';

// returns consents normalised to the Consent API schema
export class UserConsent extends PlatformAPI {
	constructor(
		uuid: string,
		mode: APIMode = APIMode.Production,
		private scope: string = 'FTPINK'
	) {
		super(`/users/${uuid}`, mode);
	}

	public async getConsent(
		category: string,
		channel: string
	): Promise<ConsentAPI.ConsentUnit> {
		const consent = (await this.get(
			`/${this.scope}/${category}/${channel}`,
			'Could not retrieve consent'
		)) as ConsentAPI.ConsentUnit;

		return consent;
	}

	public async getConsents(): Promise<ConsentAPI.ConsentRecord> {
		const consents = (await this.get(
			`/${this.scope}`,
			'Could not retrieve consent record'
		)) as ConsentAPI.ConsentRecord;

		return consents;
	}

	public async createConsent(
		category: string,
		channel: string,
		consent: ConsentAPI.ConsentChannel
	): Promise<ConsentAPI.ConsentUnit> {
		const createdConsent = (await this.post(
			`/${this.scope}/${category}/${channel}`,
			'Could not create consent',
			{
				body: JSON.stringify({ data: consent })
			}
		)) as ConsentAPI.ConsentUnit;

		return createdConsent;
	}

	public async createConsents(
		category: string,
		channel: string,
		consents: ConsentAPI.ConsentCategories
	): Promise<ConsentAPI.ConsentRecord> {
		const createdConsents = (await this.post(
			`/${this.scope}`,
			'Could not create consents',
			{
				body: JSON.stringify({ data: consents })
			}
		)) as ConsentAPI.ConsentRecord;

		return createdConsents;
	}

	public async updateConsent(
		category: string,
		channel: string,
		consent: ConsentAPI.ConsentChannel
	): Promise<ConsentAPI.ConsentUnit> {
		const updatedConsent = (await this.patch(
			`/${this.scope}/${category}/${channel}`,
			'Could not update consent',
			{
				body: JSON.stringify({ data: consent })
			}
		)) as ConsentAPI.ConsentUnit;

		return updatedConsent;
	}

	public async updateConsents(
		category: string,
		channel: string,
		consents: ConsentAPI.ConsentCategories
	): Promise<ConsentAPI.ConsentRecord> {
		let { version, data: recordToUpdate } = await this.getConsent(
			category,
			channel
		);

		for (const [category, channelConsents] of Object.entries(consents)) {
			for (const [channel, consent] of Object.entries(channelConsents)) {
				recordToUpdate[category][channel] = consent;
			}
		}

		const updatedConsents = (await this.post(
			`/${this.scope}/${category}/${channel}`,
			'Could not update consent',
			{
				body: JSON.stringify({ version, data: recordToUpdate })
			}
		)) as ConsentAPI.ConsentRecord;

		return updatedConsents;
	}
}
