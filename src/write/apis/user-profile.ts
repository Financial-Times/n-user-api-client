import ('isomorphic-fetch');

import { ErrorWithData } from '../../utils/error';

export const updateUserProfileApi = ({
	userId,
	userUpdate,
	authToken,
	apiHost,
	apiKey,
	appName
}) => {
	return new Promise(async (resolve, reject) => {
		const url = `${apiHost}/idm/v1/users/${userId}`;
		const errorMsg = 'Could not update user';
		const options = {
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': apiKey,
				Authorization: `Bearer ${authToken}`,
				'User-Agent': `n-user-api-client-${appName}`
			},
			method: 'PUT',
			body: JSON.stringify(userUpdate)
		};
		try {
			const response = await fetch(url, options);
			if (response.ok) return resolve(response.json());
			reject(
				new ErrorWithData(errorMsg, {
					url
				})
			);
		} catch (err) {
			reject(
				new ErrorWithData(errorMsg, {
					url
				})
			);
		}
	});
};
