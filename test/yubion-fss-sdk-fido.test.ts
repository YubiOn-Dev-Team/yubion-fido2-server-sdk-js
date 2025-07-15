import { start } from "repl";
import { FssApiError, UserDataRegisterParameter, YubiOnFssSdk } from "../src";
import { sdkConfig } from "./test-common-info";
import WebAuthnEmulator from "nid-webauthn-emulator";
import { convertCreationOptionsToBinary, convertPublicKeyCredentialToJsonable, convertRequestOptionsToBinary } from "./fido-interface-converter";

///////////////////////////////////////////////////////////////////////////////////////////////////////
// fido test
///////////////////////////////////////////////////////////////////////////////////////////////////////

const testUsers : Array<UserDataRegisterParameter> = [
	{
		userId : Buffer.from([...Array(64)].map((_, i) => i + 30)).toString("base64url"),
		userName : "user1@example.com",
		displayName : "user 1",
		userAttributes : { "attr1" : "user1" },
		disabled : false,
	},
	{
		userId : Buffer.from([...Array(64)].map((_, i) => i + 31)).toString("base64url"),
		userName : "user2@example.com",
		displayName : "user 2",
		userAttributes : { "attr1" : "user2" },
		disabled : false,
	},
	{
		userId : Buffer.from([...Array(64)].map((_, i) => i + 32)).toString("base64url"),
		userName : "user3@example.com",
		displayName : "user 3",
		userAttributes : { "attr1" : "user3" },
		disabled : false,
	},
	{
		userId : Buffer.from([...Array(64)].map((_, i) => i + 33)).toString("base64url"),
		userName : "user4+disabled@example.com",
		displayName : "user 4",
		userAttributes : { "attr1" : "user4" },
		disabled : true,
	},
];

describe("YubiOnFssSdk fido test", () => {
	beforeAll(async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		//delete all user
		const resp = await sdk.getAllUsers(true);
		for(const user of resp.users){
			await sdk.deleteUser(user.userId);
		}
		//register test user
		for(const user of testUsers){
			await sdk.registerUser(user);
		}
	});
	test("register", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		{
			try {
				await sdk.startRegisterCredential({} as any);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			const emulator = new WebAuthnEmulator();
			const origin = "https://" + sdk.getRpId();

			const startResponse = await sdk.startRegisterCredential({
				creationOptionsBase:{},
				user : {
					userId : testUsers[0].userId,
				}
			});
			expect(startResponse).not.toBeNull();
			
			const createResult = emulator.create(origin, {publicKey : convertCreationOptionsToBinary(startResponse.creationOptions)});
			const createResultJson = convertPublicKeyCredentialToJsonable(createResult);
			const verifyResponse = await sdk.verifyRegisterCredential({
				createResponse : {
					attestationResponse : createResultJson,
				},
			}, startResponse.session);
			
			expect(verifyResponse).not.toBeNull();
			const finishResponse = await sdk.finishRegisterCredential({
				createResponse : {
					attestationResponse : createResultJson,
				},
			}, startResponse.session);
			expect(finishResponse).not.toBeNull();
			
			const user = await sdk.getUser(testUsers[0].userId);
			expect(user.credentials).toHaveLength(1);
		}
	});
	test("authenticate", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		{
			const emulator = new WebAuthnEmulator();
			const origin = "https://" + sdk.getRpId();

			const startRegisterResponse = await sdk.startRegisterCredential({
				creationOptionsBase:{},
				user : {
					userId : testUsers[1].userId,
				}
			});
			expect(startRegisterResponse).not.toBeNull();
			
			const createResult = emulator.create(origin, {publicKey : convertCreationOptionsToBinary(startRegisterResponse.creationOptions)});
			const createResultJson = convertPublicKeyCredentialToJsonable(createResult);
			const finishResponse = await sdk.finishRegisterCredential({
				createResponse : {
					attestationResponse : createResultJson,
				},
			}, startRegisterResponse.session);
			expect(finishResponse).not.toBeNull();
			
			const user = await sdk.getUser(testUsers[1].userId);
			expect(user.credentials).toHaveLength(1);
			
			const startAuthenticateResponse = await sdk.startAuthenticate({
				requestOptionsBase:{},
				userId : testUsers[1].userId,
			});
			
			const requestResult = emulator.get(origin, {publicKey : convertRequestOptionsToBinary(startAuthenticateResponse.requestOptions)});
			const requestResultJson = convertPublicKeyCredentialToJsonable(requestResult);
			const finishAuthenticateResponse = await sdk.finishAuthenticate({
				requestResponse : {
					attestationResponse : requestResultJson,
				},
			}, startAuthenticateResponse.session);
			expect(finishAuthenticateResponse).not.toBeNull();
			
			
		}
	});
});
