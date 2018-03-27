import { canned } from '@financial-times/n-memb-gql-client';
import { logger } from '../utils/logger';
import { GraphQlUserApiResponse } from '../types';
import * as R from 'ramda';
import { readTransforms } from './transforms';
import { ErrorWithData, errorTypes } from '../utils/error';
import { getSessionData } from './apis/session-service';
import { validateOptions } from '../utils/validate';

export const getUserBySession = async (session: string): Promise<GraphQlUserApiResponse> => {
	const defaultErrorMessage = 'Unable to retrieve user';
	const graphQlQuery = 'mma-user-by-session';
	try {
		if (!session) {
			throw new ErrorWithData('Session not supplied', {
				statusCode: 500,
				type: errorTypes.VALIDATION
			});
		}
		const res = await canned(graphQlQuery, { session }, { timeout: 10000 });
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
		const errorMsg = error.data
			? error.message
			: defaultErrorMessage;

		throw new ErrorWithData(errorMsg, error.data || {
			statusCode: 500,
			type: errorTypes.API
		});
	}
};

export const getUserIdAndSessionData = async (opts): Promise<any> => {
	validateOptions(opts, null, ['session', 'apiHost', 'apiKey']);
	return await getSessionData(opts);
};
