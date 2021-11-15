import * as R from 'ramda';

import { canned } from '@financial-times/n-memb-gql-client';

import { logger } from '../utils/logger';
import { isErrorWithData, ErrorWithData, errorTypes } from '../utils/error';

const paymentProps = ['subscriber', 'billingAccount', 'paymentMethod'];
interface PaymentMethod {
	type: string;
	subscriber: boolean;
	billingAccount: string;
	paymentMethod: string;
	creditCard: {
		type: string;
	};
}

export const getPaymentDetailsBySession = async (
	session?: string,
	option?: object
): Promise<PaymentMethod | null> => {
	const defaultErrorMessage = 'Unable to retrieve payment details';
	const graphQlQuery = 'mma-payment-by-session';
	try {
		if (!session) {
			throw new ErrorWithData('Session not supplied', {
				statusCode: 500,
				type: errorTypes.VALIDATION,
			});
		}
		const res = await canned(
			graphQlQuery,
			{ session },
			{ ...option, timeout: 10000 }
		);
		const user = R.path(['data', 'user'], res);
		if (!res._ok || !user) {
			throw new ErrorWithData(defaultErrorMessage, {
				statusCode: res.status,
				type: errorTypes.API,
				errors: res.errors,
			});
		}

		const paymentMethod = R.path(paymentProps, user) as PaymentMethod;
		return paymentMethod ? paymentMethod : null;
	} catch (error) {
		if (!isErrorWithData(error)) {
			throw error;
		}

		const errorMsg = error.data ? error.message : defaultErrorMessage;

		const e = new ErrorWithData(errorMsg, {
			api: 'MEMBERSHIP_GRAPHQL',
			query: graphQlQuery,
			error,
		});
		logger.error(e);
		throw e;
	}
};
