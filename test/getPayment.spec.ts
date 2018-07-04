import * as sinon from 'sinon';
import { expect } from 'chai';
import { getPaymentDetailsBySession } from '../src/read/getPayment';
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

	describe('getPaymentDetailsBySession', () => {
		it('resolves with a paymentMethod object when successful', async () => {
			graphQlPaymentBySession({ responseType: 'subscribed' });
			const paymentMethod = await getPaymentDetailsBySession(session);
			expect(paymentMethod.type).to.equal('CREDITCARD');
			expect(paymentMethod.creditCard.type).to.equal('Visa');
		});

		it('resolves with null when successful but user has a null billingAccount', async () => {
			graphQlPaymentBySession({ responseType: 'unsubscribed' });
			const paymentDetails = await getPaymentDetailsBySession(session);
			expect(paymentDetails).to.be.null;
		});

		it('handles exception thrown within canned query', async () => {
			graphQlPaymentBySession({ responseType, statusCode: 500 });
			return getPaymentDetailsBySession(session)
				.catch(err =>
					expect(err.message).to.equal('Unable to retrieve payment details'));
		});

		it('throws if no session supplied', done => {
			getPaymentDetailsBySession(undefined)
				.catch(err => {
					expect(err.message).to.equal('Session not supplied');
					done();
				});
		});
	});
});
