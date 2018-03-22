import 'isomorphic-fetch';
import { errorTypes, ErrorWithData } from '../../utils/error';
import { isSessionStale } from '../transforms/session-freshness';

export const getSessionData = ({ session, apiHost, apiKey }) => {
	return new Promise(async (resolve, reject) => {
		const url = `${apiHost}/sessions/s/${session}`;
		const errorMsg = 'Could not get session data';
		const options = {
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': apiKey
			},
			method: 'GET'
		};
		try {
			const response = await fetch(url, options);
			if (response.ok) {
				const body = await response.json();
				if (!body.uuid)
					throw new ErrorWithData('Valid user ID not returned', {
						type: errorTypes.API
					});
				const sessionData = {
					userId: body.uuid,
					isSessionStale: isSessionStale(body.creationTime)
				};
				return resolve(sessionData);
			}
			reject(
				new ErrorWithData(errorMsg, {
					url,
					statusCode: response.status,
					type: response.status === 403 ? errorTypes.API_KEY : errorTypes.API
				})
			);
		} catch (err) {
			reject(err);
		}
	});
};
