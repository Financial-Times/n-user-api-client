import { ObjectSchema, object, bool, string, validate } from 'joi';
import { ErrorWithData } from '../../utils/error';

const validationOptions = {
	abortEarly: true,
	stripUnknown: true
};

export const consent: ObjectSchema = object().keys({
	status: bool().required(),
	lbi: bool().default(false),
	fow: string().min(3).required(),
	source: string().min(3)
});

export const category: ObjectSchema = object().pattern(/\w+/, consent);

export const record: ObjectSchema = object().pattern(/\w+/, category);

export function validateObject(object: any, schema: ObjectSchema): any {
	const { error, value } = validate(object, schema, validationOptions);

	if (error) {
		console.log(error.details);
		throw new ErrorWithData('Invalid request body', {
			api: 'CONSENT_API',
			action: 'REQUEST_BODY_VALIDATION',
			error: error.details
		});
	}

	return value;
}
