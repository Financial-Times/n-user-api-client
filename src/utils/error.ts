export class ErrorWithData extends Error {
	message: string;
	data: any;

	constructor(message, data?) {
		super(message);
		Object.setPrototypeOf(this, ErrorWithData.prototype);
		(Error as any).captureStackTrace(this, this.constructor);
		if (data) this.data = data;
		this.name = this.constructor.name;
	}
}

export const errorTypes = {
	VALIDATION: 'VALIDATION',
	TRANSFORM: 'TRANSFORM',
	NOT_FOUND: 'NOT_FOUND',
	CONFLICT: 'CONFLICT',
	API: 'API',
	API_KEY: 'API_KEY'
};

export function apiErrorType(statusCode: number) {
	return (
		{
			400: errorTypes.VALIDATION,
			403: errorTypes.API_KEY,
			404: errorTypes.NOT_FOUND,
			409: errorTypes.CONFLICT
		}[statusCode] || errorTypes.API
	);
}
