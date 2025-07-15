import { FssSdkConfig } from "../fss-sdk-config";
import * as yup from "yup";
import * as axiosBase from 'axios';
import { createHash } from "node:crypto";
import { FssApiError } from "../fss-api-error";
import { FssApiJsonResponse } from "./fss-api-json-response";
import { parse as parseCookie } from "set-cookie-parser";

export function createApiRequester(config : FssSdkConfig) : FssApiRequester {
	switch(config.apiAuthType){
	case "NonceSignAuth":
		return new NonceSignAuthApiRequester(config);
	case "DatetimeSignAuth":
		return new DatetimeSignAuthApiRequester(config);
	case "AccessKeyAuth":
		return new AccessKeyAuthApiRequester(config);
	default:
		throw new Error("bad auth type.");
	}
}
export interface FssApiRequester {
	request<TResponse>(
		path : string, 
		param : { [key : string]: any }, 
		options? : {
			schema? : yup.Schema, 
			withAuth? : boolean, 
			cookie? : string
		}
	) : Promise<TResponse>;
	requestWithCookieResponse<TResponse>(
		path : string, 
		param : { [key : string]: any }, 
		options? : {
			schema? : yup.Schema, 
			withAuth? : boolean, 
			cookie? : string
		}
	) : Promise<FssApiCookieResponse<TResponse>>;
}
interface FssApiCookieResponse<T> {
	cookie : string | undefined;
	response : T;
}
export abstract class FssApiRequesterBase implements FssApiRequester {
	protected axiosBase;
	protected config;
	constructor(config : FssSdkConfig){
		this.config = config;
		//If you wish to use a proxy server, use the environment variable `http_proxy` or `https_proxy`.
		this.axiosBase = axiosBase.create({
			baseURL : config.endpoint,
			timeout: 60000,
			headers: {
				"Accept": "application/json",
				"Cache-Control": "no-cache",
				"Pragma" : "no-cache",
				"Content-Type" : "application/json",
				"User-Agent" : config.agent,
			},
		});
	}
	async request<TResponse>(
		path : string, 
		param : { [key : string]: any }, 
		options? : {
			schema? : yup.Schema, 
			withAuth? : boolean, 
			cookie? : string
		}
	){		
		return (await this.requestWithCookieResponse<TResponse>(path, param, options)).response;
	}

	async requestWithCookieResponse<TResponse>(
		path : string, 
		param : { [key : string]: any }, 
		options? : {
			schema? : yup.Schema, 
			withAuth? : boolean, 
			cookie? : string
		}
	){
		const schema = options?.schema;
		const withAuth = options?.withAuth === undefined ? true : options?.withAuth;
		const cookie = options?.cookie;

		let result : Axios.AxiosXHR<string>;
		
		const body = Buffer.from(JSON.stringify(param));
		const additionalHeaders = withAuth ? await this.getAdditionalHeaders(body) : {};
		if(cookie){
			additionalHeaders["cookie"] = cookie;
		}
		try {
			result = await this.axiosBase.post<string>(path, body, {headers : additionalHeaders});
		} catch(ex){
			throw new FssApiError("axios error", {cause: ex, appStatus:"COMMUNICATION_FAILED"});
		}
		if(result.status !== 200){
			throw new FssApiError("bad server response code.", {appStatus:"COMMUNICATION_FAILED", appSubStatus:{ info : { httpStatus : result.status, }}});
		}
		let resData : FssApiJsonResponse<TResponse>;
		try {
			if(typeof(result.data) === 'string'){
				resData = JSON.parse(result.data); 
			} else {
				resData = result.data as FssApiJsonResponse<TResponse>;
			}
		} catch(ex) {
			throw new FssApiError("bad json response.", {cause:ex, appStatus:"COMMUNICATION_FAILED"});
		}
		if(resData.appStatus != "OK"){
			throw new FssApiError("server response:" + resData.appStatus, {appStatus : resData.appStatus, appSubStatus : resData.appSubStatus});
		}
		let response : TResponse;
		if(schema){
			response = schema.cast(resData.data) as TResponse;
		} else {
			response = resData.data as TResponse;
		}
		let respCookie : string | undefined = undefined;
		if(result.headers["set-cookie"]){
			respCookie = parseCookie(result.headers["set-cookie"], { map : false }).map(c => c.name + "=" + c.value).join("; ");
		}
		const ret : FssApiCookieResponse<TResponse> = {
			cookie : respCookie,
			response,
		}
		return ret;
	}
	protected async getAdditionalHeaders(body : Buffer<ArrayBufferLike>) : Promise<{[key: string]: any}>{
		return {
			"X-Fss-Rp-Id" : this.config.rpId,
			"X-Fss-Api-Auth-Id" : this.config.apiAuthId,
		};
	}
}
const keyPrm : EcKeyGenParams = {
	name : "ECDSA",
	namedCurve : "P-256",
};
export abstract class SignAuthApiRequesterBase extends FssApiRequesterBase {
	private privateKey : CryptoKey | undefined;

