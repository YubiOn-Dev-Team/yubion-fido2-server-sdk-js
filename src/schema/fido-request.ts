import * as yup from "yup";
import { UserDataRegisterParameter } from "./user-data";

export interface Fido2StartRegisterParameter {
	/**
	 * An object of type Fido2CreationOptionsBase that specifies the base creation options for the registration process.
	 */
	creationOptionsBase : Fido2CreationOptionsBase;
	/**
	 * An object of type UserDataRegisterParameter that represents a registered user.
	 */
	user : UserDataRegisterParameter;
	/**
	 * An optional object of type Fido2RegisterOptions that provides additional options for the registration process.
	 */
	options? : Fido2RegisterOptions;
}
export interface Fido2CreationOptionsBase {
	/**
	 * Specifies the criteria for selecting an authenticator.
	 * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-authenticatorselection
	 */
	authenticatorSelection? : AuthenticatorSelectionCriteria;
	/**
	 * Sets a timeout for the creation process.
	 * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-timeout
	 */
	timeout? : number;
	/**
	 * Provides additional hints for the creation process.
	 * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-hints
	 */
	hints?: string[];
	/**
	 * Specifies the attestation conveyance preference.
	 * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-attestation
	 */
	attestation? : AttestationConveyancePreference;
	/**
	 * Allows for additional extension data to be included.
	 * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-extensions
	 */
	extensions? : { [ key : string ] : any };
}
export interface Fido2RegisterOptions {
	/**
	 * A boolean indicating whether to create a new user if they don't exist. (Optional)
	 */
	createUserIfNotExists? : boolean;
	/**
	 * A boolean indicating whether to update an existing user. (Optional)
	 */
	updateUserIfExists? : boolean;
	/**
	 * An object that specifies the name of the credential, with optional variations for different scenarios. (Optional)
	 */
	credentialName? : Fido2CredentialNameParameter;
	/**
	 * An object or string that specifies additional attributes for the credential. (Optional)
	 * It basically has a JSON object structure and can be specified in the form of a JS object or JSON string.
	 */
	credentialAttributes? : { [ key : string ] : any } | string;
}
export interface Fido2FinishRegisterParameter {
	/**
	 * An object that contains the attestation response from the authenticator, which can be either a JSON string or a PublicKeyCredentialJSON object. It may also include an optional transports property, which specifies the transport protocols supported by the authenticator.
	 */
	createResponse : {
		attestationResponse : string | PublicKeyCredentialJSON;
		transports? : string | Array<string>;
	},
	/**
	 * An optional object that contains additional options for the registration process, specifically the credentialName property, which can be used to specify a custom name for the credential.
	 */
	options? : {
		credentialName? : Fido2CredentialNameParameter;
	}
}
/**
 * This parameter specifies the credential name.
 * If this type is a pure string, only the “name” property will be specified.
 * The credential name is determined using the following procedure.
 * 1-1. If EnterpriseAttestation is detected during registration, the credential name is determined based on the nameIfEnterpriseAttestationExists property.
 * 1-2. If Attestation is detected during registration, the credential name is determined based on the nameIfModelNameExists property.
 * 1-3. If Attestation is not detected during registration, if there is no MDS registration corresponding to the AAGUID, and if the properties used in 1-1 and 1-2 are omitted, the credential name is determined based on the name property.
 * 2. Based on the credential properties, the following placeholders are replaced.
 * "$$":"$"
 * "$modelName": Product model name derived from AAGUID
 * "$authenticatorId": Authenticator ID (serial number, etc.) derived from the certificate in the case of Enterprise Attestation
 */
export type Fido2CredentialNameParameter = {
	/**
	 * Credential name
	 */
	name : string;
	/**
	 * Credential name if model name exists
	 */
	nameIfModelNameExists? : string;
	/**
	 * Credential name if EnterpriseAttestation exists
	 */
	nameIfEnterpriseAttestationExists? : string;
} | string | undefined;
export interface Fido2StartAuthenticateParameter {
	/**
	 * An object of type Fido2RequestOptionsBase that contains base options for the authentication request.
	 */
	requestOptionsBase : Fido2RequestOptionsBase;
	/**
	 * An optional string representing the user ID.
	 * Omit this when performing authentication using DiscoverableCredential.
	 */
	userId? : string;
	/**
	 * An optional object of type Fido2AuthenticateOptions that contains additional options for the authentication process.
	 */
	options? : Fido2AuthenticateOptions;
}
export interface Fido2RequestOptionsBase {
	/**
	 * An optional number that specifies the timeout for the request.
	 * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-timeout
	 */
	timeout? : number;
	/**
	 * An optional array of strings that provides hints for the request.
	 * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-hints
	 */
	hints?: string[];
	/**
	 * An optional property that specifies the user verification requirement for the request.
	 * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-userverification
	 */
	userVerification? : UserVerificationRequirement,
	/**
	 * An optional object that allows for additional, custom extensions to be specified.
	 * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-extensions
	 */
	extensions? : { [ key : string ] : any };
}
export interface Fido2AuthenticateOptions {
}
export interface Fido2FinishAuthenticateParameter {
	/**
	 * An object that contains a single property attestationResponse, which is either a JSON string or a PublicKeyCredentialJSON object.
	 */
	requestResponse : {
		attestationResponse : string | PublicKeyCredentialJSON,
	}
}
export interface SignalUnknownCredentialOptions {
	rpId : string;
	credentialId : string;
}
export const SignalUnknownCredentialOptionsSchema = yup.object().shape({
	rpId : yup.string(),
	credentialId : yup.string(),
});
export interface SignalAllAcceptedCredentialsOptions {
	rpId : string;
	userId : string;
	allAcceptedCredentialIds : Array<string>;
}
export const SignalAllAcceptedCredentialsOptionsSchema = yup.object().shape({
	rpId : yup.string(),
	userId : yup.string(),
	allAcceptedCredentialIds : yup.array(yup.string()),
});
export interface SignalCurrentUserDetailsOptions {
	rpId : string;
	userId : string;
	name : string;
	displayName? : string | null;
}
export const SignalCurrentUserDetailsOptionsSchema = yup.object().shape({
	rpId : yup.string(),
	userId : yup.string(),
	name : yup.string(),
	displayName : yup.string().nullable(),
});