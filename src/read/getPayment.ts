import * as R from 'ramda';

import { canned } from '@financial-times/n-memb-gql-client';

import { logger } from '../utils/logger';
import { ErrorWithData, errorTypes } from '../utils/error';
import { GraphQlUserApiResponse } from '../types';

import { getActivePaymentMethod } from './transforms';

export const getPaymentDetailsBySessoin = async (
	session: string
): Promise<Object|null> => {
	const defaultErrorMessage = 'Unable to retrieve payment details';
	const graphQlQuery = 'mma-payment-by-session';
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
		const activePaymentMethod = getActivePaymentMethod(user);
		return activePaymentMethod;
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