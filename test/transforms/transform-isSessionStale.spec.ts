import { expect } from 'chai';
import { isSessionStale } from '../../src/read/transforms/session-freshness';
import { ErrorWithData } from '../../src/utils/error';

describe('isSessionStale', () => {
	const invalidMessage = 'isSessionFresh not supplied with valid session creation timestamp';

	it('throws if not passed a session creation time', () => {
		expect(isSessionStale).to.throw(ErrorWithData, invalidMessage);
	});

	it('throws if passed a session creation time in the future', () => {
		expect(isSessionStale.bind(this, Date.now() + 1000)).to.throw(ErrorWithData, invalidMessage);
	});

	it('returns false if passed a session creation time in the last half hour', () => {
		const result = isSessionStale(Date.now() - (1000 * 60 * 29));
		expect(result).to.equal(false);
	});

	it('returns true if passed a session creation time older than half an hour', () => {
		const result = isSessionStale(Date.now() - (1000 * 60 * 31));
		expect(result).to.equal(true);
	});
});