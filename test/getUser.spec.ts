import 'isomorphic-fetch';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { getUserBySession, getUserIdAndSessionData } from '../src/read/getUser';
import { graphQlUserBySession, userIdBySession } from './nocks';
import { doesNotThrow } from 'assert';

describe('getUser', () => {
	const session = '123';
	let responseType;

	let sandbox;
	let fetchSpy;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
		fetchSpy = sandbox.spy(global, 'fetch');
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('getUserBySession', () => {
		it('resolves with a transformed user object when successful', async () => {
			graphQlUserBySession({ responseType: 'subscribed' });
			const user = await getUserBySession(session);
			expect(user?.profile?.firstName).to.equal('John');
		});

		it('handles exception thrown within canned query', async () => {
			graphQlUserBySession({ responseType, statusCode: 500 });
			return getUserBySession(session)
				.catch(err =>
					expect(err.message).to.equal('Unable to retrieve user'));
		});

		it('throws if no session supplied', done => {
			getUserBySession(undefined)
				.catch(err => {
					expect(err.message).to.equal('Session not supplied');
					done();
				});
		});
	});

	describe('getUserIdAndSessionData', () => {
		const params = {
			session,
			apiHost: 'https://api.ft.com',
			apiKey: 'apiKey'
		};

		it('resolves with a user ID when successful', async () => {
			userIdBySession({session: params.session});
			const sessionData = await getUserIdAndSessionData(params);
			expect(sessionData.userId).to.equal('user-456');
		});

		it('indicates if the session is stale', async () => {
			userIdBySession({session: params.session, isStale: true});
			const sessionData = await getUserIdAndSessionData(params);
			expect(sessionData.isSessionStale).to.equal(true);
		});

		it('indicates if the session is not stale', async () => {
			userIdBySession({session: params.session});
			const sessionData = await getUserIdAndSessionData(params);
			expect(sessionData.isSessionStale).to.equal(false);
		});

		it('throws if a valid user ID not returned', async () => {
			userIdBySession({session: params.session, isValidUserId: false});
			return getUserIdAndSessionData(params)
				.catch(err =>
					expect(err.message).to.equal('Valid user ID not returned'));
		});

		it('handles exception thrown by session API fetch', async () => {
			userIdBySession({session: params.session, statusCode: 500});
			return getUserIdAndSessionData(params)
				.catch(err =>
					expect(err.message).to.equal('Could not get session data'));
		});

		it('throws if no session supplied', done => {
			getUserIdAndSessionData({apiHost: '1', apiKey: '2'})
				.catch(err => {
					expect(err.message).to.equal('Invalid option(s): session');
					done();
				});
		});

		it('throws if no API host supplied', done => {
			getUserIdAndSessionData({session: '1', apiKey: '2'})
				.catch(err => {
					expect(err.message).to.equal('Invalid option(s): apiHost');
					done();
				});
		});

		it('throws if no API key supplied', done => {
			getUserIdAndSessionData({apiHost: '1', session: '2'})
				.catch(err => {
					expect(err.message).to.equal('Invalid option(s): apiKey');
					done();
				});
		});

		it('throws if an invalid API key is used', async () => {
			userIdBySession({session: params.session, statusCode: 403});
			return getUserIdAndSessionData(params)
				.catch(err => {
					expect(err.data.statusCode).to.equal(403);
					expect(err.message).to.equal('Could not get session data');
				});
		});

		it('allows overriding the underlying fetch request options', async () => {
			userIdBySession({session: params.session});
			const sessionData = await getUserIdAndSessionData(params, { timeout: 1 })
				.catch(err => {
					expect(fetchSpy.calledWith(sinon.match.any, sinon.match({ timeout: 1 }))).to.be.true;
				});
		});
	});

});
