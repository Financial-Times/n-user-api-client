import { ErrorWithData, errorTypes } from '../../utils/error';

export const isSessionStale = sessionCreationTime => {
	const now = Date.now();
	if (
		typeof sessionCreationTime !== 'number' ||
		sessionCreationTime > now ||
		sessionCreationTime < 0
	)
		throw new ErrorWithData(
			'isSessionFresh not supplied with valid session creation timestamp',
			{ type: errorTypes.VALIDATION }
		);
	const sessionAgeMs = now - sessionCreationTime;
	return sessionAgeMs > 1000 * 60 * 30; // half an hour
};
