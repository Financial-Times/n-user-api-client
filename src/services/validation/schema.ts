import * as Joi from 'joi';

const alphaNumRx = /^\w+/;

export const consentSchema: Joi.ObjectSchema = Joi.object().keys({
	lbi: Joi.boolean().required(),
	status: Joi.boolean().required(),
	source: Joi.string()
		.alphanum()
		.required(),
	fow: Joi.string()
		.alphanum()
		.required()
});

const consentCategorySchema: Joi.ObjectSchema = Joi.object().pattern(
	alphaNumRx,
	consentSchema
);

export const consentRecordSchema: Joi.ObjectSchema = Joi.object().pattern(
	alphaNumRx,
	consentCategorySchema
);
