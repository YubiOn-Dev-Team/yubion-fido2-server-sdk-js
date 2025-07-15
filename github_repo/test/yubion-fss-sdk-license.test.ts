import WebAuthnEmulator from "nid-webauthn-emulator";
import { FssApiAuthType, FssApiError, FssSdkConfigParameter, UserDataRegisterParameter, YubiOnFssSdk } from "../src/";
import { sdkConfig_accesskey_ng, sdkConfig_accesskey_ok, sdkConfig_datetime_ng, sdkConfig_datetime_ok, sdkConfig_licenseTest, sdkConfig_nonce_ng, sdkConfig_nonce_ok, sdkConfigBase, sdkConfigBase_licenseTest } from "./test-common-info";
import { convertCreationOptionsToBinary, convertPublicKeyCredentialToJsonable } from "./fido-interface-converter";


///////////////////////////////////////////////////////////////////////////////////////////////////////
// license test
///////////////////////////////////////////////////////////////////////////////////////////////////////
const users : Array<UserDataRegisterParameter> = [...Array(20).keys()].map(i => ({
	userId : Buffer.from([...Array(64)].map((_, j) => (j * 7 + i) % 256)).toString("base64url"),
	userName : `user${i}@example.com`,
	displayName : `user ${i}`,
	userAttributes : { "attr1" : `user${i}` },
	disabled : false,
}));

describe("YubiOnFssSdk license test", () => {
	beforeEach(async () => {
		const sdk = new YubiOnFssSdk({...sdkConfigBase_licenseTest, ...sdkConfig_licenseTest});
		//delete all user
		const resp = await sdk.getAllUsers(true);
		for(const user of resp.users){
			await sdk.deleteUser(user.userId);
		}
	});
	
	test("register user limitation", async () => {
		const sdk = new YubiOnFssSdk({...sdkConfigBase_licenseTest, ...sdkConfig_licenseTest});
		//Up to 10 users can be registered.
		for(let i = 0; i < 10; ++i){
			const user = await sdk.registerUser(users[i]);
			expect(user).not.toBeNull();
		}
		
		//Over 10 users cannot be registered.
		try {
			await sdk.registerUser(users[10]);
			expect(false).toBe(true);
		} catch(ex : any){
			expect(ex).toBeInstanceOf(FssApiError);
			const e : FssApiError = ex;
			expect(e.appStatus).toBe("LICENSE_ERROR");
		}
		
	});
	test("register credential with user limitation", async () => {
		const sdk = new YubiOnFssSdk({...sdkConfigBase_licenseTest, ...sdkConfig_licenseTest});
		//Up to 10 users can be registered.
		const emulator = new WebAuthnEmulator();
		const origin = "https://" + sdk.getRpId();
		for(let i = 0; i < 10; ++i){
			const startResponse = await sdk.startRegisterCredential({
				creationOptionsBase:{},
				user : users[i],
				options:{
					createUserIfNotExists : true,
				}
			});
			expect(startResponse).not.toBeNull();
			
			const createResult = emulator.create(origin, {publicKey : convertCreationOptionsToBinary(startResponse.creationOptions)});
			const createResultJson = convertPublicKeyCredentialToJsonable(createResult);
			const finishResponse = await sdk.finishRegisterCredential({
				createResponse : {
					attestationResponse : createResultJson,
				},
			}, startResponse.session);
			expect(finishResponse).not.toBeNull();
		}
		
		//Over 10 users cannot be registered.
		try {
			await sdk.startRegisterCredential({
				creationOptionsBase:{},
				user : users[10],
				options:{
					createUserIfNotExists : true,
				}
			});
			expect(false).toBe(true);
		} catch(ex : any){
			expect(ex).toBeInstanceOf(FssApiError);
			const e : FssApiError = ex;
			expect(e.appStatus).toBe("LICENSE_ERROR");
		}
	});
});