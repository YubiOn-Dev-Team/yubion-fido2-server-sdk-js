import { FssApiError, UserDataRegisterParameter, YubiOnFssSdk } from "../src";
import { sdkConfig } from "./test-common-info";

///////////////////////////////////////////////////////////////////////////////////////////////////////
// user test
///////////////////////////////////////////////////////////////////////////////////////////////////////

const testUsers : Array<UserDataRegisterParameter & { userName : string }> = [
	{
		userId : Buffer.from([...Array(64)].map((_, i) => i)).toString("base64url"),
		userName : "user1@example.com",
		displayName : "user 1",
		userAttributes : { "attr1" : "user1" },
		disabled : false,
	},
	{
		userId : Buffer.from([...Array(64)].map((_, i) => i + 1)).toString("base64url"),
		userName : "user2@example.com",
		displayName : "user 2",
		userAttributes : { "attr1" : "user2" },
		disabled : false,
	},
	{
		userId : Buffer.from([...Array(64)].map((_, i) => i + 2)).toString("base64url"),
		userName : "user3@example.com",
		displayName : "user 3",
		userAttributes : { "attr1" : "user3" },
		disabled : false,
	},
	{
		userId : Buffer.from([...Array(64)].map((_, i) => i + 3)).toString("base64url"),
		userName : "user4+disabled@example.com",
		displayName : "user 4",
		userAttributes : { "attr1" : "user4" },
		disabled : true,
	},
];

