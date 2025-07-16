# yubion-fido2-server-sdk-js

[English](README.md) | [Japanese](README.ja.md)

## What is yubion-fido2-server-sdk-js?
yubion-fido2-server-sdk-js is an SDK library for using YubiOn FIDO2Server Service (hereinafter referred to as YubiOn FSS) from node.js. It provides APIs for easily using FIDO2 authentication (Passkey) from server applications using node.js.

## How to use?
Before use, you must already be registered as a customer with YubiOn FSS and have completed RP settings. For details, please refer to the YubiOn FIDO2Server Service manual.  
  
Install the YubiOn FSS SDK in the Node.js project you will be using.
```
npm install @yubion-dev-team/yubion-fido2-server-sdk-js
```
Prepare a server-side API for registering and authenticating FIDO2 authenticators.
```
const sdk = new YubiOnFssSdk({
	rpId : "test.example.com",
	apiAuthId : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
	apiAuthType : "NonceSignAuth",
	secretKey : "MI...",
});

app.post("/startRegistration", async (req, res) => {
	const result = await fssSdk.startRegisterCredential({
		creationOptionsBase:{
			attestation:"direct",
			authenticatorSelection:{
				residentKey : "required",
				userVerification : "required",
			},
		},
		user : {
			userId : req.body.userId,
			userName : req.body.userName,
			displayName : req.body.displayName,
			disabled : false,
		},
		options : {
			createUserIfNotExists : true,
			updateUserIfExists : true,
			credentialAttributes : {},
		},
	});
	req.session.fssSessionData = result.session;
	res.json({
		creationOptions : result.creationOptions,
	});
});
app.post("/finishRegistration", async (req, res) => {
	const sessionData = req.session.fssSessionData;
	const verifyResult = await fssSdk.verifyRegisterCredential(req.body, sessionData);
	if(!verifyResult.credential.userPresence || !verifyResult.credential.userVerification){
		throw new Error("require up and uv.");
	}
	const finishResult = await fssSdk.finishRegisterCredential(req.body, sessionData);
	res.json({
		user : finishResult.user,
		credential : finishResult.credential,
	});
});
app.post("/startAuthentication", async (req, res) => {
	const userId = req.body.userId;
	const startResponse = await fssSdk.startAuthenticate({
		requestOptionsBase : {
			userVerification : "required",
		},
		userId,
	});
	req.session.fssSessionData = startResponse.session;
	res.json({
		requestOptions : startResponse.requestOptions,
	});
});
app.post("/finishAuthentication", async (req, res) => {
	const sessionData = req.session.fssSessionData;
	const finishResponse = await fssSdk.finishAuthenticate({
		requestResponse : req.body,
	}, sessionData);
	req.session.userId = finishResponse.user.userId;
	res.json({
		userId : finishResponse.user.userId,
	});
});
```
In addition to FIDO2 authentication, APIs for managing registered users and credentials are also available. For details, please refer to the [API reference](api-reference.md).

## Test Case Execution
To run the test case, you must set the following environment properties:  
|Environment property name |Contents |
|-----|---|
| FSS_TEST_ENDPOINT | API endpoints (optional) for use in testing. |
| FSS_TEST_RP_ID | RPID to use for testing. The various information (users/credentials) of this RPID will be destroyed when the test case is executed, so please do not use the RPID you are using. |
| FSS_TEST_NONCE_API_AUTH_ID | API authentication ID to check the behavior of Nonce authentication |
| FSS_TEST_NONCE_CORRECT_API_SECRET_KEY | Correct API Secret Key to check for proper operation of Nonce authentication |
| FSS_TEST_NONCE_INCORRECT_API_SECRET_KEY | Wrong API Secret Key to check for Nonce authentication failure behavior |
| FSS_TEST_DATETIME_API_AUTH_ID | API authentication ID to check the operation of date and time authentication |
| FSS_TEST_DATETIME_CORRECT_API_SECRET_KEY | Correct API Secret Key to check the normal operation of date and time authentication |
| FSS_TEST_DATETIME_INCORRECT_API_SECRET_KEY | Incorrect API Secret Key to check for failed date and time authentication behavior |
| FSS_TEST_ACCESSKEY_API_AUTH_ID | API authentication ID to check the operation of access key authentication |
| FSS_TEST_ACCESSKEY_CORRECT_API_SECRET_KEY | Correct API Secret Key to check the normal operation of access key authentication |
| FSS_TEST_ACCESSKEY_INCORRECT_API_SECRET_KEY | Wrong API Secret Key to check for failing access key authentication behavior |
| FSS_TEST_RP_ID_FOR_LICENSE_TEST | RPID to use to verify operation in case of license abnormality. Please assign the RPID created by the free registered customer. The various information (users/credentials) of this RPID will be destroyed when the test case is executed, so please do not use the RPID you are using. |
| FSS_TEST_API_AUTH_ID_FOR_LICENSE_TEST | The API authentication ID for Nonce authentication to be used to check operation when license abnormalities |
| FSS_TEST_API_SECRET_KEY_FOR_LICENSE_TEST | The API secret key for Nonce authentication to be used to check operation when license abnormalities |