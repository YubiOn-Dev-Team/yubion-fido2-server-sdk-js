export type FssApiAuthType = "NonceSignAuth" | "DatetimeSignAuth" | "AccessKeyAuth";;
export type FssSdkConfigParameter = {
	endpoint? : string,
	rpId : string,
	apiAuthId : string,
	apiAuthType : FssApiAuthType,
	secretKey : string,
	agent? : string,
}

export type FssSdkConfig = {
	endpoint : string,
	rpId : string,
	apiAuthId : string,
	apiAuthType :  FssApiAuthType,
	secretKey : string,
	agent : string,
}
export function convertConfig(configBase : FssSdkConfigParameter) : FssSdkConfig {
	return {
		endpoint : configBase.endpoint ?? "https://fss.yubion.com/api/",
		agent : configBase.agent ?? "yubion-fido2-server-sdk-js",
		...configBase,
	};
}