describe("YubiOnFssSdk user test", () => {
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
	test("getAllUsers", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		
		//default(Disabled users are not included.)
		const result1 = await sdk.getAllUsers();
		expect(result1).toHaveProperty("users");
		expect(result1.users).toHaveLength(3);
		expect(result1.users.filter((x) => x.disabled)).toHaveLength(0);
		
		const user1Ary = result1.users.filter((x) => x.userName == "user1@example.com");
		expect(user1Ary).toHaveLength(1);
		const user1 = user1Ary[0];
		expect(user1.userId).toEqual(Buffer.from([...Array(64)].map((_, i) => i)).toString("base64url"));
		expect(user1.userName).toBe("user1@example.com");
		expect(user1.displayName).toBe("user 1");
		expect(user1.userAttributes).toStrictEqual({"attr1" : "user1"});
		expect(user1.disabled).toBe(false);
		expect(user1.registered).toBeInstanceOf(Date);
		expect(user1.updated).toBeInstanceOf(Date);
		expect(user1.credentialCount).toBe(0);
		expect(user1.enabledCredentialCount).toBe(0);
		
		//with option(Disabled users are included.)
		const result2 = await sdk.getAllUsers(true);
		expect(result2).toHaveProperty("users");
		expect(result2.users).toHaveLength(4);
		expect(result2.users.filter((x) => x.disabled)).toHaveLength(1);
	});
	test("getUser", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		
		//default(Disabled users are not included.)
		const result1 = await sdk.getUser(testUsers[0].userId);
		expect(result1).toHaveProperty("user");
		const user1 = result1.user;

		expect(user1.userId).toEqual(testUsers[0].userId);
		expect(user1.userName).toBe(testUsers[0].userName);
		expect(user1.displayName).toBe(testUsers[0].displayName);
		expect(user1.userAttributes).toStrictEqual(testUsers[0].userAttributes);
		expect(user1.disabled).toBe(testUsers[0].disabled);
		expect(user1.registered).toBeInstanceOf(Date);
		expect(user1.updated).toBeInstanceOf(Date);
		expect(user1.credentialCount).toBe(0);
		expect(user1.enabledCredentialCount).toBe(0);
		
		expect(result1.signalCurrentUserDetailsOptions.userId).toEqual(testUsers[0].userId);
		expect(result1.signalCurrentUserDetailsOptions.rpId).toEqual(sdkConfig.rpId);
		expect(result1.signalCurrentUserDetailsOptions.name).toEqual(testUsers[0].userName);
		expect(result1.signalCurrentUserDetailsOptions.displayName).toEqual(testUsers[0].displayName);
		
		//default(Disabled users are not included.)
		try {
			await sdk.getUser(testUsers[3].userId);
			expect(true).toBe(false);
		} catch(ex : any){
			expect(ex).toBeInstanceOf(FssApiError);
			const e : FssApiError = ex;
			expect(e.appStatus).toBe("NOT_FOUND");
		}

		//with option(Disabled users are included.)
		const result2 = await sdk.getUser(testUsers[3].userId, true);
		expect(result2).toHaveProperty("user");
		expect(result2.user.userId).toEqual(testUsers[3].userId);
		
		//TODO: check withDisabledCredential option
	});
	test("getUsersByUserName", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		
		//default(Disabled users are not included.)
		const result1 = await sdk.getUsersByUserName(testUsers[0].userName);
		expect(result1).toHaveProperty("users");
		expect(result1.users).toHaveLength(1)
		const user1 = result1.users[0];

		expect(user1.userId).toEqual(testUsers[0].userId);
		expect(user1.userName).toBe(testUsers[0].userName);
		expect(user1.displayName).toBe(testUsers[0].displayName);
		expect(user1.userAttributes).toStrictEqual(testUsers[0].userAttributes);
		expect(user1.disabled).toBe(testUsers[0].disabled);
		expect(user1.registered).toBeInstanceOf(Date);
		expect(user1.updated).toBeInstanceOf(Date);
		expect(user1.credentialCount).toBe(0);
		expect(user1.enabledCredentialCount).toBe(0);
		
		//default(Disabled users are not included.)
		try {
			await sdk.getUsersByUserName(testUsers[3].userName);
			expect(true).toBe(false);
		} catch(ex : any){
			expect(ex).toBeInstanceOf(FssApiError);
			const e : FssApiError = ex;
			expect(e.appStatus).toBe("NOT_FOUND");
		}

		//with option(Disabled users are included.)
		const result2 = await sdk.getUsersByUserName(testUsers[3].userName, true);
		expect(result2).toHaveProperty("users");
		expect(result2.users).toHaveLength(1)
		expect(result2.users[0].userId).toEqual(testUsers[3].userId);
		
		//TODO: check same username records
	});
	test("registerUser", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		const baseUserPrm : UserDataRegisterParameter = {
			userId : Buffer.from([...Array(64)].map((_, i) => i + 10)).toString("base64url"),
			userName : "register_test@example.com",
			displayName : "register user",
			userAttributes : { "attr1":"user register"},
			disabled : false,
		};
		{
			const userPrm = structuredClone(baseUserPrm);
			const result = await sdk.registerUser(userPrm);
			expect(result).toHaveProperty("user");
			const user = result.user;
			expect(user.userId).toEqual(baseUserPrm.userId);
			expect(user.userName).toBe(baseUserPrm.userName);
			expect(user.displayName).toBe(baseUserPrm.displayName);
			expect(user.userAttributes).toStrictEqual(baseUserPrm.userAttributes);
			expect(user.disabled).toBe(baseUserPrm.disabled);
			expect(user.registered).toBeInstanceOf(Date);
			expect(user.updated).toBeInstanceOf(Date);
			expect(user.credentialCount).toBe(0);
			expect(user.enabledCredentialCount).toBe(0);
			await sdk.deleteUser(user.userId);
		}
		{
			//duplicated id
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = Buffer.from([...Array(64)].map((_, i) => i)).toString("base64url");
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("ALREADY_EXISTS");
			}
		}
		{
			//empty id
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = "";
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//not base64url id
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = "!!!";
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//too long id
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = Buffer.from([...Array(65)].map((_, i) => i + 10)).toString("base64url");
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//too long id(2)
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//empty name
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userName = "";
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//duplicated user name
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userName = testUsers[0].userName;
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("DUPLICATED");
			}
		}
		{
			//null displayName
			const userPrm = structuredClone(baseUserPrm);
			userPrm.displayName = null;
			const result = await sdk.registerUser(userPrm);
			expect(result.user.displayName).toBeNull();
			await sdk.deleteUser(result.user.userId);
		}
		{
			//null attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = null;
			const result = await sdk.registerUser(userPrm);
			expect(result.user.userAttributes).toBeNull();
			await sdk.deleteUser(result.user.userId);
		}
		{
			//json-object string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "{\"attr1\":\"user register\"}";
			const result = await sdk.registerUser(userPrm);
			expect(result.user.userAttributes).toStrictEqual({"attr1" : "user register"});
			await sdk.deleteUser(result.user.userId);
		}
		{
			//json-string string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "\"user register\"";
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//json-number string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "333";
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//json-array string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "[\"user register\"]";
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//json-null string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "null";
			const result = await sdk.registerUser(userPrm);
			expect(result.user.userAttributes).toBeNull();
			await sdk.deleteUser(result.user.userId);
		}
		{
			//json-badformat string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "{,,,,,,,,,,}";
			try {
				await sdk.registerUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
	});
	test("updateUser", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		const baseUserPrm : UserDataRegisterParameter = {
			userId : Buffer.from([...Array(64)].map((_, i) => i + 20)).toString("base64url"),
			userName : "update_user@example.com",
			displayName : "update user",
			userAttributes : { "attr1":"user update"},
			disabled : false,
		};
		try{
			await sdk.deleteUser(baseUserPrm.userId);
		} catch {}
		//更新対象レコード準備
		await sdk.registerUser(baseUserPrm);
		{
			//non-exists user
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = Buffer.from([...Array(64)].map((_, i) => i * 2)).toString("base64url")
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		{
			//empty id
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = "";
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//not base64url id
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = "!!!";
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//too long id
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = Buffer.from([...Array(65)].map((_, i) => i + 20)).toString("base64url");
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//too long id(2)
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//update name
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userName = "user_updated@example.com";
			const result1 = await sdk.updateUser(userPrm);
			expect(result1.user.userName).toBe("user_updated@example.com");
			
			expect(result1.signalCurrentUserDetailsOptions.userId).toEqual(baseUserPrm.userId);
			expect(result1.signalCurrentUserDetailsOptions.rpId).toEqual(sdkConfig.rpId);
			expect(result1.signalCurrentUserDetailsOptions.name).toEqual("user_updated@example.com");
			expect(result1.signalCurrentUserDetailsOptions.displayName).toEqual(baseUserPrm.displayName);
			
			userPrm.userName = baseUserPrm.userName;
			const result2 = await sdk.updateUser(userPrm);
			expect(result2.user.userName).toBe(baseUserPrm.userName);
			expect(result2.user.registered).toEqual(result1.user.registered);
			expect(result2.user.updated).not.toEqual(result1.user.updated);

		}
		{
			//empty name
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userName = "";
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//duplicated user name
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userName = testUsers[0].userName;
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("DUPLICATED");
			}
		}
		{
			//update displayname
			const userPrm = structuredClone(baseUserPrm);
			userPrm.displayName = "already updated user";
			const result1 = await sdk.updateUser(userPrm);
			expect(result1.user.displayName).toBe("already updated user");
			
			userPrm.displayName = baseUserPrm.displayName;
			const result2 = await sdk.updateUser(userPrm);
			expect(result2.user.displayName).toBe(baseUserPrm.displayName);
			expect(result2.user.registered).toEqual(result1.user.registered);
			expect(result2.user.updated).not.toEqual(result1.user.updated);
		}
		{
			//null displayName
			const userPrm = structuredClone(baseUserPrm);
			userPrm.displayName = null;
			const result = await sdk.updateUser(userPrm);
			expect(result.user.displayName).toBeNull();
			userPrm.displayName = baseUserPrm.displayName;
			await sdk.updateUser(userPrm);
		}
		{
			//null attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = null;
			const result = await sdk.updateUser(userPrm);
			expect(result.user.userAttributes).toBeNull();
			userPrm.userAttributes = baseUserPrm.userAttributes;
			await sdk.updateUser(userPrm);
		}
		{
			//json-object string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "{\"attr1\":\"user updated\"}";
			const result = await sdk.updateUser(userPrm);
			expect(result.user.userAttributes).toStrictEqual({"attr1" : "user updated"});
			userPrm.userAttributes = baseUserPrm.userAttributes;
			await sdk.updateUser(userPrm);
		}
		{
			//json-string string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "\"user updated\"";
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//json-number string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "333";
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//json-array string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "[\"user updated\"]";
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//json-null string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "null";
			const result = await sdk.updateUser(userPrm);
			expect(result.user.userAttributes).toBeNull();
			userPrm.userAttributes = baseUserPrm.userAttributes;
			await sdk.updateUser(userPrm);
		}
		{
			//json-badformat string attributes
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userAttributes = "{,,,,,,,,,,}";
			try {
				await sdk.updateUser(userPrm);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("PARAMETER_ERROR");
			}
		}
		{
			//disabled to true/false
			const userPrm = structuredClone(baseUserPrm);
			userPrm.disabled = true;
			const result1 = await sdk.updateUser(userPrm);
			expect(result1.user.disabled).toBe(true);
			userPrm.disabled = false;
			const result2 = await sdk.updateUser(userPrm);
			expect(result2.user.disabled).toBe(false);
		}
		{
			//check updated
			const userPrm = await sdk.getUser(testUsers[0].userId);
			try {
				userPrm.user.updated = new Date();
				await sdk.updateUser(userPrm.user, true);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("UPDATE_ERROR");
			}
		}
		{
			//check updated
			const userPrm = await sdk.getUser(testUsers[0].userId);
			//userPrm.user.updated = new Date();
			const updated = await sdk.updateUser(userPrm.user, true);
			expect(updated.user.updated).not.toBe(userPrm.user.updated);
		}
		await sdk.deleteUser(baseUserPrm.userId);
	});
	test("deleteUser", async () => {
		const sdk = new YubiOnFssSdk(sdkConfig);
		const baseUserPrm : UserDataRegisterParameter = {
			userId : Buffer.from([...Array(64)].map((_, i) => i + 30)).toString("base64url"),
			userName : "delete_user@example.com",
			displayName : "delete user",
			userAttributes : { "attr1":"user delete"},
			disabled : false,
		};
		try {
			await sdk.deleteUser(baseUserPrm.userId);
		} catch {}
		await sdk.registerUser(baseUserPrm);
		{
			//non-exists user
			const userPrm = structuredClone(baseUserPrm);
			userPrm.userId = Buffer.from([...Array(64)].map((_, i) => i * 2)).toString("base64url")
			try {
				await sdk.deleteUser(userPrm.userId);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		{
			//exists user
			const userPrm = structuredClone(baseUserPrm);
			const result1 = await sdk.deleteUser(userPrm.userId);
			expect(result1.user.userName).toBe(baseUserPrm.userName);

			try {
				await sdk.getUser(userPrm.userId);
				expect(true).toBe(false);
			} catch(ex : any){
				expect(ex).toBeInstanceOf(FssApiError);
				const e : FssApiError = ex;
				expect(e.appStatus).toBe("NOT_FOUND");
			}
		}
		//await sdk.deleteUser(baseUserPrm.userId);
	});
});
