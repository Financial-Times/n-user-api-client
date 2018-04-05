import * as Joi from 'joi';
import { ConsentAPI } from '../../types/consent-api';
import { consentSchema, consentRecordSchema } from './schema';

import { errorTypes, ErrorWithData } from '../../utils/error';

const validationError = new ErrorWithData('Payload validation error', {
	api: 'CONSENT_API',
	action: 'REQUEST_BODY_VALIDATION',
	statusCode: 400,
	type: errorTypes.VALIDATION
});

export function validateConsent(
	consent: ConsentAPI.ConsentChannel,
	source: string
): ConsentAPI.ConsentChannel {
	consent.source = consent.source || source;
	const { error, value } = Joi.validate(consent, consentSchema);

	if (error) {
		throw validationError;
	}

	return value;
}

export function validateConsentRecord(
	consentRecord: ConsentAPI.ConsentCategories
): ConsentAPI.ConsentCategories {
	const { error, value } = Joi.validate(consentRecord, consentRecordSchema);

	if (error) {
		throw validationError;
	}

	return value;
}
