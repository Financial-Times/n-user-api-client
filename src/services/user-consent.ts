import { PlatformAPI } from '../wrappers/platform-api';
import { APIMode } from '../wrappers/helpers/api-mode';

export namespace ConsentAPI {
	export interface ConsentChannel {
		version?: number;
		status: boolean;
		lbi: boolean;
		fow: string;
		source: string;
		lastModified?: string;
	}

	export interface ConsentCategory {
		[name: string]: ConsentChannel;
	}

	export interface ConsentCategories {
		[name: string]: Array<ConsentCategory>;
	}

	export interface ConsentUnit {
		version?: number;
		lastModified?: string;
		data: ConsentChannel;
	}

	export interface ConsentRecord {
		version?: number;
		lastModified?: string;
		data: ConsentCategories;
	}
}

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
			`/${this.scope}/${category}/${channel}`,
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
		const { version } = await this.getConsent(category, channel);
		const createdConsent = (await this.post(
			`/${this.scope}/${category}/${channel}`,
			'Could not update consent',
			{	
				body: JSON.stringify({ version, data: consent })
			}
		)) as ConsentAPI.ConsentUnit;

		return createdConsent;
	}

	public async updateConsents(
		category: string,
		channel: string,
		consents: ConsentAPI.ConsentChannel
	): Promise<ConsentAPI.ConsentUnit> {
		const { version } = await this.getConsent(category, channel);
		const createdConsents = (await this.post(
			`/${this.scope}/${category}/${channel}`,
			'Could not update consent',
			{	
				body: JSON.stringify({ version, data: consents })
			}
		)) as ConsentAPI.ConsentUnit;

		return createdConsents;
	}
}
