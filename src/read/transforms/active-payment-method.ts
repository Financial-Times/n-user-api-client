import * as R from 'ramda';

import { ErrorWithData, errorTypes } from '../../utils/error';

export const getActivePaymentMethod = user => {
	const paymentMethod = R.path(
		['subscriber', 'billingAccount', 'paymentMethod'],
		user
	);
	if(!paymentMethod){
		return null;
	}

	const activeMethodType = R.path(['type'], paymentMethod);
	if(!activeMethodType){
		throw new ErrorWithData(
			'activeMethodType not defined in paymentMethod',
			{ type: errorTypes.VALIDATION }
		);
	}

	let activePaymentMethod;
	switch(activeMethodType) {
		case 'CREDITCARD':
			activePaymentMethod = R.path(['creditCard'], paymentMethod);
			break;
		case 'PAYPAL':
			activePaymentMethod = R.path(['paypal'], paymentMethod);
			break;
		case 'DIRECTDEBIT':
			activePaymentMethod = R.path(['directDebit'], paymentMethod);
			break;
		default:
			activePaymentMethod = undefined;
			break;
	}
	if(!activePaymentMethod){
		throw new ErrorWithData(
			`paymentMethod of active type ${activeMethodType} not found`,
			{ type: errorTypes.VALIDATION }
		);
	}

	return activePaymentMethod;
}
