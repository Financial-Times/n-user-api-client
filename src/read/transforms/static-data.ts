const demographics = require('../../../demographics-data/demographics.json');

export const filterDemographicsLists = () => ({
	positions: demographics.positions.filter((item) => item.active),
	responsibilities: demographics.responsibilities.filter((item) => item.active),
	industries: demographics.industries.filter((item) => item.active)
});

export const titles = [
	{ description: 'Ms', code: 'Ms' },
	{ description: 'Miss', code: 'Miss' },
	{ description: 'Mrs', code: 'Mrs' },
	{ description: 'Mr', code: 'Mr' },
	{ description: 'Dr', code: 'Dr' },
	{ description: 'Prof', code: 'Prof' },
	{ description: 'Sir', code: 'Sir' }
];
