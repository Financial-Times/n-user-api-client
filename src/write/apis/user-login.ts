import 'isomorphic-fetch';

import { apiErrorType, ErrorWithData } from '../../utils/error';
import { logger } from '../../utils/logger';

export const userLoginApi = async ({ email, password, remoteIp, countryCode, userAgent, apiHost, apiKey, appName }) => {
	const errorMsg = 'Could not log user in';
	const url = `${apiHost}/idm/v1/reauthenticate`;
	try {
		if (!password) {
			throw new Error('password not supplied to userLoginApi');
		}
		const body = {
			email,
			password,
			rememberMe: true,
			context: {
				'remoteIp': remoteIp,
				'countryCode': countryCode,
				'userAgent': userAgent,
				'platform': 'n-user-api-client'
			}
		};
		const options = {
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': apiKey,
				'User-Agent': appName
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
