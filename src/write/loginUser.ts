import { userLoginApi } from './apis/user-login';
import { LoginUserOptions } from '../types';
import { validateOptions } from '../utils/validate';

export const loginUser = async (opts?: LoginUserOptions): Promise<any> => {
	if(!opts) throw new Error('Options not supplied');

	validateOptions(opts, null, ['email', 'password', 'apiHost', 'apiKey']);
	return await userLoginApi(opts);
};
