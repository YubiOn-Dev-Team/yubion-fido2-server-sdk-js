# YubiOn FIDO2 Server SDK for JavaScript/TypeScript API Reference

This document is the API reference for the YubiOn FIDO2 Server SDK for JavaScript/TypeScript.  
[English](api-reference.md) | [Japanese](api-reference.ja.md)

## `YubiOnFssSdk` Class

This is the main class for communicating with the FIDO2 server.

### Constructor

#### `new YubiOnFssSdk(config)`

Initializes a new instance of the `YubiOnFssSdk`.

**Arguments:**

*   `config` (`FssSdkConfigParameter`): Connection settings for the FIDO2 server.
    *   `endpoint` (`string`, Optional, Default: `"https://fss-app.yubion.com/api/"`): The API endpoint URL.
    *   `rpId` (`string`): The ID of the RP (Relying Party) using this SDK.
    *   `apiAuthId` (`string`): The ID used for API authentication.
    *   `apiAuthType` (`FssApiAuthType`): The type of API authentication. Specify one of `"NonceSignAuth"`, `"DatetimeSignAuth"`, or `"AccessKeyAuth"`.
    *   `secretKey` (`string`): The secret key used for API authentication.
    *   `agent` (`string`, Optional, Default: `"yubion-fido2-server-sdk-js"`): The user agent string used in API requests.

---

## User Management

### `getUser(userId, withDisabledUser, withDisabledCredential)`

Retrieves user information for the specified ID.

**Arguments:**

*   `userId` (`string`): The ID of the user to retrieve.
*   `withDisabledUser` (`boolean`, Optional, Default: `false`): Whether to include disabled users.
*   `withDisabledCredential` (`boolean`, Optional, Default: `false`): Whether to include disabled credentials.

**Returns:**

*   `Promise<{ user: UserDataWithCredentialCount, credentials: Array<CredentialData>, signalCurrentUserDetailsOptions: SignalCurrentUserDetailsOptions }>`: A Promise that resolves to an object containing user information and an array of credential information.
    *   `user` (`UserDataWithCredentialCount`): User information.
    *   `credentials` (`Array<CredentialData>`): An array of credential information associated with the user.
    *   `signalCurrentUserDetailsOptions` (`SignalCurrentUserDetailsOptions`): Signal information for updating user information on the client side. Use as an argument for calling `PublicKeyCredential.signalCurrentUserDetails()`.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `getAllUsers(withDisabledUser)`

Retrieves all user information.

**Arguments:**

*   `withDisabledUser` (`boolean`, Optional, Default: `false`): Whether to include disabled users.

**Returns:**

*   `Promise<{ users: Array<UserDataWithCredentialCount> }>`: A Promise that resolves to an object containing an array of user information.
    *   `users` (`Array<UserDataWithCredentialCount>`): An array of user information.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `getUsersByUserName(userName, withDisabledUser)`

Retrieves user information for the specified username.

**Arguments:**

*   `userName` (`string`): The username to search for.
*   `withDisabledUser` (`boolean`, Optional, Default: `false`): Whether to include disabled users.

**Returns:**

*   `Promise<{ users: Array<UserDataWithCredentialCount> }>`: A Promise that resolves to an object containing an array of user information.
    *   `users` (`Array<UserDataWithCredentialCount>`): An array of user information.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `registerUser(user)`

Registers a new user.

**Arguments:**

*   `user` (`UserDataRegisterParameter`): The information of the user to register.
    *   `userId` (`string`): User ID.
    *   `userName` (`string`): Username.
    *   `displayName` (`string | null`, Optional): Display name.
    *   `userAttributes` (`{ [key: string]: any } | string | null`, Optional): Additional user attributes. Specify as a JSON object or JSON string.
    *   `disabled` (`boolean`): Whether to register the user as disabled.

**Returns:**

*   `Promise<{ user: UserDataWithCredentialCount }>`: A Promise that resolves to an object containing the registered user's information.
    *   `user` (`UserDataWithCredentialCount`): The registered user's information.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `updateUser(user, withUpdatedCheck)`

Updates the information of the specified user.

**Arguments:**

