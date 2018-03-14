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
	API: 'API',
	API_KEY: 'API_KEY'
};
