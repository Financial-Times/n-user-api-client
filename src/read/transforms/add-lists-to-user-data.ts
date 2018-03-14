import { filterDemographicsLists, titles } from './static-data';
import { SimpleList, SimpleListItem } from '../../types';
import * as R from 'ramda';

const selectValueInList = (list: SimpleList, userValue: string): SimpleList => {
	if (!userValue) return list;
	return list.map((item: SimpleListItem): SimpleListItem => ({
		description: item.description,
		code: item.code,
		selected: item.code === userValue
	}));
};

export const addListsToUserData = userData => {
	const demographics = filterDemographicsLists();
	return R.mergeDeepWith((a, b) => (b ? b : a), userData, {
		profile: {
			titles: selectValueInList(titles, userData.profile.title),
			demographics: {
				positions: selectValueInList(
					demographics.positions,
					userData.profile.demographics.position.code
				),
				industries: selectValueInList(
					demographics.industries,
					userData.profile.demographics.industry.code
				),
				responsibilities: selectValueInList(
					demographics.responsibilities,
					userData.profile.demographics.responsibility.code
				)
			}
		}
	});
};
