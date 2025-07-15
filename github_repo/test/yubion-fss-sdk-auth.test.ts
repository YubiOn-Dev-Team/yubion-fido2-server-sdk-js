import { FssApiAuthType, FssApiError, FssSdkConfigParameter, UserDataRegisterParameter, YubiOnFssSdk } from "../src/";
import { sdkConfig_accesskey_ng, sdkConfig_accesskey_ok, sdkConfig_datetime_ng, sdkConfig_datetime_ok, sdkConfig_nonce_ng, sdkConfig_nonce_ok, sdkConfigBase } from "./test-common-info";


///////////////////////////////////////////////////////////////////////////////////////////////////////
// auth test
///////////////////////////////////////////////////////////////////////////////////////////////////////
describe("YubiOnFssSdk auth test", () => {
	test("nonce auth success", async () => {
		const sdk = new YubiOnFssSdk({...sdkConfigBase, ...sdkConfig_nonce_ok});
		await expect(sdk.getAllUsers()).resolves.not.toBeNull();
	});
	test("nonce auth fail", async () => {
		const sdk = new YubiOnFssSdk({...sdkConfigBase, ...sdkConfig_nonce_ng});
		await expect(sdk.getAllUsers()).rejects.toThrow();
	});
	test("datetime auth success", async () => {
		const sdk = new YubiOnFssSdk({...sdkConfigBase, ...sdkConfig_datetime_ok});
		await expect(sdk.getAllUsers()).resolves.not.toBeNull();
	});
	test("datetime auth fail", async () => {
		const sdk = new YubiOnFssSdk({...sdkConfigBase, ...sdkConfig_datetime_ng});
		await expect(sdk.getAllUsers()).rejects.toThrow();
	});
	test("accesskey auth success", async () => {
		const sdk = new YubiOnFssSdk({...sdkConfigBase, ...sdkConfig_accesskey_ok});
		await expect(sdk.getAllUsers()).resolves.not.toBeNull();
	});
	test("accesskey auth fail", async () => {
		const sdk = new YubiOnFssSdk({...sdkConfigBase, ...sdkConfig_accesskey_ng});
		await expect(sdk.getAllUsers()).rejects.toThrow();
	});
});



