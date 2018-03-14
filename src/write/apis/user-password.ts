import { ErrorWithData } from '../../utils/error';

export const updateUserPasswordApi = ({
	userId,
	passwordData,
	authToken,
	apiHost,
	apiKey
}) => {
	return new Promise(async (resolve, reject) => {
		const errorMsg = 'Could not change user password';
		const url = `${apiHost}/users/${userId}/credentials/change-password`;
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
				Authorization: `Bearer ${authToken}`
			},
			method: 'POST',
			body: JSON.stringify(body)
		} as RequestInit;
		try {
			const response = await fetch(url, options);
			if (response.ok) return resolve(passwordData.newPassword);
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
