import 'isomorphic-fetch';

import { apiErrorType, ErrorWithData } from '../../utils/error';
import { logger } from '../../utils/logger';

export const userLoginApi = async ({
	email,
	password,
	apiHost,
	apiKey,
	appName,
	requestContext: {
		remoteIp,
		browserUserAgent: userAgent,
		countryCode
	}
}) => {
	const errorMsg = 'Could not log user in';
	const url = `${apiHost}/idm/v1/reauthenticate`;
	const platform = `n-user-api-client-${appName}`;
	try {
		if (!password) {
			throw new Error('password not supplied to userLoginApi');
		}
		const body = {
			email,
			password,
			rememberMe: true,
			context: {
				remoteIp,
				userAgent,
				countryCode,
				platform
			}
		};
		const options = {
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': apiKey,
				'User-Agent': platform
			},
			method: 'POST',
			body: JSON.stringify(body)
		} as RequestInit;

		const response = await fetch(url, options);
		if (response.ok) {
			return await response.json();
		}
		throw new ErrorWithData(errorMsg, {
			statusCode: response.status,
			type: apiErrorType(response.status)
		});
	} catch (error) {
		const e = new ErrorWithData(errorMsg, {
			url,
			error
		});
		logger.error(e);
		throw e;
	}
};
