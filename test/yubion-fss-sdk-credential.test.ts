import { start } from "repl";
import { CredentialDataUpdateParameter, FssApiError, UserDataRegisterParameter, YubiOnFssSdk } from "../src";
import { sdkConfig } from "./test-common-info";
import WebAuthnEmulator, { AuthenticatorEmulator, PasskeysCredentialsMemoryRepository } from "nid-webauthn-emulator";
import { convertCreationOptionsToBinary, convertPublicKeyCredentialToJsonable, convertRequestOptionsToBinary } from "./fido-interface-converter";

///////////////////////////////////////////////////////////////////////////////////////////////////////
// fido test
///////////////////////////////////////////////////////////////////////////////////////////////////////

const testUsers : Array<UserDataRegisterParameter> = [
	{
		userId : Buffer.from([...Array(64)].map((_, i) => i + 40)).toString("base64url"),
		userName : "user1@example.com",
		displayName : "user 1",
		userAttributes : { "attr1" : "user1" },
		disabled : false,
	},
	{
		userId : Buffer.from([...Array(64)].map((_, i) => i + 41)).toString("base64url"),
		userName : "user2@example.com",
		displayName : "user 2",
		userAttributes : { "attr1" : "user2" },
		disabled : false,//クレデンシャル登録後にtrueに変更する
	},
];
const testCreds : Array<CredentialDataUpdateParameter> = [
	{
		userId : testUsers[0].userId,
		credentialId : "",//set after test data registered
		credentialName : "user 1 - credential 1",
		credentialAttributes : { "cred-attr1" : "user1-cred1-attr1", "cred-attr2" : "user1-cred1-attr2", },
		disabled : false,
	},
	{
		userId : testUsers[0].userId,
		credentialId : "",//set after test data registered
		credentialName : "user 1 - credential 2",
		credentialAttributes : { "cred-attr1" : "user2-cred1-attr1", "cred-attr2" : "user2-cred1-attr2", },
		disabled : false,
	},
	{
		userId : testUsers[0].userId,
		credentialId : "",//set after test data registered
		credentialName : "user 1 - credential 2",
		credentialAttributes : { "cred-attr1" : "user2-cred1-attr1", "cred-attr2" : "user2-cred1-attr2", },
		disabled : true,//set after test data registered
	},
	{
		userId : testUsers[1].userId,
		credentialId : "",//set after test data registered
		credentialName : "user 2 - credential 1",
		credentialAttributes : { "cred-attr1" : "user2-cred1-attr1", "cred-attr2" : "user2-cred1-attr2", },
		disabled : false,
	},
]

