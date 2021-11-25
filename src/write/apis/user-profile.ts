import 'isomorphic-fetch';

import { isErrorWithData, apiErrorType, ErrorWithData } from '../../utils/error';
import { logger } from '../../utils/logger';

export const updateUserProfileApi = async ({
	userId,
	userUpdate,
	authToken,
	apiHost,
	apiKey
}) => {
	const url = `${apiHost}/users/${userId}/profile`;
	const errorMsg = 'Could not update user';
	const options = {
		timeout: 10000,
		headers: {
			'Content-Type': 'application/json',
			'X-Api-Key': apiKey,
			Authorization: `Bearer ${authToken}`
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
