import { ConsentAPI } from '../../types/consent-api';

import { errorTypes, ErrorWithData } from '../../utils/error';

const validationError = new ErrorWithData('Payload validation error', {
	api: 'CONSENT_API',
	action: 'REQUEST_BODY_VALIDATION',
	statusCode: 400,
	type: errorTypes.VALIDATION
});

function parseBoolean(value: any): boolean {
	return typeof value === 'string' ? value === 'true' : value === true || false;
}

export function validateConsent(
	consent: ConsentAPI.ConsentChannel,
	source: string
): ConsentAPI.ConsentChannel {
	if (consent.status === undefined || typeof consent.fow !== 'string') {
		throw validationError;
	}

	return {
		source: consent.source || source,
		lbi: parseBoolean(consent.lbi),
		status: parseBoolean(consent.status),
		fow: consent.fow
	};
}
