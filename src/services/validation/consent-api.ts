import { ObjectSchema, object, bool, string, validate } from 'joi';
import { ErrorWithData } from '../../utils/error';

const validationOptions = {
	abortEarly: true,
	stripUnknown: true,
	presence: 'required'
};

export const consent: ObjectSchema = object().keys({
	status: bool(),
	lbi: bool().default(false),
	fow: string().min(3),
	source: string().min(3)
});

export const category: ObjectSchema = object().pattern(/\w+/, consent);

export const record: ObjectSchema = object().pattern(/\w+/, category);

export function validateObject(object: any, schema: ObjectSchema): any {
	const { error, value } = validate(object, schema, validationOptions);

	if (error) {
		throw new ErrorWithData('Invalid request body', {
			api: 'CONSENT_API',
			action: 'REQUEST_BODY_VALIDATION',
			error
		});
	}

	return value;
}