*   `user` (`UserDataUpdateParameter`): The information of the user to update.
    *   `userId` (`string`): User ID.
    *   `userName` (`string`): Username.
    *   `displayName` (`string | null`, Optional): Display name.
    *   `userAttributes` (`{ [key: string]: any } | string | null`, Optional): Additional user attributes. Specify as a JSON object or JSON string.
    *   `disabled` (`boolean`): Whether to disable the user.
    *   `updated` (`Date`, Optional): The last updated date and time. If `withUpdatedCheck` is `true`, the update will fail if this value does not match the `updated` value in the database.
*   `withUpdatedCheck` (`boolean`, Optional, Default: `false`): Whether to check the last updated date and time.

**Returns:**

*   `Promise<{ user: UserDataWithCredentialCount, signalCurrentUserDetailsOptions: SignalCurrentUserDetailsOptions }>`: A Promise that resolves to an object containing the updated user information.
    *   `user` (`UserDataWithCredentialCount`): The updated user information.
    *   `signalCurrentUserDetailsOptions` (`SignalCurrentUserDetailsOptions`): Signal information for updating user information on the client side. Use as an argument for calling `PublicKeyCredential.signalCurrentUserDetails()`.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `deleteUser(userId)`

Deletes the user with the specified ID.

**Arguments:**

*   `userId` (`string`): The ID of the user to delete.

**Returns:**

*   `Promise<{ user: UserDataWithCredentialCount, credentials: Array<CredentialData>, signalAllAcceptedCredentialsOptions: SignalAllAcceptedCredentialsOptions }>`: A Promise that resolves to an object containing the deleted user information and related information.
    *   `user` (`UserDataWithCredentialCount`): The deleted user information.
    *   `credentials` (`Array<CredentialData>`): An array of credential information that was associated with the deleted user.
    *   `signalAllAcceptedCredentialsOptions` (`SignalAllAcceptedCredentialsOptions`): Signal information for deleting credential information on the client side. Use as an argument for calling `PublicKeyCredential.signalAllAcceptedCredentials()`.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

---

## FIDO2/WebAuthn Credential Management

### `startRegisterCredential(startRegisterParameter)`

Starts the credential registration process.

**Arguments:**

*   `startRegisterParameter` (`Fido2StartRegisterParameter`): Request parameters for starting credential registration.
    *   `creationOptionsBase` (`Fido2CreationOptionsBase`): The base part of WebAuthn's `PublicKeyCredentialCreationOptions`.
        *   `authenticatorSelection` (`AuthenticatorSelectionCriteria`, Optional): Criteria for selecting an authenticator. Can be "platform" or "cross-platform".
        *   `timeout` (`number`, Optional): Timeout period in milliseconds.
        *   `hints` (`string[]`, Optional): An array of strings to hint to the user agent (e.g., browser) about the authentication method. Can be "security-key", "client-device", or "hybrid".
        *   `attestation` (`AttestationConveyancePreference`, Optional): Attestation conveyance preference. Can be "none", "indirect", "direct", or "enterprise".
        *   `extensions` (`{ [key: string]: any }`, Optional): Extension data.
    *   `user` (`UserDataRegisterParameter`): Information of the user to register.
        *   `userId` (`string`): User ID. Must be specified by encoding binary data of up to 64 bytes in Base64URL format (without padding).
        *   `userName` (`string`, Optional): Username. Optional if both `options.createUserIfNotExists` and `options.updateUserIfExists` are `false`.
        *   `displayName` (`string | null`, Optional): Display name. Optional if both `options.createUserIfNotExists` and `options.updateUserIfExists` are `false`.
        *   `userAttributes` (`{ [key: string]: any } | string | null`, Optional): Additional user attributes. Optional if both `options.createUserIfNotExists` and `options.updateUserIfExists` are `false`.
        *   `disabled` (`boolean`, Optional): Whether the user is disabled. Cannot be set to `false` during registration. Optional if both `options.createUserIfNotExists` and `options.updateUserIfExists` are `false`.
    *   `options` (`Fido2RegisterOptions`, Optional): Additional options for the registration process.
        *   `createUserIfNotExists` (`boolean`, Optional): Whether to create a new user if one does not exist.
        *   `updateUserIfExists` (`boolean`, Optional): Whether to update an existing user.
        *   `credentialName` (`Fido2CredentialNameParameter`, Optional): Credential name. See `Fido2CredentialNameParameter` in the data structures section for details.
        *   `credentialAttributes` (`{ [key: string]: any } | string`, Optional): Additional credential attributes.

**Returns:**

