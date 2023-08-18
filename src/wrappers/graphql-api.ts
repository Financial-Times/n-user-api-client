import * as membQl from '@financial-times/n-memb-gql-client';
import { APIMode } from './helpers/api-mode';

import { ErrorWithData, apiErrorType } from '../utils/error';
import { logger } from '../utils/logger';

export enum GraphQlAPIQuery {
	Canned = 'canned',
	Custom = 'query'
}

interface MembQlOptions {
	testMode: boolean;
	mockMode: boolean;
}

export class GraphQlAPI {
	protected options: MembQlOptions;

	constructor(protected mode: APIMode = APIMode.Production) {
		this.options = {
			testMode: mode === APIMode.Test,
			mockMode: mode === APIMode.Mock
		};
	}

	protected async _fetch(
		queryMode: GraphQlAPIQuery,
		query: string,
		variables: any,
		errorMsg: string
	): Promise<any> {
		try {
			const res = await membQl[queryMode](query, variables, this.options);
			if (!res._ok) {
				// valid response but contains errors
				throw new ErrorWithData(errorMsg, {
					statusCode: res.status,
					type: apiErrorType(res.status),
					errors: res.errors
				});
			}
			return res.data;
		} catch (error) {
			const e = new ErrorWithData(errorMsg, {
				api: 'MEMBERSHIP_GRAPHQL',
				query,
				error
			});
			logger.error(e);
			throw e;
		}
	}

	public cannedQuery(
		query: string,
		variables: any,
		errorMsg: string
	): Promise<any> {
		return this._fetch(GraphQlAPIQuery.Canned, query, variables, errorMsg);
	}

	public customQuery(
		query: string,
		variables: any,
		errorMsg: string
	): Promise<any> {
		return this._fetch(GraphQlAPIQuery.Custom, query, variables, errorMsg);
	}
}
