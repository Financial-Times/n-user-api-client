import 'isomorphic-fetch';

import { apiErrorType, ErrorWithData } from '../../utils/error';
import { logger } from '../../utils/logger';

export const updateUserPasswordApi = async ({
	userId,
	passwordData,
	apiHost,
	apiKey,
	appName
}) => {
	const errorMsg = 'Could not change user password';
	const url = `${apiHost}/idm/v1/users/${userId}/credentials/change-password`;
	const platform = `n-user-api-client-${appName}`;
	const body = {
		password: passwordData.newPassword,
		oldPassword: passwordData.oldPassword,
		reasonForChange: 'owner-requested'
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

	try {
		const response = await fetch(url, options);
		if (response.ok) {
			return passwordData.newPassword;
		}
		throw new ErrorWithData(errorMsg, {
			statusCode: response.status,
			type: apiErrorType(response.status)
		});
	} catch (error) {
		const statusCode = error.data ? error.data.statusCode : 500;
		const e = new ErrorWithData(errorMsg, {
			url,
			error
		});
		logger.error(e);
		throw e;
	}
};
