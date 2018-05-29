import { expect } from 'chai';
import { ErrorWithData } from '../../src/utils/error';
import { getActivePaymentMethod } from '../../src/read/transforms/active-payment-method';

describe('getActivePaymentMethod', () => {
	it('throws if there is no active payment method type found', () => {
		const user = {
			subscriber: {
				billingAccount: {
					paymentMethod: {}
				},
			},
		};
		const errorMessage = 'activeMethodType not defined in paymentMethod';
		expect(getActivePaymentMethod.bind(this, user)).to.throw(ErrorWithData, errorMessage);
	});

	it('throws if there is no corresponding paymentMethod detail found for the active payment method type', () => {
		const user = {
			subscriber: {
				billingAccount: {
					paymentMethod: {
						type: 'CREDITCARD',
						creditCard: null,
						paypal: null,
						directDebit: null,
					}
				},
			},
		};
		const errorMessage = 'paymentMethod of active type CREDITCARD not found';
		expect(getActivePaymentMethod.bind(this, user)).to.throw(ErrorWithData, errorMessage);
	});

	it('returns null if there is no paymentMethod found for the user', () => {
		const user = {
			subscriber: {
				billingAccount: {},
			},
		};
		const activePaymentMethod = getActivePaymentMethod(user)
		expect(activePaymentMethod).to.be.null;
	});

	it('returns creditCard details when the active payment method type is CREDITCARD', () => {
		const creditCardDetails = {
			type: 'Visa',
			maskedNumber: 'mock'
		};
		const user = {
			subscriber: {
				billingAccount: {
					paymentMethod: {
						type: 'CREDITCARD',
						creditCard: creditCardDetails,
						paypal: null,
						directDebit: null,
					}
				},
			},
		};
		const activePaymentMethod = getActivePaymentMethod(user)
		expect(activePaymentMethod).to.eql(creditCardDetails);
	});

	it('returns paypal details when the active payment method type is PAYPAL', () => {
		const paypalDetails = {
			email: 'mock'
		};
		const user = {
			subscriber: {
				billingAccount: {
					paymentMethod: {
						type: 'PAYPAL',
						creditCard: null,
						paypal: paypalDetails,
						directDebit: null,
					}
				},
			},
		};
		const activePaymentMethod = getActivePaymentMethod(user)
		expect(activePaymentMethod).to.eql(paypalDetails);
	});

	it('returns directDebit details when the active payment method type is DIRECTDEBIT', () => {
		const directDebitDetails = {
			account: 'mock'
		};
		const user = {
			subscriber: {
				billingAccount: {
					paymentMethod: {
						type: 'DIRECTDEBIT',
						creditCard: null,
						paypal: null,
						directDebit: directDebitDetails,
					}
				},
			},
		};
		const activePaymentMethod = getActivePaymentMethod(user)
		expect(activePaymentMethod).to.eql(directDebitDetails);
	});
});