*   `Promise<{ creationOptions: PublicKeyCredentialCreationOptionsJSON, user: UserDataWithCredentialCount, session: string }>`: A Promise that resolves to an object containing creation options for credential registration, user information, and a session string.
    *   `creationOptions` (`PublicKeyCredentialCreationOptionsJSON`): Options to pass to WebAuthn's `navigator.credentials.create()`.
    *   `user` (`UserDataWithCredentialCount`): User information.
    *   `session` (`string`): A session string to be used in subsequent `verifyRegisterCredential` or `finishRegisterCredential` calls.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `verifyRegisterCredential(finishRegisterParameter, session)`

Verifies the credential registration parameters. This method analyzes the registration details before actual registration and provides them in an easy-to-understand format for the RP (the program using the SDK) to confirm. The RP should check the return value and, if there are no issues, call `finishRegisterCredential`.

**Arguments:**

*   `finishRegisterParameter` (`Fido2FinishRegisterParameter`): Parameters to complete the credential registration.
    *   `createResponse`: The response from the authenticator.
        *   `attestationResponse` (`string | PublicKeyCredentialJSON`): The attestation response from the authenticator. A JSON string or `PublicKeyCredentialJSON` object. Set the return value of `navigator.credentials.create()`.
        *   `transports` (`string | Array<string>`, Optional): The transport protocols supported by the authenticator. If you want to save the transport protocols, call the `getTransports()` method of the `response` member of the return value of `navigator.credentials.create()` and set its return value to the `transports` member.
    *   `options` (Optional):
        *   `credentialName` (`Fido2CredentialNameParameter`, Optional): Credential name. See `Fido2CredentialNameParameter` in the data structures section for details.
*   `session` (`string`): The session string obtained from `startRegisterCredential`.

**Returns:**

*   `Promise<{ credential: CredentialData, user: UserDataWithCredentialCount }>`: A Promise that resolves to an object containing the verified credential data and user information.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `finishRegisterCredential(finishRegisterParameter, session)`

Completes the credential registration process and saves the credential to the user's account.

**Arguments:**

*   `finishRegisterParameter` (`Fido2FinishRegisterParameter`): Same as `verifyRegisterCredential`.
*   `session` (`string`): The session string obtained from `startRegisterCredential`.

**Returns:**

*   `Promise<{ credential: CredentialData, user: UserDataWithCredentialCount }>`: A Promise that resolves to an object containing the registered credential data and user information.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `startAuthenticate(startAuthenticateParameter)`

Starts the authentication process. If no user is specified, authentication is performed using a Discoverable Credential.

**Arguments:**

*   `startAuthenticateParameter` (`Fido2StartAuthenticateParameter`): Request parameters for starting authentication.
    *   `requestOptionsBase` (`Fido2RequestOptionsBase`): The base part of WebAuthn's `PublicKeyCredentialRequestOptions`.
        *   `timeout` (`number`, Optional): Timeout period in milliseconds.
        *   `hints` (`string[]`, Optional): An array of strings to hint to the user agent (e.g., browser) about the authentication method. Can be "security-key", "client-device", or "hybrid".
        *   `userVerification` (`UserVerificationRequirement`, Optional): User verification requirement. Set to "required", "preferred", or "discouraged".
        *   `extensions` (`{ [key: string]: any }`, Optional): Extension data.
    *   `userId` (`string`, Optional): User ID. Omit this if using a Discoverable Credential.
    *   `options` (`Fido2AuthenticateOptions`, Optional): Additional options for the authentication process. This object currently has no members defined but is reserved for future expansion.

**Returns:**

*   `Promise<{ requestOptions: PublicKeyCredentialRequestOptionsJSON, user?: UserData, session: string }>`: A Promise that resolves to an object containing request options for authentication, user information, and a session string.
    *   `requestOptions` (`PublicKeyCredentialRequestOptionsJSON`): Options to pass to WebAuthn's `navigator.credentials.get()`.
    *   `user` (`UserData`, Optional): User information. `null` if `userId` is not specified.
    *   `session` (`string`): A session string to be used in the subsequent `finishAuthenticate` call.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `finishAuthenticate(finishAuthenticateParameter, session)`

Completes the authentication process.

**Arguments:**

*   `finishAuthenticateParameter` (`Fido2FinishAuthenticateParameter`): Parameters to complete the authentication.
    *   `requestResponse`: The response from the authenticator.
        *   `attestationResponse` (`string | PublicKeyCredentialJSON`): The assertion response from the authenticator. A JSON string or `PublicKeyCredentialJSON` object. Set the return value of `navigator.credentials.get()`.
