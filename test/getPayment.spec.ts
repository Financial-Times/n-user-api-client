import * as sinon from 'sinon';
import { expect } from 'chai';
import { getPaymentDetailsBySessoin } from '../src/read/getPayment';
import { graphQlPaymentBySession } from './nocks';

describe('getPayment', () => {
	const session = 'mock-session-id';
	let responseType;

	let sandbox;
	let fetchSpy;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
		fetchSpy = sandbox.spy(global, 'fetch');
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('getPaymentDetailsBySessoin', () => {
		it('resolves with a transformed user object when successful', async () => {
			graphQlPaymentBySession({ responseType: 'subscribed' });
			const paymentDetails = await getPaymentDetailsBySessoin(session);
			expect(paymentDetails.type).to.equal('Visa');
		});

		it('resolves with null when successful but user has a null billingAccount', async () => {
			graphQlPaymentBySession({ responseType: 'unsubscribed' });
			const paymentDetails = await getPaymentDetailsBySessoin(session);
			expect(paymentDetails).to.be.null;
		});

		it('handles exception thrown within canned query', async () => {
			graphQlPaymentBySession({ responseType, statusCode: 500 });
			return getPaymentDetailsBySessoin(session)
				.catch(err =>
					expect(err.message).to.equal('Unable to retrieve payment details'));
		});

		it('throws if no session supplied', done => {
			getPaymentDetailsBySessoin(undefined)
				.catch(err => {
					expect(err.message).to.equal('Session not supplied');
					done();
				});
		});
	});
});
