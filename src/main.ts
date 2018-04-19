export { getUserBySession, getUserIdAndSessionData } from './read/getUser';
export { updateUserProfile, changeUserPassword } from './write/updateUser';
export { UserConsent, ConsentValidator } from './services/user-consent';
export { loginUser } from './write/loginUser';

export const staticData = require('../demographics-data/demographics.json');
