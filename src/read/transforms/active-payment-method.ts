import * as R from 'ramda';

export const getActivePaymentMethod = user => {
	const paymentMethod = R.path(
		['subscriber', 'billingAccount', 'paymentMethod'],
		user
	);
	const activeMethodType = R.path(['type'], paymentMethod);
	switch(activeMethodType) {
		case 'CREDITCARD':
			return R.path(['creditCard'], paymentMethod);
		case 'PAYPAL':
			return R.path(['paypal'], paymentMethod);
		case 'DIRECTDEBIT':
			return R.path(['directDebit'], paymentMethod);
		default:
			return undefined;
	}
}