*   `session` (`string`): The session string obtained from `startAuthenticate`.

**Returns:**

*   `Promise<{ credential: CredentialData, user: UserDataWithCredentialCount, signalAllAcceptedCredentialsOptions: SignalAllAcceptedCredentialsOptions, signalCurrentUserDetailsOptions: SignalCurrentUserDetailsOptions }>`: A Promise that resolves to an object containing the authenticated credential data and user information.
    *   `credential` (`CredentialData`): The credential information used for authentication.
    *   `user` (`UserDataWithCredentialCount`): The authenticated user information.
    *   `signalAllAcceptedCredentialsOptions` (`SignalAllAcceptedCredentialsOptions`): Signal information for updating credential information on the client side. Use as an argument for calling `PublicKeyCredential.signalAllAcceptedCredentials()`.
    *   `signalCurrentUserDetailsOptions` (`SignalCurrentUserDetailsOptions`): Signal information for updating user information on the client side. Use as an argument for calling `PublicKeyCredential.signalCurrentUserDetails()`.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `getCredential(userId, credentialId, withDisabledUser, withDisabledCredential)`

Retrieves credential information that matches the specified user ID and credential ID.

**Arguments:**

*   `userId` (`string`): User ID.
*   `credentialId` (`string`): Credential ID.
*   `withDisabledUser` (`boolean`, Optional, Default: `false`): Whether to include disabled users.
*   `withDisabledCredential` (`boolean`, Optional, Default: `false`): Whether to include disabled credentials.

**Returns:**

*   `Promise<{ user: UserDataWithCredentialCount, credential: CredentialData }>`: A Promise that resolves to an object containing user information and credential information.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `updateCredential(credential, withUpdatedCheck)`

Updates the information of the specified credential.

**Arguments:**

*   `credential` (`CredentialDataUpdateParameter`): The information of the credential to update.
    *   `userId` (`string`): User ID.
    *   `credentialId` (`string`): Credential ID.
    *   `credentialName` (`string`): Credential name.
    *   `credentialAttributes` (`{ [key: string]: any } | string | null`, Optional): Additional credential attributes.
    *   `disabled` (`boolean`): Whether to disable the credential.
    *   `updated` (`Date`, Optional): The last updated date and time. If `withUpdatedCheck` is `true`, the update will fail if this value does not match the `updated` value in the database.
*   `withUpdatedCheck` (`boolean`, Optional, Default: `false`): Whether to check the last updated date and time.

**Returns:**

*   `Promise<{ user: UserDataWithCredentialCount, credential: CredentialData }>`: A Promise that resolves to an object containing the updated user information and credential information.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

### `deleteCredential(userId, credentialId)`

Deletes the credential that matches the specified user ID and credential ID.

**Arguments:**

*   `userId` (`string`): User ID.
*   `credentialId` (`string`): Credential ID.

**Returns:**

*   `Promise<{ user: UserDataWithCredentialCount, credential: CredentialData, signalUnknownCredentialOptions: SignalUnknownCredentialOptions }>`: A Promise that resolves to an object containing the deleted user information and credential information.
    *   `user` (`UserDataWithCredentialCount`): User information.
    *   `credential` (`CredentialData`): The deleted credential information.
    *   `signalUnknownCredentialOptions` (`SignalUnknownCredentialOptions`): Signal information for deleting credential information on the client side. Use as an argument for calling `PublicKeyCredential.signalUnknownCredential()`.

**Potential Exceptions:**

*   `FssApiError`: Thrown if the API request fails.

---

## Data Structures

### `UserDataWithCredentialCount`

An object representing user information.

*   `rpId` (`string`): RP ID.
*   `userId` (`string`): User ID.
*   `userName` (`string`): Username.
*   `displayName` (`string | null`): Display name.
*   `userAttributes` (`{ [key: string]: any } | null`): Additional user attributes. Can be freely set by the RP.
*   `disabled` (`boolean`): Whether the user is disabled.
*   `registered` (`Date`): Registration date and time.
*   `updated` (`Date`): Last updated date and time.
*   `enabledCredentialCount` (`number`): The number of enabled credentials.
*   `credentialCount` (`number`): The total number of credentials.

### `CredentialData`

