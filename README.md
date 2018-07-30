# n-user-api-client 

A client to access the [User API on the FT Membership Platform](https://developer.ft.com/portal/docs-membership-platform-api)

[![npm version](https://badge.fury.io/js/%40financial-times%2Fn-user-api-client.svg)](https://badge.fury.io/js/%40financial-times%2Fn-user-api-client)

[![CircleCI](https://circleci.com/gh/Financial-Times/n-user-api-client.svg?style=shield)](https://circleci.com/gh/Financial-Times/n-user-api-client)
[![Dependencies](https://david-dm.org/Financial-Times/n-user-api-client.svg)](https://david-dm.org/Financial-Times/n-user-api-client)
[![devDependencies](https://david-dm.org/Financial-Times/n-user-api-client/dev-status.svg)](https://david-dm.org/Financial-Times/n-user-api-client?type=dev)

## Installation

```sh
npm i @financial-times/n-user-api-client --save
```

## Usage example

```js
import {updateUserProfile} from '@financial-times/n-user-api-client';

await updateUserProfile({
    session: 'abc123',
    userId: 'def456',
    apiHost: process.env['MEMBERSHIP_API_HOST_PROD'],
    apiKey: process.env['MEMBERSHIP_API_KEY_PROD'],
    apiClientId: process.env['AUTH_API_CLIENT_ID_PROD'],
    userUpdate: { ... }
})

```

## Public methods

### getUserBySession

#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then the returned user data will be redacted, some fields including address will be null

demographicsLists (object) - optional - lists of demographics data eg positions, industries, responsibilities. If supplied they'll be used to decorate the user object. If the user has a value stored for each then that value will be marked selected in the corresponding list

#### Return value

A 'user object' with profile and subscription sections

### getUserIdAndSessionData

#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then the returned user data will be redacted, some fields including address will be null

apiHost, apiKey - the consumer app should pass these in, based on Vault env vars

#### Return value

A user ID (string)

### getPaymentDetailsBySession

#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then the returned user data will be redacted, some fields including address will be null

#### Return value

A payment method detail Object (varies in form depends on the type of the method - CreditCard|PayPal|DirectDebit), returns `null` if the user hasn't got a payment method yet.

### loginUser
#### Arguments

email (string)

password (string)

remoteIp (string) - the IP of the user

countryCode (string) - the country the user is located in

userAgent (string) - the User-Agent header of the user

apiHost, apiKey - the consumer app should pass these in, based on Vault env vars

appName - the name of the app using `n-user-api-client`


#### Return value

[fresh session data](https://developer.ft.com/portal/docs-membership-platform-api-post-login) will be returned.


### updateUserProfile

#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then a valid authorization API token won't be returned and the overall request will fail

apiHost, apiKey, apiClientId - the consumer app should pass these in, based on Vault env vars

userId (string)

userUpdate - a [user object](https://developer.ft.com/portal/docs-membership-platform-api-user-profile-request-resource). It will be merged into a fresh copy of the user's record retrieved from the database

#### Return value

The updated user object

### changeUserPassword

#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then a valid authorization API token won't be returned and the overall request will fail

apiHost, apiKey, apiClientId - the consumer app should pass these in, based on Vault env vars

userId (string)

passwordData (object) - in [this format](https://developer.ft.com/portal/docs-membership-platform-api-user-api-post-users-userid-credentials-change-password)

appName - the name of the app using `n-user-api-client`

#### Return value

If successful, the user will be reauthenticated and the [fresh session data](https://developer.ft.com/portal/docs-membership-platform-api-post-login) will be returned.

## Build

The module is written in typescript - compile to the dist/ folder with:

```sh
make build
```

## Releasing

To release a new version of the client, draft a new release in Github. There's no need to update package.json.
