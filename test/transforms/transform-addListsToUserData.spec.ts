import { expect } from 'chai';
import { addListsToUserData } from '../../src/read/transforms/add-lists-to-user-data';
import { userName } from '../../src/read/transforms/user-name';
const apiResponse = require('../responses/graphql-subscribed.json').data.user;

describe('Transform My Account data for display', () => {
	let userData;

	beforeEach(() => {
		userData = userName(apiResponse);
	});

	it('retains existing fields under the `profile` block', () => {
		const transformed = addListsToUserData(userData);
		Object.keys(userData.profile).forEach(key => {
			if (key !== 'demographics')
				expect(transformed.profile[key]).to.equal(userData.profile[key]);
		});
	});

	it('adds a list of titles with the user\'s value selected', () => {
		const transformed = addListsToUserData(userData);
		expect(transformed.profile.titles.length).to.equal(7);
		expect(
			transformed.profile.titles.find(
				title => title.description === userData.profile.title
			).selected
		).to.be.true;
	});

	it('adds a list of active positions with the user\'s value selected', () => {
		const transformed = addListsToUserData(userData);
		expect(transformed.profile.demographics.positions.length).to.equal(16);
		expect(
			transformed.profile.demographics.positions.every(
				position => position.description
			)
		).to.be.true;
		expect(
			transformed.profile.demographics.positions.find(
				position =>
					position.code === userData.profile.demographics.position.code
			).selected
		).to.be.true;
	});

	it('adds a list of active industries with no value selected as none is stored for the user', () => {
		const transformed = addListsToUserData(userData);
		expect(transformed.profile.demographics.industries.length).to.equal(26);
		expect(
			transformed.profile.demographics.industries.every(
				industry => industry.description
			)
		).to.be.true;
		expect(
			transformed.profile.demographics.industries.find(
				industry =>
					industry.code === userData.profile.demographics.industry.code
			).selected
		).to.be.true;
	});

	it('adds a list of active responsibilities with no value selected as none is stored for the user', () => {
		const transformed = addListsToUserData(userData);
		expect(transformed.profile.demographics.responsibilities.length).to.equal(
			21
		);
		expect(
			transformed.profile.demographics.responsibilities.every(
				responsibility => responsibility.description
			)
		).to.be.true;
		expect(
			transformed.profile.demographics.responsibilities.find(
				responsibility =>
					responsibility.code ===
					userData.profile.demographics.responsibility.code
			).selected
		).to.be.true;
	});
});
