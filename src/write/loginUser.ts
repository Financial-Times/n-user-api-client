import { userLoginApi } from './apis/user-login';
import { LoginUserOptions } from '../types';
import { validateOptions } from '../utils/validate';

const KEY_PROPERTIES = [
	'apiHost',
	'apiKey',
	'appName',
	'email',
	'password'
];

export const loginUser = async (opts: LoginUserOptions): Promise<any> => {
	validateOptions(opts, null, KEY_PROPERTIES);
	return await userLoginApi(opts);
};
