import * as R from 'ramda';

export const mergeObjects = (one, two) => {
	return R.mergeDeepWith((a, b) => (b !== undefined ? b : a), one, two);
};