	constructor(config : FssSdkConfig){
		super(config);
	}
	private async getPrivateKey() : Promise<CryptoKey> {
		if(!this.privateKey){
			this.privateKey = await crypto.subtle.importKey("pkcs8", Buffer.from(this.config.secretKey, "base64url"), keyPrm, true, ["sign"]);
		}
		return this.privateKey;
	}
	
	protected async getAdditionalHeaders(body : Buffer<ArrayBufferLike>) : Promise<{[key: string]: any}>{
		const key = await this.getPrivateKey();
		const headers = await super.getAdditionalHeaders(body);
		const signTargetInfo = await this.getSignInfo(body);
		const bodyHash = await createHash("SHA-256").update(body).digest();
		const signTarget = Buffer.concat([ signTargetInfo.signTargetPrefix, bodyHash ]);
		const signature = await crypto.subtle.sign({ ...keyPrm, hash:"SHA-256"}, key, signTarget);
		headers["X-Fss-Auth-Signature"] = Buffer.from(signature).toString("base64url");
		headers["X-Fss-Auth-Body-Hash"] = bodyHash.toString("base64url");
		Object.keys(signTargetInfo.additionalHeaders).forEach((x) => headers[x] = signTargetInfo.additionalHeaders[x]);

		return headers;
	}
	protected abstract getSignInfo(body : Buffer<ArrayBufferLike>) : Promise<{ signTargetPrefix : Buffer<ArrayBufferLike>, additionalHeaders : {[key :string] : any }}>;
}
export class NonceSignAuthApiRequester extends SignAuthApiRequesterBase {
	constructor(config : FssSdkConfig){
		super(config);
	}
	protected async getSignInfo(body: Buffer<ArrayBufferLike>): Promise<{ signTargetPrefix : Buffer<ArrayBufferLike>, additionalHeaders : {[key :string] : any }}> {
		const nonceResp = await this.request<{ nonce : string }>("getNonce", {}, { schema : yup.object().shape({ nonce : yup.string() }), withAuth : false });
		return {
			signTargetPrefix : Buffer.from(nonceResp.nonce, "utf-8"),
			additionalHeaders : {
				"X-Fss-Auth-Nonce" : nonceResp.nonce,
			}
		};
	}
}
export class DatetimeSignAuthApiRequester extends SignAuthApiRequesterBase {
	constructor(config : FssSdkConfig){
		super(config);
	}
	protected async getSignInfo(body: Buffer<ArrayBufferLike>): Promise<{ signTargetPrefix : Buffer<ArrayBufferLike>, additionalHeaders : {[key :string] : any }}> {
		const now = (new Date()).toISOString();
		return {
			signTargetPrefix : Buffer.from(now, "utf-8"),
			additionalHeaders : {
				"X-Fss-Auth-Request-Time" : now,
			}
		};
	}
}
export class AccessKeyAuthApiRequester extends FssApiRequesterBase {
	constructor(config : FssSdkConfig){
		super(config);
	}
	protected async getAdditionalHeaders(body : Buffer<ArrayBufferLike>) : Promise<{[key: string]: any}>{
		const headers = await super.getAdditionalHeaders(body);
		return {
			...headers,
			"X-Fss-Auth-Access-Key" : this.config.secretKey,
		};
	}
}
