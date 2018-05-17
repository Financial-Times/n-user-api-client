import 'isomorphic-fetch';
import { Agent } from 'https';
import { apiErrorType, ErrorWithData } from '../../utils/error';
import { isSessionStale } from '../transforms/session-freshness';

const agent = new Agent({ keepAlive: true });

export const getSessionData = async (
	{ session, apiHost, apiKey },
	requestOptions = {}
) => {
	const url = `${apiHost}/sessions/s/${session}`;
	const errorMsg = 'Could not get session data';
	const options = Object.assign({
		timeout: 3000,
		headers: {
			'Content-Type': 'application/json',
			'X-Api-Key': apiKey
		},
		method: 'GET',
		agent
	}, requestOptions);

	const response = await fetch(url, options);
	if (response.ok) {
		const body = await response.json();
		if (!body.uuid) {
			throw new ErrorWithData('Valid user ID not returned', {
				type: apiErrorType(500)
			});
		}
		return {
			userId: body.uuid,
			isSessionStale: isSessionStale(body.creationTime)
		};
	}
	throw new ErrorWithData(errorMsg, {
		url,
		statusCode: response.status,
		type: apiErrorType(response.status)
	});
};
