export interface SimpleListItem {
	description?: string;
	code?: string;
	name?: string;
	selected?: boolean;
}

export interface SimpleList extends Array<SimpleListItem> {}

export interface GraphQlUserApiResponse {
	subscriber: object;
	profile: any;
	id: string;
}

export const UserId: string;

export interface UserHomeAddress {
	line1: string;
	line2: string;
	state: string;
	townCity: string;
	postcode: string;
}

export interface UserMarketing {
	ftByPost: boolean;
	ftByEmail: boolean;
}

export interface UserProfileObject {
	firstName: string;
	lastName: string;
	title: string;
	phoneNumber: string;
	email: string;
	homeAddress: UserHomeAddress;
	marketing: UserMarketing;
}

export interface UserObject {
	profile: UserProfileObject;
	subscription: any;
}
export interface RequestContext {
	remoteIp: string;
	browserUserAgent: string;
	countryCode: string;
}

export interface APIContext {
	apiHost: string;
	apiKey: string;
	appName: string;
}

export interface UpdateUserOptions extends APIContext {
	apiClientId: string;
	session: string;
	userId: string;
	passwordData?: any;
	userUpdate?: any;
	requestContext?: RequestContext;
}

export interface LoginUserOptions extends APIContext {
	email: string;
	password: string;
	requestContext: RequestContext;
}
