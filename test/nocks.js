const nock = require('nock');

const responses = {
	userIdBySessionSuccess: {
		uuid: 'user-456',
		creationTime: Date.now() - (1000 * 60 * 29)
	},
	userIdBySessionInvalid: {
	},
	userIdBySessionStale: {
		uuid: 'user-456',
		creationTime: Date.now() - (1000 * 60 * 31)
	},
	genericError: {
		errors: [{
			message: 'Error message'
		}]
	},
	noSubscription: require('./responses/graphql-no-subscription.json'),
	subscribed: require('./responses/graphql-subscribed.json'),
	unsubscribed: require('./responses/graphql-subscribed.json'),
	trialActive: require('./responses/graphql-trial-active.json'),
	trialCancelled: require('./responses/graphql-trial-cancelled.json'),
	loginSuccess: require('./responses/login-api')
};

const getResponse = (statusCode, responseType) => {
	let response;
	if (statusCode === 200) {
		response = responses[responseType];
		if (!response)
			throw new Error(`The specified Nock response '${responseType}' doesn't exist`);
	}
	return response;
};

const getUserIdAndSessionDataResponse = ({statusCode, isStale, isValidUserId}) => {
	if (statusCode !== 200)
		return responses.genericError;
	if (isStale)
		return responses.userIdBySessionStale;
	if (!isValidUserId)
		return responses.userIdBySessionInvalid;
	return responses.userIdBySessionSuccess;
};

const nocks = {
	userIdBySession: ({ statusCode=200, session, isStale=false, isValidUserId=true } = {}) => {
		if (!session)
			throw new Error('userIdBySession nock requires a session argument');
		const response = getUserIdAndSessionDataResponse({statusCode, isStale, isValidUserId});
		return nock('https://api.ft.com')
			.get(`/sessions/s/${session}`)
			.query(true)
			.reply(statusCode, response);
	},

	graphQlUserBySession: ({ responseType, statusCode = 200 }) => {
		const response = getResponse(statusCode, responseType);
		return nock('https://api.ft.com')
			.get('/memb-query/api/mma-user-by-session')
			.query(true)
			.reply(statusCode, response);
	},

	authApi: ({ statusCode = 302, expiredSession = false } = {}) => {
		const result = expiredSession ? '#error=invalid_scope&error_description=Cannot%20acquire%20valid%20scope.' : 'access_token=a1b2c3';
		let authApiNock = nock('https://api.ft.com')
			.defaultReplyHeaders({ Location: `https://www.ft.com/preferences#${result}` })
			.get('/authorize')
			.query(true)
			.reply(statusCode, function () {
				authApiNock.request = this.req;
			});
		return authApiNock;
	},

	userApi: ({ statusCode = 200, userId } = {}) => {
		let requestBody;
		return nock('https://api.ft.com')
			.put(`/v1/users/${userId}/profile`, body => requestBody = body)
			.reply(statusCode, () => {
				return new Response(requestBody)
			});
	},

	userPasswordApi: ({ statusCode = 200, userId } = {}) => {
		const response = statusCode === 200 ? {} : responses.genericError;
		return nock('https://api.ft.com')
			.post(`/v1/users/${userId}/credentials/change-password`)
			.reply(statusCode, response);
	},

	loginApi: ({ statusCode = 200 } = {}) => {
		const response = statusCode === 200 ? responses.loginSuccess : responses.genericError;
		const loginApiNock = nock('https://api.ft.com')
			.post('/v1/reauthenticate', body => loginApiNock.requestBody = body)
			.reply(statusCode, response);
		return loginApiNock;
	}

};

afterEach(() => {
	nock.cleanAll();
});

module.exports = nocks;