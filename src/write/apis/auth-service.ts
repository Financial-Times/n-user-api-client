require('isomorphic-fetch');
import * as url from 'url';
import * as querystring from 'querystring';
import { ErrorWithData } from '../../utils/error';
import { logger } from '../../utils/logger';

const parseLocationHeader = res => {
	const locationHeader = res.headers.get('location');
	if (!locationHeader) return null;
	const hash = url.parse(locationHeader).hash.replace(/^#/, '');
	return querystring.parse(hash);
};

const parseErrorFromLocationHeader = locationHeaderParams => {
	if (locationHeaderParams.error) {
		let errorType;
		if (locationHeaderParams.error_description.startsWith('Missing ')) {
			errorType = 'MISSING_SESSION_TOKEN';
		} else if (locationHeaderParams.error_description.startsWith('Invalid')) {
			errorType = 'INVALID_SESSION_TOKEN';
		} else if (locationHeaderParams.error === 'invalid_scope') {
			errorType = 'INVALID_SCOPE';
		} else {
			errorType = 'OTHER';
		}
		return new ErrorWithData(
			`Auth service - ${locationHeaderParams.error}: ${
				locationHeaderParams.error_description
			}`,
			{
				type: errorType,
				error: locationHeaderParams.error,
				description: locationHeaderParams.error_description
			}
		);
	}

	if (!locationHeaderParams.access_token)
		return new ErrorWithData(
			'Auth service - No access_token in Location header',
			{ type: 'NO_ACCESS_TOKEN' }
		);
	return null;
};

const checkResponseCode = ({ res, apiClientId }) => {
	if (res.status === 400)
		return new ErrorWithData('Auth service - invalid client ID', {
			type: 'INVALID_CLIENT_ID',
			clientId: apiClientId
		});
	if (res.status !== 302)
		return new ErrorWithData(
			`Auth service - Bad response status=${res.status}`,
			{ type: 'UNEXPECTED_RESPONSE' }
		);
	return null;
};

const handleError = (reject, err) => {
	logger.error(err);
	return reject(err);
};

const getFetchOptions = (session: string): RequestInit => ({
	headers: {
		Cookie: `FTSession_s=${session}`
	},
	method: 'GET',
	redirect: 'manual'
});

export const getAuthToken = ({ session, apiHost, apiClientId }) => {
	return new Promise(async (resolve, reject) => {
		try {
			const params = {
				response_type: 'token',
				client_id: apiClientId,
				scope: 'profile_max'
			};

			const url = `${apiHost}/authorize?${querystring.stringify(params)}`;

			const res = await fetch(url, getFetchOptions(session));

			const responseCodeError = checkResponseCode({ res, apiClientId });
			if (responseCodeError) return handleError(reject, responseCodeError);

			const locationHeaderParams = parseLocationHeader(res);
			if (!locationHeaderParams)
				return handleError(
					reject,
					new ErrorWithData('Location header missing', {
						type: 'LOCATION_HEADER_MISSING'
					})
				);

			const locationHeaderError = parseErrorFromLocationHeader(
				locationHeaderParams
			);
			if (locationHeaderError) return handleError(reject, locationHeaderError);

			resolve(locationHeaderParams.access_token);
		} catch (err) {
			return handleError(
				reject,
				new ErrorWithData(`getAuthToken - ${err.message}`, {
					url
				})
			);
		}
	});
};
