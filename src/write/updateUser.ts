import { updateUserProfileApi } from './apis/user-profile';
import { updateUserPasswordApi } from './apis/user-password';
import { userLoginApi } from './apis/user-login';
import { getUserBySession } from '../read/getUser';
import { getAuthToken } from './apis/auth-service';
import { mergeObjects } from './transforms/merge-two-objects';
import {
	GraphQlUserApiResponse,
	UpdateUserOptions,
	UserObject
} from '../types';
import { validateOptions } from '../utils/validate';

const KEY_PROPERTIES = [
	'session',
	'apiHost',
	'apiKey',
	'apiClientId',
	'userId'
];

const getUserAndAuthToken = ({
	session,
	apiHost,
	apiClientId,
	useTestUserApi
}): Promise<[any, any]> => {
	return Promise.all([
		getUserBySession(session, useTestUserApi),
		getAuthToken({ session, apiHost, apiClientId })
	]);
};

const mergeUserUpdateWithFetchedUser = ({
	userUpdate,
	userApiResponse
}: {
	userUpdate: UserObject;
	userApiResponse: GraphQlUserApiResponse;
}) => {
	if (!userApiResponse.profile || !userUpdate.profile)
		throw new Error(
			'mergeUserUpdateWithFetchedUser not supplied with valid user object or update'
		);
	return {
		user: mergeObjects(userApiResponse.profile, userUpdate.profile)
	};
};

export const changeUserPassword = async (
	opts: UpdateUserOptions
): Promise<any> => {
	validateOptions(opts, 'passwordData', KEY_PROPERTIES);
	const {
		session,
		apiHost,
		apiKey,
		apiClientId,
		userId,
		passwordData,
		remoteIp,
		countryCode,
		userAgent,
		appName,
		useTestUserApi
	} = opts;
	const [userApiResponse, authToken] = await getUserAndAuthToken({
		session,
		apiHost,
		apiClientId,
		useTestUserApi
	});
	const password = await updateUserPasswordApi({
		userId,
		passwordData,
		authToken,
		apiHost,
		apiKey,
		appName
	});
	return await userLoginApi({
		email: userApiResponse.profile.email,
		password,
		remoteIp,
		countryCode,
		userAgent,
		apiHost,
		apiKey,
		appName
	});
};

export const updateUserProfile = async (opts: UpdateUserOptions): Promise<any> => {
	validateOptions(opts, 'userUpdate', KEY_PROPERTIES);
	const {
		session,
		apiHost,
		apiKey,
		apiClientId,
		userId,
		userUpdate,
		useTestUserApi
	} = opts;
	const [userApiResponse, authToken] = await getUserAndAuthToken({
		session,
		apiHost,
		apiClientId,
		useTestUserApi
	});
	const updateMergedWithFetchedUser = mergeUserUpdateWithFetchedUser({
		userUpdate,
		userApiResponse
	});
	return await updateUserProfileApi({
		userId,
		userUpdate: updateMergedWithFetchedUser,
		authToken,
		apiHost,
		apiKey
	});
};
