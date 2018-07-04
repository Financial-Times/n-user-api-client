import { canned } from '@financial-times/n-memb-gql-client';
import { logger } from '../utils/logger';
import { GraphQlUserApiResponse } from '../types';
import * as R from 'ramda';
import { readTransforms } from './transforms';
import { ErrorWithData, errorTypes } from '../utils/error';
import { getSessionData } from './apis/session-service';
import { validateOptions } from '../utils/validate';

export const getUserBySession = async (
	session: string,
	testMode?: boolean
): Promise<GraphQlUserApiResponse> => {
	const defaultErrorMessage = 'Unable to retrieve user';
	const graphQlQuery = 'mma-user-by-session';
	try {
		if (!session) {
			throw new ErrorWithData('Session not supplied', {
				statusCode: 500,
				type: errorTypes.VALIDATION
			});
		}
		const res = await canned(graphQlQuery, { session }, { timeout: 10000, testMode });
		const user = R.path(['data', 'user'], res);
		if (!res._ok || !user) {
			throw new ErrorWithData(defaultErrorMessage, {
				statusCode: res.status,
				type: errorTypes.API,
				errors: res.errors
			});
		}
		const transformed = readTransforms(user);
		return transformed;
	} catch (error) {
		const errorMsg = error.data ? error.message : defaultErrorMessage;

		const e = new ErrorWithData(errorMsg, {
			api: 'MEMBERSHIP_GRAPHQL',
			query: graphQlQuery,
			error
		});
		logger.error(e);
		throw e;
	}
};

export const getUserIdAndSessionData = async (
	opts,
	requestOptions = {}
): Promise<any> => {
	validateOptions(opts, null, ['session', 'apiHost', 'apiKey']);
	return await getSessionData(opts, requestOptions);
};
