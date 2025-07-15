import { base64UrlDecode, base64UrlEncode } from "./base64-url";

export function convertCreationOptionsToBinary(creationOptionsJson : PublicKeyCredentialCreationOptionsJSON) : PublicKeyCredentialCreationOptions {
	return {
		challenge : base64UrlDecode(creationOptionsJson.challenge),
		pubKeyCredParams : creationOptionsJson.pubKeyCredParams,
		rp : {
			id : creationOptionsJson.rp.id,
			name : creationOptionsJson.rp.name,
		},
		user : {
			id : base64UrlDecode(creationOptionsJson.user.id),
			name : creationOptionsJson.user.name,
			displayName : creationOptionsJson.user.displayName,
		},
		attestation : creationOptionsJson.attestation as AttestationConveyancePreference,
		authenticatorSelection : creationOptionsJson.authenticatorSelection,
		excludeCredentials : creationOptionsJson.excludeCredentials?.map((x) => ({
			id : base64UrlDecode(x.id),
			type : x.type as "public-key",
			transports : x.transports as AuthenticatorTransport[],
		})),
		extensions : creationOptionsJson.extensions,
		timeout : creationOptionsJson.timeout,
	};
}
export function convertPublicKeyCredentialToJsonable(pubKeyCred : PublicKeyCredential) : PublicKeyCredentialJSON {
	return arrayBufToBase64url(pubKeyCred);
}
export function convertRequestOptionsToBinary(requestOptionsJson : PublicKeyCredentialRequestOptionsJSON) : PublicKeyCredentialRequestOptions {
	return {
		challenge : base64UrlDecode(requestOptionsJson.challenge),
		allowCredentials : requestOptionsJson.allowCredentials ? requestOptionsJson.allowCredentials.map((x) => ({
			id : base64UrlDecode(x.id),
			type : x.type as "public-key",
			transports : x.transports as AuthenticatorTransport[],
		})) : undefined,
		rpId : requestOptionsJson.rpId,
		timeout : requestOptionsJson.timeout,
		userVerification : requestOptionsJson.userVerification as UserVerificationRequirement | undefined,
		extensions : requestOptionsJson.extensions,
	};
}
/**
 * バイナリデータのURLセーフなBase64エンコード
 * @param  {Object} pubKeyCred PublicKey Credential
 * @return {Object} - URLセーフなBese64エンコード済みのPublicKey Credential
 */
const arrayBufToBase64url = function(data : any) : any {
	if (data instanceof Array) {
		let ary : any[] = [];
		for (let i of data){
			ary.push(arrayBufToBase64url(i));
		}
		return ary;
	}

	if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
		return base64UrlEncode(data);
	}

	if (data instanceof Object) {
		let obj : { [key : string] : any }= {};

		for (let key in data) {
			obj[key] = arrayBufToBase64url(data[key]);
		}
		return obj;
	}
	return data;
}
