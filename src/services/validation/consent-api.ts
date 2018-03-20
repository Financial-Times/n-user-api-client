import * as Joi from 'joi';
import { ErrorWithData } from '../../utils/error';

const validationOptions = {
	abortEarly: true,
	stripUnknown: true,
    presence: 'required'
};

export const consent: Joi.ObjectSchema = Joi.object().keys({
	status: Joi.bool(),
	lbi: Joi.bool().default(false),
	fow: Joi.string().min(3),
	source: Joi.string().min(3)
});

export const category: Joi.ObjectSchema = Joi.object().pattern(/\w+/, consent);

export const record: Joi.ObjectSchema = Joi.object().pattern(/\w+/, category);

export function validate(object: any, schema: Joi.schema): any {
	const { error, value } = Joi.validate(object, schema, validationOptions);

	if (error) {
		throw new ErrorWithData('Invalid request body', {
			api: 'CONSENT_API',
			action: 'REQUEST_BODY_VALIDATION',
			error
		});
	}

	return value;
}
