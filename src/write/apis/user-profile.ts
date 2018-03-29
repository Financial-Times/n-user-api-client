import 'isomorphic-fetch';

import { apiErrorType, ErrorWithData } from '../../utils/error';
import { logger } from '../../utils/logger';

export const updateUserProfileApi = async ({
	userId,
	userUpdate,
	authToken,
	apiHost,
	apiKey,
	appName
}) => {
	const url = `${apiHost}/idm/v1/users/${userId}/profile`;
	const platform = `n-user-api-client-${appName}`;
	const errorMsg = 'Could not update user';
	const options = {
		timeout: 10000,
		headers: {
			'Content-Type': 'application/json',
			'X-Api-Key': apiKey,
			'Authorization': `Bearer ${authToken}`,
			'User-Agent': platform
		},
		method: 'PUT',
		body: JSON.stringify(userUpdate)
	};

	try {
		const response = await fetch(url, options);
		if (response.ok) {
			return await response.json();
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
