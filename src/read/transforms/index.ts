import { userName } from './user-name';
import { addListsToUserData } from './add-lists-to-user-data';
export { getActivePaymentMethod } from './active-payment-method';

export const readTransforms = user => {
	let transformed = userName(user);
	return addListsToUserData(transformed);
};
