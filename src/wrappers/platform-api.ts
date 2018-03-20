require('isomorphic-fetch');
import { mergeDeepRight } from 'ramda';
import { APIMode } from './helpers/api-mode';

import { ErrorWithData } from '../utils/error';

export class PlatformAPI {
	protected url: string;

	constructor(
		protected commonPath: string,
		protected mode: APIMode = APIMode.Production,
		protected options: RequestInit = {}
	) {
		this.options = mergeDeepRight(
			{
				timeout: 5000,
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': this.apiKey
				}
			},
			this.options
		);
		this.url = `${this.apiHost}${this.commonPath}`;
	}

	private get apiHost(): string {
		return process.env[`MEMBERSHIP_API_HOST_${this.mode}`];
	}

	private get apiKey(): string {
		return process.env[`MEMBERSHIP_API_KEY_${this.mode}`];
	}

	protected async _fetch(
		path: string,
		options: RequestInit,
		errorMsg: string
	): Promise<any> {
		try {
			return await fetch(`${this.url}${path}`, options);
		} catch (error) {
			throw new ErrorWithData(errorMsg, {
				api: 'MEMBERSHIP_PLATFORM',
				url: this.url,
				error
			});
		}
	}

	public async get(
		path: string,
		errorMsg: string,
		options?: RequestInit
	): Promise<any> {
		options = options ? mergeDeepRight(this.options, options) : this.options;
		options.method = 'GET';
		return await this._fetch(path, options, errorMsg);
	}

	public async put(
		path: string,
		errorMsg: string,
		options?: RequestInit
	): Promise<any> {
		options = options ? mergeDeepRight(this.options, options) : this.options;
		options.method = 'PUT';
		return await this._fetch(path, options, errorMsg);
	}

	public async post(
		path: string,
		errorMsg: string,
		options?: RequestInit
	): Promise<any> {
		options = options ? mergeDeepRight(this.options, options) : this.options;
		options.method = 'POST';
		return await this._fetch(path, options, errorMsg);
	}
}
