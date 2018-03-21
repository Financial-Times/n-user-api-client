require('isomorphic-fetch');

import { ErrorWithData } from '../../utils/error';

export const updateUserProfileApi = ({
	userId,
	userUpdate,
	authToken,
	apiHost,
	apiKey
}) => {
	return new Promise(async (resolve, reject) => {
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
