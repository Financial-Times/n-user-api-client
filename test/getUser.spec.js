const {expect} = require('chai');
const {getUserBySession, getUserIdBySession} = require('../dist/read/getUser');
const demographicsLists = require('./transforms/demographics-lists.json');
const nocks = require('./nocks');

describe('getUser', () => {
	const session = '123';

	describe('getUserBySession', () => {
		it('resolves with a transformed user object when successful', async () => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			const user = await getUserBySession({session, demographicsLists});
			expect(user.profile.firstName).to.equal('John');
		});

		it('handles exception thrown within canned query', async () => {
			nocks.graphQlUserBySession({ statusCode: 500 });
			return getUserBySession({ session, demographicsLists })
				.catch(err =>
					expect(err.message).to.equal('Unable to retrieve user for session 123'));
		});
	});

	describe('getUserIdBySession', () => {
		it('resolves with a user ID when successful', async () => {
			nocks.graphQlUserIdBySession();
			const userId = await getUserIdBySession(session);
			expect(userId).to.equal('user-456');
		});

		it('handles exception thrown within canned query', async () => {
			nocks.graphQlUserIdBySession({statusCode: 500});
			return getUserIdBySession(session)
				.catch(err =>
					expect(err.message).to.equal('Unable to retrieve userId for session 123'));
		});
	});

});