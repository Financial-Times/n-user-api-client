import { filterDemographicsLists, titles } from './static-data';
import { SimpleList, SimpleListItem } from '../../types';
import * as R from 'ramda';

const selectValueInList = (list: SimpleList, userValue: string): SimpleList => {
	if (!userValue) return list;
	return list.map(
		(item: SimpleListItem): SimpleListItem => ({
			description: item.description,
			code: item.code,
			selected: item.code === userValue
		})
	);
};

export const addListsToUserData = (userData) => {
	const demographics = filterDemographicsLists();
	const positionCode =
		userData.profile.demographics.position &&
		userData.profile.demographics.position.code;
	const positions = positionCode
		? selectValueInList(demographics.positions, positionCode)
		: demographics.positions;
	const industryCode =
		userData.profile.demographics.industry &&
		userData.profile.demographics.industry.code;
	const industries = industryCode
		? selectValueInList(demographics.industries, industryCode)
		: demographics.industries;
	const responsibilityCode =
		userData.profile.demographics.responsibility &&
		userData.profile.demographics.responsibility.code;
	const responsibilities = responsibilityCode
		? selectValueInList(demographics.responsibilities, responsibilityCode)
		: demographics.responsibilities;

	return R.mergeDeepWith((a, b) => (b ? b : a), userData, {
		profile: {
			titles: selectValueInList(titles, userData.profile.title),
			demographics: {
				positions,
				industries,
				responsibilities
			}
		}
	});
};
