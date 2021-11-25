export class ErrorWithData extends Error {
	constructor(message: string, public data?: any) {
		super(message);
		Object.setPrototypeOf(this, ErrorWithData.prototype);
		(Error as any).captureStackTrace(this, this.constructor);
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

// type predicate for ErrorWithData
export function isErrorWithData(error: any): error is ErrorWithData {
	return error.message !== undefined;
}
