import * as nock from 'nock';

const responses = {
	userIdBySessionSuccess: {
		uuid: 'user-456',
		creationTime: Date.now() - 1000 * 60 * 29
	},
	userIdBySessionInvalid: {},
	userIdBySessionStale: {
		uuid: 'user-456',
		creationTime: Date.now() - 1000 * 60 * 31
	},
	genericError: {
		errors: [
			{
				message: 'Error message'
			}
		]
	},
	noSubscription: require('./responses/graphql-no-subscription.json'),
	subscribed: require('./responses/graphql-subscribed.json'),
	unsubscribed: require('./responses/graphql-subscribed.json'),
	trialActive: require('./responses/graphql-trial-active.json'),
	trialCancelled: require('./responses/graphql-trial-cancelled.json'),
	loginSuccess: require('./responses/login-api.json')
};

const getResponse = (statusCode, responseType) => {
	let response;
	if (statusCode === 200) {
		response = responses[responseType];
		if (!response)
			throw new Error(
				`The specified Nock response '${responseType}' doesn't exist`
			);
	}
	return response;
};

const getUserIdAndSessionDataResponse = ({
	statusCode,
	isStale,
	isValidUserId
}) => {
	if (statusCode !== 200) return responses.genericError;
	if (isStale) return responses.userIdBySessionStale;
	if (!isValidUserId) return responses.userIdBySessionInvalid;
	return responses.userIdBySessionSuccess;
};

export const nocks = {
	userIdBySession: ({
		statusCode = 200,
		session,
		isStale = false,
		isValidUserId = true
	} = {} as any) => {
		if (!session)
			throw new Error('userIdBySession nock requires a session argument');
		const response = getUserIdAndSessionDataResponse({
			statusCode,
			isStale,
			isValidUserId
		});
		return nock('https://api.ft.com')
			.get(`/sessions/s/${session}`)
			.query(true)
			.reply(statusCode, response);
	},

	graphQlUserBySession: ({ responseType, statusCode = 200 }): nock.Scope => {
		const response = getResponse(statusCode, responseType);
		return nock('https://api.ft.com')
			.get('/memb-query/api/mma-user-by-session')
			.query(true)
			.reply(statusCode, response);
	},

	authApi: ({ statusCode = 302, expiredSession = false } = {} as any): any => {
		const result = expiredSession
			? '#error=invalid_scope&error_description=Cannot%20acquire%20valid%20scope.'
			: 'access_token=a1b2c3';
		let authApiNock: any = nock('https://api.ft.com')
			.defaultReplyHeaders({
				Location: `https://www.ft.com/preferences#${result}`
			})
			.get('/authorize')
			.query(true)
			.reply(statusCode, function () {
				authApiNock.request = this.req;
			});
		return authApiNock;
	},

	userApi: ({ statusCode = 200, userId } = {} as any): nock.Scope => {
		return nock('https://api.ft.com')
			.put(`/users/${userId}/profile`)
			.reply(statusCode, (uri, requestBody) => requestBody);
	},

	userPasswordApi: ({ statusCode = 200, userId } = {} as any): nock.Scope => {
		const response = statusCode === 200 ? {} : responses.genericError;
		return nock('https://api.ft.com')
			.post(`/users/${userId}/credentials/change-password`)
			.reply(statusCode, response);
	},

	loginApi: ({ statusCode = 200 } = {} as any): any => {
		let requestBody;
		const response =
			statusCode === 200 ? responses.loginSuccess : responses.genericError;
		let loginApiNock: any = nock('https://api.ft.com')
			.post('/login', body => (loginApiNock.requestBody = body))
			.reply(statusCode, response);
		return loginApiNock;
	}
};

afterEach(() => {
	nock.cleanAll();
});
