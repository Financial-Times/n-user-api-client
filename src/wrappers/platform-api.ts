import 'isomorphic-fetch';
import { mergeDeepRight } from 'ramda';
import { APIMode } from './helpers/api-mode';

import { apiErrorType, ErrorWithData } from '../utils/error';
import { logger } from '../utils/logger';

export class PlatformAPI {
	protected url: string;

	constructor(
		protected commonPath: string,
		protected mode: any = APIMode.Production,
		protected options: RequestInit = {},
		protected envPrefix: string = 'MEMBERSHIP_API'
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

	private static guardEnvironmentVariable(name: string) {
		if (process.env[name]) {
			return process.env[name];
		}
		throw new ErrorWithData('Missing environment variable', {
			api: 'MEMBERSHIP_PLATFORM',
			environment: process.env.NODE_ENV,
			variable: name
		});
	}

	private get apiHost(): string | undefined {
		return PlatformAPI.guardEnvironmentVariable(
			`${this.envPrefix}_HOST_${this.mode}`
		);
	}

	private get apiKey(): string | undefined {
		return PlatformAPI.guardEnvironmentVariable(
			`${this.envPrefix}_KEY_${this.mode}`
		);
	}

	protected async _fetch(
		path: string,
		options: RequestInit,
		errorMsg: string
	): Promise<any> {
		let statusCode = 500;

		try {
			const response = await fetch(`${this.url}${path}`, options);
			if (!response.ok) {
				statusCode = response.status;
				throw new ErrorWithData('API: Bad response', {
					statusCode,
					type: apiErrorType(statusCode)
				});
			}
			return response;
		} catch (error) {
			const e = new ErrorWithData(errorMsg, {
				api: 'MEMBERSHIP_PLATFORM',
				url: this.url,
				error
			});
			logger.error(e);
			throw(e);
		}
	}

	public async request(
		method: string,
		path: string,
		errorMsg: string,
		options?: RequestInit
	): Promise<any> {
		options = options ? mergeDeepRight(this.options, options) : this.options;
		options.method = method;
		return await this._fetch(path, options, errorMsg);
	}
}
