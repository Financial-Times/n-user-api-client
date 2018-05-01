const nock = require("nock");
const { test, testEnv, responses } = require("./constants");

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

module.exports = {
	userIdBySession: ({
		statusCode = 200,
		session,
		isStale = false,
		isValidUserId = true
	} = {}) => {
		if (!session)
			throw new Error("userIdBySession nock requires a session argument");
		const response = getUserIdAndSessionDataResponse({
			statusCode,
			isStale,
			isValidUserId
		});
		return nock("https://api.ft.com")
			.get(`/sessions/s/${session}`)
			.query(true)
			.reply(statusCode, response);
	},

	consentApi: (path, method, statusCode, response) => {
		return nock(testEnv.MEMBERSHIP_API_HOST_MOCK)
			[method](`/consent/users/${test.uuid}/${test.scope}${path}`)
			.reply(statusCode, response);
	},

	platformApi: (method, statusCode, response) => {
		return nock(testEnv.MEMBERSHIP_API_HOST_MOCK)
			[method]("/")
			.reply(statusCode, response);
	},

	formOfWordsApi: ({ statusCode = 200, formOfWordsId, apiHost } = {}) => {
		if (!formOfWordsId)
			throw new Error('formOfWordsApi nock requires a formOfWordsId argument');
		const response = statusCode === 200 ? responses.formOfWords[formOfWordsId] : '';
		const formOfWordsNock = nock(apiHost)
			.get(`/api/v1/FTPINK/${formOfWordsId}`)
			.reply(statusCode, response);
		return formOfWordsNock;
	},

	consentProxyApi: ({ statusCode = 200, userId, formOfWordsId, apiHost}) => {
		if (!formOfWordsId)
			throw new Error('consentProxyApi nock requires a formOfWordsId argument');
		const response = statusCode === 200 ? responses.consentProxy[formOfWordsId] : '';
		return nock(apiHost)
			.get(`/__consent/view-model/FTPINK/${userId}/${formOfWordsId}`)
			.reply(statusCode, response);
	},

	graphQlUserBySession: ({ responseType, statusCode = 200 }) => {
		const response = getResponse(statusCode, responseType);
		return nock("https://api.ft.com")
			.get("/memb-query/api/mma-user-by-session")
			.query(true)
			.reply(statusCode, response);
	},

	authApi: ({ statusCode = 302, expiredSession = false } = {}) => {
		const result = expiredSession
			? "#error=invalid_scope&error_description=Cannot%20acquire%20valid%20scope."
			: "access_token=a1b2c3";
		let authApiNock = nock("https://api.ft.com")
			.defaultReplyHeaders({
				Location: `https://www.ft.com/preferences#${result}`
			})
			.get("/authorize")
			.query(true)
			.reply(statusCode, function() {
				authApiNock.request = this.req;
			});
		return authApiNock;
	},

	userApi: ({ statusCode = 200, userId } = {}) => {
		return nock("https://api.ft.com")
			.put(`/users/${userId}/profile`)
			.reply(statusCode, (uri, requestBody) => requestBody);
	},

	userPasswordApi: ({ statusCode = 200, userId } = {}) => {
		const response = statusCode === 200 ? {} : responses.genericError;
		return nock("https://api.ft.com")
			.post(`/users/${userId}/credentials/change-password`)
			.reply(statusCode, response);
	},

	loginApi: ({ statusCode = 200 } = {}) => {
		const response =
			statusCode === 200 ? responses.loginSuccess : responses.genericError;
		let loginApiNock = nock("https://api.ft.com")
			.post("/login", body => (loginApiNock.requestBody = body))
			.reply(statusCode, response);
		return loginApiNock;
	}
};

const { MEMBERSHIP_API_HOST_MOCK, MEMBERSHIP_API_KEY_MOCK } = process.env;

beforeEach(() => {
	Object.assign(process.env, testEnv);
});

afterEach(() => {
	nock.cleanAll();
	Object.assign(process.env, {
		MEMBERSHIP_API_HOST_MOCK,
		MEMBERSHIP_API_KEY_MOCK
	});
});