An object representing credential information.

*   `rpId` (`string`): RP ID.
*   `userId` (`string`): User ID.
*   `credentialId` (`string`): Credential ID.
*   `credentialName` (`string`, Optional): Credential name.
*   `credentialAttributes` (`{ [key: string]: any } | null`, Optional): Additional credential attributes. Can be freely set by the RP.
*   `format` (`string`): The format of the credential.
*   `userPresence` (`boolean`): Whether user presence was confirmed.
*   `userVerification` (`boolean`): Whether user verification was successful.
*   `backupEligibility` (`boolean`): Whether it is eligible for backup (synced passkey).
*   `backupState` (`boolean`): Whether it is backed up (synced).
*   `attestedCredentialData` (`boolean`): Whether Attested Credential Data is included.
*   `extensionData` (`boolean`): Whether extension data is included.
*   `aaguid` (`string`, Optional): AAGUID.
*   `aaguidModelName` (`string`, Optional): The model name identified from the AAGUID.
*   `publicKey` (`string`): Public key.
*   `transportsRaw` (`string`, Optional): JSON string of transports.
*   `transportsBle` (`boolean`, Optional): Whether BLE is supported.
*   `transportsHybrid` (`boolean`, Optional): Whether Hybrid is supported.
*   `transportsInternal` (`boolean`, Optional): Whether Internal is supported.
*   `transportsNfc` (`boolean`, Optional): Whether NFC is supported.
*   `transportsUsb` (`boolean`, Optional): Whether USB is supported.
*   `discoverableCredential` (`boolean`, Optional): Whether it is a Discoverable Credential.
*   `enterpriseAttestation` (`boolean`): Whether it is an Enterprise Attestation.
*   `vendorId` (`string`, Optional): Vendor ID. Set to an ID indicating the vendor if Enterprise Attestation is correctly parsed on the FIDO2 Server side.
*   `authenticatorId` (`string`, Optional): Authenticator ID. Set to the key's serial number, etc., if Enterprise Attestation is correctly parsed on the FIDO2 Server side.
*   `attestationObject` (`string`): Attestation object.
*   `authenticatorAttachment` (`string`, Optional): The attachment type of the authenticator.
*   `credentialType` (`string`): The type of the credential.
*   `clientDataJson` (`string`): ClientDataJSON string.
*   `clientDataJsonRaw` (`string`): Binary value representation of ClientDataJSON (Base64URL).
*   `lastAuthenticated` (`Date`, Optional): Last authenticated date and time.
*   `lastSignCounter` (`number`, Optional): Last sign counter.
*   `disabled` (`boolean`): Whether the credential is disabled.
*   `registered` (`Date`): Registration date and time.
*   `updated` (`Date`): Last updated date and time.

### `Fido2CredentialNameParameter`

A parameter for specifying the credential name. It can be a simple string or an object.
If specified as an object, it has the following properties:

*   `name` (`string`): The base credential name.
*   `nameIfModelNameExists` (`string`, Optional): The credential name to be used if the authenticator's model name is available.
*   `nameIfEnterpriseAttestationExists` (`string`, Optional): The credential name to be used if Enterprise Attestation is available.

**Name Determination Logic:**

1.  If Enterprise Attestation is detected during registration, `nameIfEnterpriseAttestationExists` is used.
2.  If Attestation is detected during registration and a model name is available, `nameIfModelNameExists` is used.
3.  In all other cases, or if the corresponding property is omitted, `name` is used.

**Placeholders:**

The credential name can include the following placeholders, which will be replaced with actual values upon registration:

*   `$$`: Replaced with `$`.
*   `$modelName`: The product model name derived from the AAGUID.
*   `$authenticatorId`: The authenticator ID (e.g., serial number) derived from the certificate in the case of Enterprise Attestation.

### `FssApiError`

An exception class representing an API error. It inherits from the `Error` class.

*   `name` (`string`): The error name. Always `"FssApiError"`.
*   `message` (`string`): The error message.
*   `appStatus` (`FssApiResultStatus`): The processing result status of the API.
*   `appSubStatus` (`FssApiErrorSubStatus`, Optional): The processing result sub-status of the API.
    *   `errorCode` (`Fido2ErrorStatus`, Optional): FIDO2-related error code.
    *   `errorMessage` (`string`, Optional): FIDO2-related error message.
    *   `info` (`any`, Optional): Additional information.

---
