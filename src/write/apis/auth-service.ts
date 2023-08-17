import 'isomorphic-fetch';
import * as url from 'url';
import * as querystring from 'querystring';

import { isErrorWithData, ErrorWithData } from '../../utils/error';
import { logger } from '../../utils/logger';

const parseLocationHeader = (res): any => {
	const locationHeader = res.headers.get('location');
	if (!locationHeader) {
		return null;
	}
	const { hash } = url.parse(locationHeader);
	return hash ? querystring.parse(hash.replace(/^#/, '')) : null;
};

const parseErrorFromLocationHeader = (locationHeaderParams): Error | null => {
	if (!locationHeaderParams) {
		return new ErrorWithData('Auth service - Location header missing', {
			type: 'LOCATION_HEADER_MISSING'
		});
	}

	if (locationHeaderParams.error) {
		let errorType;
		if (locationHeaderParams.error_description.startsWith('Missing')) {
			errorType = 'MISSING_SESSION_TOKEN';
		} else if (locationHeaderParams.error_description.startsWith('Invalid')) {
			errorType = 'INVALID_SESSION_TOKEN';
		} else if (locationHeaderParams.error === 'invalid_scope') {
			errorType = 'INVALID_SCOPE';
		} else {
			errorType = 'OTHER';
		}
		return new ErrorWithData(
			`Auth service - ${locationHeaderParams.error}: ${locationHeaderParams.error_description}`,
			{
				type: errorType,
				error: locationHeaderParams.error,
				description: locationHeaderParams.error_description
			}
		);
	}

	if (!locationHeaderParams.access_token) {
		return new ErrorWithData(
			'Auth service - No access_token in Location header',
			{ type: 'NO_ACCESS_TOKEN' }
		);
	}

	return null;
};

const checkResponseCode = (
	{ status: statusCode },
	apiClientId: string
): Error | null => {
	if (statusCode === 400) {
		return new ErrorWithData('Auth service - Invalid client ID', {
			statusCode,
			type: 'INVALID_CLIENT_ID',
			clientId: apiClientId
		});
	}
	if (statusCode !== 302) {
		return new ErrorWithData('Auth service - Bad response', {
			statusCode,
			type: 'UNEXPECTED_RESPONSE'
		});
	}
	return null;
};

const getFetchOptions = (session: string): RequestInit => ({
	headers: {
		Cookie: `FTSession_s=${session}`
	},
	method: 'GET',
	redirect: 'manual'
});

export const getAuthToken = async ({
	session,
	apiHost,
	apiClientId
}): Promise<any> => {
	const params = {
		response_type: 'token',
		client_id: apiClientId,
		scope: 'profile_max'
	};

	const url = `${apiHost}/authorize?${querystring.stringify(params)}`;

	try {
		const res = await fetch(url, getFetchOptions(session));

		const responseCodeError = checkResponseCode(res, apiClientId);
		if (responseCodeError) throw responseCodeError;

		const locationHeaderParams = parseLocationHeader(res);
		const locationHeaderError =
			parseErrorFromLocationHeader(locationHeaderParams);
		if (locationHeaderError) throw locationHeaderError;

		return locationHeaderParams.access_token;
	} catch (error) {
		if (!isErrorWithData(error)) {
			throw error;
		}

		const e = new ErrorWithData(`getAuthToken - ${error.message}`, {
			url,
			error
		});
		logger.error(e);
		throw e;
	}
};
