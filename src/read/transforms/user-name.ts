import * as R from 'ramda';

export const userName = user => {
	let transformed = R.clone(user);
	transformed.profile.title = R.path(['profile', 'name', 'title'], transformed);
	transformed.profile.firstName = R.path(
		['profile', 'name', 'first'],
		transformed
	);
	transformed.profile.lastName = R.path(
		['profile', 'name', 'last'],
		transformed
	);
	delete transformed.profile.name;
	return transformed;
};
