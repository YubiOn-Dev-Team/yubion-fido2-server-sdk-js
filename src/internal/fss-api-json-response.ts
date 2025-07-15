import { FssApiResultStatus } from "../fss-api-result-status";

/**
 * Json response
 */
export class FssApiJsonResponse<T> {
	/** result status */
	appStatus : FssApiResultStatus = "UNEXPECTED_ERROR";
	/** result data (when api request successed) */
	data : T | null | undefined;
	/** message (when api request failed) */
	message! : string;
	/** result sub status (when api request failed) */
	appSubStatus? : any;
}
