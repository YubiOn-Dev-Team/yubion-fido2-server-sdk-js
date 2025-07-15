import { FssApiAuthType } from "../src";
import * as dotenv from "dotenv";

dotenv.config();
if(
	!process.env.FSS_TEST_RP_ID
	|| !process.env.FSS_TEST_NONCE_API_AUTH_ID
	|| !process.env.FSS_TEST_NONCE_CORRECT_API_SECRET_KEY
	|| !process.env.FSS_TEST_NONCE_INCORRECT_API_SECRET_KEY
	|| !process.env.FSS_TEST_DATETIME_API_AUTH_ID
	|| !process.env.FSS_TEST_DATETIME_CORRECT_API_SECRET_KEY
	|| !process.env.FSS_TEST_DATETIME_INCORRECT_API_SECRET_KEY
	|| !process.env.FSS_TEST_ACCESSKEY_API_AUTH_ID
	|| !process.env.FSS_TEST_ACCESSKEY_CORRECT_API_SECRET_KEY
	|| !process.env.FSS_TEST_ACCESSKEY_INCORRECT_API_SECRET_KEY
	|| !process.env.FSS_TEST_RP_ID_FOR_LICENSE_TEST
	|| !process.env.FSS_TEST_API_AUTH_ID_FOR_LICENSE_TEST
	|| !process.env.FSS_TEST_API_SECRET_KEY_FOR_LICENSE_TEST
){
	throw new Error("require environment variable FSS_TEST_RP_ID,"
		+ ",FSS_TEST_NONCE_API_AUTH_ID"
		+ ",FSS_TEST_NONCE_CORRECT_API_SECRET_KEY"
		+ ",FSS_TEST_NONCE_INCORRECT_API_SECRET_KEY"
		+ ",FSS_TEST_DATETIME_API_AUTH_ID"
		+ ",FSS_TEST_DATETIME_CORRECT_API_SECRET_KEY"
		+ ",FSS_TEST_DATETIME_INCORRECT_API_SECRET_KEY"
		+ ",FSS_TEST_ACCESSKEY_API_AUTH_ID"
		+ ",FSS_TEST_ACCESSKEY_CORRECT_API_SECRET_KEY"
		+ ",FSS_TEST_ACCESSKEY_INCORRECT_API_SECRET_KEY"
		+ ",FSS_TEST_RP_ID_FOR_LICENSE_TEST"
		+ ",FSS_TEST_API_AUTH_ID_FOR_LICENSE_TEST"
		+ ",FSS_TEST_API_SECRET_KEY_FOR_LICENSE_TEST"
		+ ".");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// connection info
///////////////////////////////////////////////////////////////////////////////////////////////////////
export interface AuthInfo {
	apiAuthId:string,
	apiAuthType:FssApiAuthType,
	secretKey:string,
}
export const sdkConfigBase = {
	endpoint : process.env.FSS_TEST_ENDPOINT ?? undefined,
	rpId : process.env.FSS_TEST_RP_ID,
};
export const sdkConfig_nonce_ok : AuthInfo = {
	apiAuthId : process.env.FSS_TEST_NONCE_API_AUTH_ID,
	apiAuthType : "NonceSignAuth",
	secretKey : process.env.FSS_TEST_NONCE_CORRECT_API_SECRET_KEY,
};
export const sdkConfig_nonce_ng : AuthInfo = {
	apiAuthId : process.env.FSS_TEST_NONCE_API_AUTH_ID,
	apiAuthType : "NonceSignAuth",
	secretKey : process.env.FSS_TEST_NONCE_INCORRECT_API_SECRET_KEY,
};
export const sdkConfig_datetime_ok : AuthInfo = {
	apiAuthId : process.env.FSS_TEST_DATETIME_API_AUTH_ID,
	apiAuthType : "DatetimeSignAuth",
	secretKey : process.env.FSS_TEST_DATETIME_CORRECT_API_SECRET_KEY,
};
export const sdkConfig_datetime_ng : AuthInfo = {
	apiAuthId : process.env.FSS_TEST_DATETIME_API_AUTH_ID,
	apiAuthType : "DatetimeSignAuth",
	secretKey : process.env.FSS_TEST_DATETIME_INCORRECT_API_SECRET_KEY,
};
export const sdkConfig_accesskey_ok : AuthInfo = {
	apiAuthId : process.env.FSS_TEST_ACCESSKEY_API_AUTH_ID,
	apiAuthType : "AccessKeyAuth",
	secretKey : process.env.FSS_TEST_ACCESSKEY_CORRECT_API_SECRET_KEY,
};
export const sdkConfig_accesskey_ng : AuthInfo = {
	apiAuthId : process.env.FSS_TEST_ACCESSKEY_API_AUTH_ID,
	apiAuthType : "AccessKeyAuth",
	secretKey : process.env.FSS_TEST_ACCESSKEY_INCORRECT_API_SECRET_KEY,
};
export const sdkConfig = {...sdkConfigBase, ...sdkConfig_nonce_ok};

export const sdkConfigBase_licenseTest = {
	endpoint : process.env.FSS_TEST_ENDPOINT ?? undefined,
	rpId : process.env.FSS_TEST_RP_ID_FOR_LICENSE_TEST,
};
export const sdkConfig_licenseTest : AuthInfo = {
	apiAuthId : process.env.FSS_TEST_API_AUTH_ID_FOR_LICENSE_TEST,
	apiAuthType : "NonceSignAuth",
	secretKey : process.env.FSS_TEST_API_SECRET_KEY_FOR_LICENSE_TEST,
};

export const sdkConfig_allow_duplicate_user_rp = {};//TODO