describe("YubiOnFssSdk credential test", () => {
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
		//register test creds
		const credRep = new PasskeysCredentialsMemoryRepository();
		const authenticator = new AuthenticatorEmulator({
			credentialsRepository: credRep,
		});
		
		const emulator = new WebAuthnEmulator(authenticator);
		const origin = "https://" + sdk.getRpId();
		for(const cred of testCreds){

			const startResponse = await sdk.startRegisterCredential({
				creationOptionsBase:{},
				user : {
					userId : cred.userId,
				}
			});
			const createResult = emulator.create(origin, {publicKey : convertCreationOptionsToBinary(startResponse.creationOptions)});
			const createResultJson = convertPublicKeyCredentialToJsonable(createResult);
			const finishResponse = await sdk.finishRegisterCredential({
				createResponse : {
					attestationResponse : createResultJson,
				},
			}, startResponse.session);
			cred.credentialId = finishResponse.credential.credentialId;

			await sdk.updateCredential(cred, false);
			//クレデンシャルを複数登録できるように記憶を消す
			credRep.loadCredentials().forEach((x) => credRep.deleteCredential(x));
		}
		testUsers[1].disabled = true;
		await sdk.updateUser(testUsers[1]);
	});
	test("getCredential", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		{
			try {
				await sdk.getCredential("hoge", testCreds[0].credentialId);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		{
			try {
				await sdk.getCredential(testCreds[0].userId, "hoge");
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		{
			const cred = await sdk.getCredential(testCreds[0].userId, testCreds[0].credentialId);
			expect(cred.user.userId).toBe(testUsers[0].userId);
			expect(cred.user.userName).toBe(testUsers[0].userName);
			expect(cred.user.displayName).toBe(testUsers[0].displayName);
			expect(cred.user.userAttributes).toStrictEqual(testUsers[0].userAttributes);
			expect(cred.user.disabled).toBe(testUsers[0].disabled);
			expect(cred.credential.userId).toBe(testCreds[0].userId);
			expect(cred.credential.credentialId).toBe(testCreds[0].credentialId);
			expect(cred.credential.credentialName).toBe(testCreds[0].credentialName);
			expect(cred.credential.credentialAttributes).toStrictEqual(testCreds[0].credentialAttributes);
			expect(cred.credential.disabled).toBe(testCreds[0].disabled);
		}
		{
			try {
				await sdk.getCredential(testCreds[3].userId, testCreds[3].credentialId);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		{
			const cred = await sdk.getCredential(testCreds[3].userId, testCreds[3].credentialId, true);
			expect(cred.user.userId).toBe(testUsers[1].userId);
			expect(cred.user.userName).toBe(testUsers[1].userName);
			expect(cred.user.displayName).toBe(testUsers[1].displayName);
			expect(cred.user.userAttributes).toStrictEqual(testUsers[1].userAttributes);
			expect(cred.user.disabled).toBe(testUsers[1].disabled);
			expect(cred.credential.userId).toBe(testCreds[3].userId);
			expect(cred.credential.credentialId).toBe(testCreds[3].credentialId);
			expect(cred.credential.credentialName).toBe(testCreds[3].credentialName);
			expect(cred.credential.credentialAttributes).toStrictEqual(testCreds[3].credentialAttributes);
			expect(cred.credential.disabled).toBe(testCreds[3].disabled);
		}
		{
			try {
				await sdk.getCredential(testCreds[2].userId, testCreds[2].credentialId);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		{
			const cred = await sdk.getCredential(testCreds[2].userId, testCreds[2].credentialId, false, true);
			expect(cred.user.userId).toBe(testUsers[0].userId);
			expect(cred.user.userName).toBe(testUsers[0].userName);
			expect(cred.user.displayName).toBe(testUsers[0].displayName);
			expect(cred.user.userAttributes).toStrictEqual(testUsers[0].userAttributes);
			expect(cred.user.disabled).toBe(testUsers[0].disabled);
			expect(cred.credential.userId).toBe(testCreds[2].userId);
			expect(cred.credential.credentialId).toBe(testCreds[2].credentialId);
			expect(cred.credential.credentialName).toBe(testCreds[2].credentialName);
			expect(cred.credential.credentialAttributes).toStrictEqual(testCreds[2].credentialAttributes);
			expect(cred.credential.disabled).toBe(testCreds[2].disabled);
		}
	});
	test("updateCredential", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		{
			try {
				await sdk.updateCredential({
					userId : "hoge",
					credentialId : testCreds[0].credentialId,
					credentialName : testCreds[0].credentialName,
					credentialAttributes : testCreds[0].credentialAttributes,
					disabled : testCreds[0].disabled,
				});
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		{
			try {
				await sdk.updateCredential({
					userId : testCreds[0].userId,
					credentialId : "hoge",
					credentialName : testCreds[0].credentialName,
					credentialAttributes : testCreds[0].credentialAttributes,
					disabled : testCreds[0].disabled,
				});
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		{
			//update cred name to empty
			const credPrm = structuredClone(testCreds[0]);
			credPrm.credentialName = "";
			try {
				await sdk.updateCredential(credPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
			//await sdk.updateCredential(testCreds[0]);
		}
		{
			//update cred name
			const credPrm = structuredClone(testCreds[0]);
			credPrm.credentialName = "updated";
			const result = await sdk.updateCredential(credPrm);
			expect(result.credential.credentialName).toBe(credPrm.credentialName);
			await sdk.updateCredential(testCreds[0]);
		}
		{
			//null attributes
			const credPrm = structuredClone(testCreds[0]);
			credPrm.credentialAttributes = null;
			const result = await sdk.updateCredential(credPrm);
			expect(result.credential.credentialAttributes).toBeNull();
			await sdk.updateCredential(testCreds[0]);
		}
		{
			//json-object string attributes
			const credPrm = structuredClone(testCreds[0]);
			credPrm.credentialAttributes = "{\"attr1\":\"cred updated\"}";
			const result = await sdk.updateCredential(credPrm);
			expect(result.credential.credentialAttributes).toStrictEqual({"attr1":"cred updated"});
			await sdk.updateCredential(testCreds[0]);
		}
		{
			//json-string string attributes
			const credPrm = structuredClone(testCreds[0]);
			credPrm.credentialAttributes = "\"user updated\"";
			try {
				await sdk.updateCredential(credPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//json-number string attributes
			const credPrm = structuredClone(testCreds[0]);
			credPrm.credentialAttributes = "333";
			try {
				await sdk.updateCredential(credPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//json-array string attributes
			const credPrm = structuredClone(testCreds[0]);
			credPrm.credentialAttributes = "[\"user updated\"]";
			try {
				await sdk.updateCredential(credPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//json-null string attributes
			const credPrm = structuredClone(testCreds[0]);
			credPrm.credentialAttributes = "null";
			const result = await sdk.updateCredential(credPrm);
			expect(result.credential.credentialAttributes).toBeNull();
			await sdk.updateCredential(testCreds[0]);
		}
		{
			//json-badformat string attributes
			const credPrm = structuredClone(testCreds[0]);
			credPrm.credentialAttributes = "{,,,,,,,,,,}";
			try {
				await sdk.updateCredential(credPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//updated check
			try {
				await sdk.updateCredential({
					userId : testCreds[0].userId,
					credentialId : testCreds[0].credentialId,
					credentialName : "updated",
					credentialAttributes : testCreds[0].credentialAttributes,
					disabled : testCreds[0].disabled,
					updated : new Date(),
				}, true);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("UPDATE_ERROR");
			}
		}
	});
	test("deleteCredential", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		{
			try {
				await sdk.deleteCredential("hoge", testCreds[0].credentialId);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		{
			try {
				await sdk.deleteCredential(testCreds[0].userId, "hoge");
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		{
			const beforeDeleteUser = await sdk.getUser(testCreds[0].userId);
			expect(beforeDeleteUser.credentials.filter((x) => x.credentialId == testCreds[0].credentialId)).toHaveLength(1);

			const result = await sdk.deleteCredential(testCreds[0].userId, testCreds[0].credentialId);
			expect(result.user.userId).toBe(testUsers[0].userId);
			expect(result.user.userName).toBe(testUsers[0].userName);
			expect(result.user.displayName).toBe(testUsers[0].displayName);
			expect(result.user.userAttributes).toStrictEqual(testUsers[0].userAttributes);
			expect(result.user.disabled).toBe(testUsers[0].disabled);
			expect(result.credential.userId).toBe(testCreds[0].userId);
			expect(result.credential.credentialId).toBe(testCreds[0].credentialId);
			expect(result.credential.credentialName).toBe(testCreds[0].credentialName);
			expect(result.credential.credentialAttributes).toStrictEqual(testCreds[0].credentialAttributes);
			expect(result.credential.disabled).toBe(testCreds[0].disabled);

			const deletedUser = await sdk.getUser(testCreds[0].userId);
			expect(deletedUser.credentials.filter((x) => x.credentialId == testCreds[0].credentialId)).toHaveLength(0);
		}
	});
});
