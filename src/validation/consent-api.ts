import * as Joi from 'joi';
import { ConsentAPI } from '../types/consent-api';
import { consentSchema, consentRecordSchema } from './schema';

import { errorTypes, ErrorWithData } from '../utils/error';

const validationError = (error: Joi.ValidationError) =>
	new ErrorWithData('Payload validation error', {
		api: 'CONSENT_API',
		action: 'REQUEST_BODY_VALIDATION',
		statusCode: 400,
		error: error.details,
		type: errorTypes.VALIDATION
	});

const joiOptions = {
	stripUnknown: true
};

export function validateConsent(
	consent: ConsentAPI.ConsentChannel,
	source: string
): ConsentAPI.ConsentChannel {
	consent.source = consent.source || source;
	const { error, value } = Joi.validate(consent, consentSchema, joiOptions);

	if (error) {
		throw validationError(error);
	}

	return value;
}

export function validateConsentRecord(
	consentRecord: ConsentAPI.ConsentCategories
): ConsentAPI.ConsentCategories {
	const { error, value } = Joi.validate(
		consentRecord,
		consentRecordSchema,
		joiOptions
	);

	if (error) {
		throw validationError(error);
	}

	return value;
}

interface DestructuredConsent {
	category: string;
	channel: string;
	consent: ConsentAPI.ConsentChannel;
}

export function destructureConsentFromRecord(
	consentRecord: ConsentAPI.ConsentCategories
) {
	const category = Object.keys(consentRecord)[0];
	const channel = Object.keys(consentRecord[category])[0];
	const consent = consentRecord[category][channel];
	return { category, channel, consent };
}

export const ConsentValidator = { consentSchema, consentRecordSchema };
