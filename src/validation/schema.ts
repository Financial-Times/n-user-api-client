import * as Joi from 'joi';

const alphaNumRx = /^\w+/;

export const consentSchema: Joi.ObjectSchema = Joi.object().keys({
	lbi: Joi.boolean().default(false),
	status: Joi.boolean().required(),
	source: Joi.string().required(),
	fow: Joi.string().required()
});

const consentCategorySchema: Joi.ObjectSchema = Joi.object().pattern(
	alphaNumRx,
	consentSchema
);

export const consentRecordSchema: Joi.ObjectSchema = Joi.object().pattern(
	alphaNumRx,
	consentCategorySchema
);
