import { FssApiResultStatus } from "./fss-api-result-status";
export type FssApiErrorSubStatus = {
	errorCode? : Fido2ErrorStatus, 
	errorMessage? : string,
	info? : any,
};
export interface FssApiErrorOptions extends ErrorOptions {
	appStatus : FssApiResultStatus;
	appSubStatus? : FssApiErrorSubStatus;
};
export type Fido2ErrorStatus = 
	"USER_NOT_FOUND"
	| "REQUIRE_USER_NAME"
	| "REQUIRE_USER_ID_OR_USER_HANDLE"
	| "USER_IS_DISABLED"
	| "USER_HANDLE_NOT_MATCH"
	| "CREDENTIAL_NOT_FOUND"
	| "REQUIRE_CREDENTIAL_ID"
	| "CREDENTIAL_IS_DISABLED"
	| "CREDENTIAL_ID_MISMATCH"
	| "BAD_CREDENTIAL_TYPE"
	| "CREDENTIAL_ALREADY_REGISTERED"
	| "CLIENT_DATA_JSON_PARSE_FAILED"
	| "REQUIRE_ATTESTED_CREDENTIAL_DATA"
	| "BAD_REQUEST_TYPE"
	| "RP_NOT_FOUND"
	| "RP_ID_HASH_MISMATCH"
	| "ORIGIN_NOT_ALLOWED"
	| "REQUIRE_USER_VERIFICATION"
	| "LICENSE_LIMIT_EXCEEDED"
	| "INTERNAL_ERROR"	//Core側での例外
	| "UNEXPECTED_ERROR"	//その他例外
	| "INVALID_SESSION"
;
/**
 * Api error exception
 */
export class FssApiError extends Error {
	/** api result status */
	appStatus : FssApiResultStatus;
	/** api result substatus */
	appSubStatus? : FssApiErrorSubStatus;
	/**
	 * constructor
	 * @param message 
	 * @param options 
	 */
	constructor(message: string = "", options: FssApiErrorOptions = { appStatus : "UNEXPECTED_ERROR" }){
		super(message, options);
		this.name = "FssApiError";
		this.appStatus = options.appStatus;
		this.appSubStatus = options.appSubStatus;
	}
};