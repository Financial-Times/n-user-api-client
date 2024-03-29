import 'isomorphic-fetch';

import {
	isErrorWithData,
	apiErrorType,
	ErrorWithData
} from '../../utils/error';
import { logger } from '../../utils/logger';

export const updateUserPasswordApi = async ({
	userId,
	passwordData,
	authToken,
	apiHost,
	apiKey,
	appName
}) => {
	const errorMsg = 'Could not change user password';
	const url = `${apiHost}/idm/v1/users/${userId}/credentials/change-password`;
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
			Authorization: `Bearer ${authToken}`,
			'User-Agent': appName
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
		if (!isErrorWithData(error)) {
			throw error;
		}

		const statusCode = error.data ? error.data.statusCode : 500;
		const e = new ErrorWithData(errorMsg, {
			url,
			error
		});
		logger.error(e);
		throw e;
	}
};
