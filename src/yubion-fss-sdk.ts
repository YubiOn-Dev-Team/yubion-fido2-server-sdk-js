import { convertConfig, FssSdkConfig, FssSdkConfigParameter } from "./fss-sdk-config";
import * as yup from 'yup';
import { UserData, UserDataRegisterParameter, UserDataSchema, UserDataUpdateParameter, UserDataWithCredentialCount, UserDataWithCredentialCountSchema } from "./schema/user-data";
import { CredentialData, CredentialDataSchema, CredentialDataUpdateParameter } from "./schema/credential-data";
import { createApiRequester, FssApiRequester } from "./internal/fss-api-requester";
import { Fido2FinishAuthenticateParameter, Fido2FinishRegisterParameter, Fido2StartAuthenticateParameter, Fido2StartRegisterParameter, SignalAllAcceptedCredentialsOptions, SignalAllAcceptedCredentialsOptionsSchema, SignalCurrentUserDetailsOptions, SignalCurrentUserDetailsOptionsSchema, SignalUnknownCredentialOptions, SignalUnknownCredentialOptionsSchema } from "./schema";
import { FssApiError } from "./fss-api-error";

export class YubiOnFssSdk {
	private config : FssSdkConfig;
	private apiRequester : FssApiRequester;
	/**
	 * Initializes a new instance of the YubiOnFssSdk class.
	 * 
	 * @param {FssSdkConfigParameter} config - The configuration of the FIDO2 Server.
	 */
	constructor(config : FssSdkConfigParameter){
		this.config = convertConfig(config);
		this.apiRequester = createApiRequester(this.config);
	}
	getRpId() : string { return this.config.rpId; }
	/**
	 * Gets a user by its ID.
	 * 
	 * @param {string} userId - The ID of the user to get.
	 * @param {boolean} [withDisabledUser=false] - Whether to include disabled users in the result.
	 * @param {boolean} [withDisabledCredential=false] - Whether to include disabled credentials in the result.
	 * 
	 * @returns {Promise<{ user: UserDataWithCredentialCount, credentials: Array<CredentialData> }>}
	 * A promise that resolves with an object containing the user and credential data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async getUser(userId : string, withDisabledUser : boolean = false, withDisabledCredential : boolean = false){
		return await this.apiRequester.request<{
			user : UserDataWithCredentialCount, 
			credentials : Array<CredentialData>,
			signalCurrentUserDetailsOptions : SignalCurrentUserDetailsOptions,
		}>(
			"getUser",
			{ userId, withDisabledUser, withDisabledCredential },
			{
				schema : yup.object().shape({
					user : UserDataWithCredentialCountSchema,
					credentials : yup.array(CredentialDataSchema),
					signalCurrentUserDetailsOptions : SignalCurrentUserDetailsOptionsSchema,
				})
			}
		);
	}
	/**
	 * Retrieves all users.
	 * 
	 * @param {boolean} [withDisabledUser=false] - Whether to include disabled users in the result.
	 * 
	 * @returns {Promise<{ users: Array<UserDataWithCredentialCount> }>}
	 * A promise that resolves with an object containing an array of user data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async getAllUsers(withDisabledUser : boolean = false){
		return await this.apiRequester.request<{
			users : Array<UserDataWithCredentialCount>, 
		}>(
			"getAllUsers",
			{ withDisabledUser, },
			{
				schema : yup.object().shape({
					users : yup.array(UserDataWithCredentialCountSchema),
				})
			}
		);
	}
	/**
	 * Retrieves all users with the specified username.
	 * 
	 * @param {string} userName - The username to search for.
	 * @param {boolean} [withDisabledUser=false] - Whether to include disabled users in the result.
	 * 
	 * @returns {Promise<{ users: Array<UserDataWithCredentialCount> }>}
	 * A promise that resolves with an object containing an array of user data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async getUsersByUserName(userName : string, withDisabledUser : boolean = false){
		return await this.apiRequester.request<{
			users : Array<UserDataWithCredentialCount>, 
		}>(
			"getUsersByUserName",
			{ userName, withDisabledUser, },
			{ 
				schema : yup.object().shape({
					users : yup.array(UserDataWithCredentialCountSchema),
				})
			}
		);
	}
	/**
	 * Registers a new user.
	 * 
	 * @param {UserDataRegisterParameter} user - The user data for registration.
	 * 
	 * @returns {Promise<{ user: UserDataWithCredentialCount }>}
	 * A promise that resolves with an object containing the registered user data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async registerUser(user : UserDataRegisterParameter){
		return await this.apiRequester.request<{
			user : UserDataWithCredentialCount, 
		}>(
			"registerUser",
			{
				user, 
			},
			{
				schema : yup.object().shape({
					user : UserDataWithCredentialCountSchema,
				})
			}
		);
		
	}
	/**
	 * Updates the specified user.
	 * 
	 * @param {UserDataUpdateParameter} user - The user data for update.
	 * @param {boolean} [withUpdatedCheck=false] - Whether to check for the updated date.
	 * 
	 * @returns {Promise<{ user: UserDataWithCredentialCount, signalCurrentUserDetailsOptions : SignalCurrentUserDetailsOptions }>}
	 * A promise that resolves with an object containing the updated user data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async updateUser(user : UserDataUpdateParameter, withUpdatedCheck : boolean = false){
		return await this.apiRequester.request<{
			user : UserDataWithCredentialCount, 
			signalCurrentUserDetailsOptions : SignalCurrentUserDetailsOptions,
		}>(
			"updateUser",
			{ 
				user, 
				options : {
					withUpdatedCheck,
				}
			},
			{
				schema : yup.object().shape({
					user : UserDataWithCredentialCountSchema,
					signalCurrentUserDetailsOptions : SignalCurrentUserDetailsOptionsSchema,
				})
			}
		);
		
	}
	/**
	 * Deletes a user by its ID.
	 * 
	 * @param {string} userId - The ID of the user to delete.
	 * 
	 * @returns {Promise<{ user: UserDataWithCredentialCount }>}
	 * A promise that resolves with an object containing the deleted user data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async deleteUser(userId : string){
		return await this.apiRequester.request<{
			user : UserDataWithCredentialCount, 
			credentials : Array<CredentialData>,
			signalAllAcceptedCredentialsOptions : SignalAllAcceptedCredentialsOptions,
		}>(
			"deleteUser",
			{ userId, },
			{
				schema : yup.object().shape({
					user : UserDataWithCredentialCountSchema,
					credentials : yup.array(CredentialDataSchema),
					signalAllAcceptedCredentialsOptions : SignalAllAcceptedCredentialsOptionsSchema,
				})
			}
		);
	}
	/**
	 * Starts a credential registration process.
	 * 
	 * @param {Fido2StartRegisterParameter} startRegisterParameter - The request parameter for starting a credential registration.
	 * 
	 * @returns {Promise<{ creationOptions: PublicKeyCredentialCreationOptionsJSON, user: UserDataWithCredentialCount, session: string }>}
	 * A promise that resolves with an object containing the creation options for the credential registration and the user data, and a session string.
	 * The session string is used to verify the credential registration in the {@link verifyRegisterCredential} method and to finish the credential registration in the {@link finishRegisterCredential} method.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async startRegisterCredential(startRegisterParameter : Fido2StartRegisterParameter){
		const result = await this.apiRequester.requestWithCookieResponse<{
			creationOptions : PublicKeyCredentialCreationOptionsJSON,
			user : UserDataWithCredentialCount,
		}>(
			"registerCredential/start",
			startRegisterParameter,
			{ 
				schema : yup.object().shape({
					creationOptions : yup.object().shape({
						attestation : yup.string().nullable(),
						authenticatorSelection : yup.object().nullable().shape({
							authenticatorAttachment : yup.string().nullable().oneOf(["platform","cross-platform"]),
							requireResidentKey : yup.boolean().nullable(),
							residentKey : yup.string().nullable().oneOf(["discouraged", "preferred", "required"]),
							userVerification : yup.string().nullable().oneOf(["discouraged", "preferred", "required"]),
						}),
						challenge : yup.string(),
						excludeCredentials : yup.array(yup.object().shape({
							id : yup.string(),
							transports : yup.array(yup.string()).nullable(),
							type : yup.string(),
						})).nullable(),
						extensions : yup.mixed().nullable(),
						hints : yup.array(yup.string()).nullable(),
						pubKeyCredParams : yup.array(yup.object().shape({
							alg : yup.number(),
							type : yup.string(),
						})),
						rp : yup.object().shape({
							id : yup.string(),
							name : yup.string(),
						}),
						timeout : yup.number().nullable(),
						user : yup.object().shape({
							id : yup.string(),
							name : yup.string(),
							displayName : yup.string().nullable(),
						}),
					}),
					user : UserDataWithCredentialCountSchema,
				})
			}
		);
		if(!result.cookie){
			throw new FssApiError("cookie not found.", { appStatus : "COMMUNICATION_FAILED"});
		}
		return {
			...result.response,
			session : result.cookie,
		};
	}
	/**
	 * Verifies the credential registration parameters before the actual registration
	 * by analyzing the contents of the finishRegisterParameter. This method provides
	 * a clear and understandable format of the registration content for review. 
	 * The return value should be checked by the RP (the program using the SDK) to 
	 * determine if there are any issues. If no issues are found, the RP can proceed 
	 * to call finishRegisterCredential. If there is no need to review the 
	 * registration content, calling finishRegisterCredential directly is also acceptable.
	 * 
	 * @param {Fido2FinishRegisterParameter} finishRegisterParameter - The parameters for finishing the credential registration.
	 * @param {string} session - The session string associated with the registration process.
	 * 
	 * @returns {Promise<{ credential: CredentialData, user: UserDataWithCredentialCount }>}
	 * A promise that resolves with an object containing the credential data and user data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async verifyRegisterCredential(finishRegisterParameter : Fido2FinishRegisterParameter, session : string){
		return await this.apiRequester.request<{
			credential : CredentialData,
			user : UserDataWithCredentialCount,
		}>(
			"registerCredential/verify",
			finishRegisterParameter,
			{ 
				schema : yup.object().shape({
					credential : CredentialDataSchema,
					user : UserDataWithCredentialCountSchema,
				}),
				cookie : session,
			}
		);
	}
	/**
	 * Completes the credential registration process by verifying the credential
	 * registration information and saves the credential to the user account.
	 * 
	 * @param {Fido2FinishRegisterParameter} finishRegisterParameter - The parameters for finishing the credential registration.
	 * @param {string} session - The session string associated with the registration process.
	 * 
	 * @returns {Promise<{ credential: CredentialData, user: UserDataWithCredentialCount }>}
	 * A promise that resolves with an object containing the credential data and user data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async finishRegisterCredential(finishRegisterParameter : Fido2FinishRegisterParameter, session : string){
		return await this.apiRequester.request<{
			credential : CredentialData,
			user : UserDataWithCredentialCount,
		}>(
			"registerCredential/finish",
			finishRegisterParameter,
			{ 
				schema : yup.object().shape({
					credential : CredentialDataSchema,
					user : UserDataWithCredentialCountSchema,
				}),
				cookie : session,
			}
		);
	}
	/**
	 * Starts the authentication process with the specified user and parameters.
	 * If the user is not specified, the authentication is performed with discoverable credentials.
	 * 
	 * @param {Fido2StartAuthenticateParameter} startAuthenticateParameter - The request parameter for starting an authentication.
	 * 
	 * @returns {Promise<{ requestOptions: PublicKeyCredentialRequestOptionsJSON, user?: UserData, session: string }>}
	 * A promise that resolves with an object containing the request options for the authentication and the user data.
	 * If the user is not specified in the request parameter, the user data is null.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 * The session string is used to finish the authentication in the {@link finishAuthenticate} method.
	 */
	async startAuthenticate(startAuthenticateParameter : Fido2StartAuthenticateParameter){
		const result = await this.apiRequester.requestWithCookieResponse<{
			requestOptions : PublicKeyCredentialRequestOptionsJSON,
			user? : UserDataWithCredentialCount,
		}>(
			"authenticate/start",
			startAuthenticateParameter,
			{ 
				schema : yup.object().shape({
					requestOptions : yup.object().shape({
						challenge : yup.string(),
						allowCredentials : yup.array(yup.object().shape({
							id : yup.string(),
							transports : yup.array(yup.string()).nullable(),
							type : yup.string(),
						})).nullable(),
						userVerification : yup.string().nullable().oneOf(["discouraged", "preferred", "required"]),
						timeout : yup.number().nullable(),
						hints : yup.array(yup.string()).nullable(),
						extensions : yup.mixed().nullable(),
					}),
					user : UserDataWithCredentialCountSchema.nullable(),
				})
			}
		);
		if(!result.cookie){
			throw new FssApiError("cookie not found.", { appStatus : "COMMUNICATION_FAILED"});
		}
		return {
			...result.response,
			session : result.cookie,
		};
	}
	/**
	 * Finishes the authentication process by verifying the authentication information.
	 * 
	 * @param {Fido2FinishAuthenticateParameter} finishAuthenticateParameter - The parameters for finishing the authentication.
	 * @param {string} session - The session string associated with the authentication process.
	 * 
	 * @returns {Promise<{ credential: CredentialData, user: UserDataWithCredentialCount }>}
	 * A promise that resolves with an object containing the credential data and user data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async finishAuthenticate(finishAuthenticateParameter : Fido2FinishAuthenticateParameter, session : string){
		return await this.apiRequester.request<{
			credential : CredentialData,
			user : UserDataWithCredentialCount,
			signalAllAcceptedCredentialsOptions : SignalAllAcceptedCredentialsOptions;
			signalCurrentUserDetailsOptions : SignalCurrentUserDetailsOptions;
		}>(
			"authenticate/finish",
			finishAuthenticateParameter,
			{ 
				schema : yup.object().shape({
					credential : CredentialDataSchema,
					user : UserDataWithCredentialCountSchema,
					signalAllAcceptedCredentialsOptions : SignalAllAcceptedCredentialsOptionsSchema,
					signalCurrentUserDetailsOptions : SignalCurrentUserDetailsOptionsSchema,
				}),
				cookie : session,
			}
		);
	}
	/**
	 * Retrieves the credential with the specified ID belonging to the user with the specified ID.
	 * 
	 * @param {string} userId - The ID of the user that the credential belongs to.
	 * @param {string} credentialId - The ID of the credential to retrieve.
	 * @param {boolean} [withDisabledUser=false] - Whether to include disabled users in the result.
	 * @param {boolean} [withDisabledCredential=false] - Whether to include disabled credentials in the result.
	 * 
	 * @returns {Promise<{ user: UserDataWithCredentialCount, credential: CredentialData }>}
	 * A promise that resolves with an object containing the user data and the credential data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async getCredential(userId : string, credentialId : string, withDisabledUser : boolean = false, withDisabledCredential : boolean = false){
		return await this.apiRequester.request<{
			user : UserDataWithCredentialCount, 
			credential : CredentialData
		}>(
			"getCredential",
			{ userId, credentialId, withDisabledUser, withDisabledCredential },
			{
				schema : yup.object().shape({
					user : UserDataWithCredentialCountSchema,
					credential : CredentialDataSchema,
				})
			}
		);
	}
	/**
	 * Updates the specified credential.
	 * 
	 * @param {CredentialDataUpdateParameter} credential - The credential data for update.
	 * @param {boolean} [withUpdatedCheck=false] - Whether to check for the updated date.
	 * 
	 * @returns {Promise<{ user: UserDataWithCredentialCount, credential: CredentialData }>}
	 * A promise that resolves with an object containing the updated user data and credential data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async updateCredential(credential : CredentialDataUpdateParameter, withUpdatedCheck : boolean = false){
		return await this.apiRequester.request<{
			user : UserDataWithCredentialCount, 
			credential : CredentialData,
		}>(
			"updateCredential",
			{ 
				credential, 
				options : {
					withUpdatedCheck,
				}
			},
			{
				schema : yup.object().shape({
					user : UserDataWithCredentialCountSchema,
					credential : CredentialDataSchema,
				})
			}
		);
		
	}
	/**
	 * Deletes the credential with the specified ID belonging to the user with the specified ID.
	 * 
	 * @param {string} userId - The ID of the user that the credential belongs to.
	 * @param {string} credentialId - The ID of the credential to delete.
	 * 
	 * @returns {Promise<{ user: UserDataWithCredentialCount, credential: CredentialData, signalUnknownCredentialOptions : SignalUnknownCredentialOptions }>}
	 * A promise that resolves with an object containing the user data and the credential data.
	 * If the request fails due to an error in the external API, the promise is rejected with an `FssApiError`.
	 */
	async deleteCredential(userId : string, credentialId : string){
		return await this.apiRequester.request<{
			user : UserDataWithCredentialCount, 
			credential : CredentialData,
			signalUnknownCredentialOptions : SignalUnknownCredentialOptions,
		}>(
			"deleteCredential",
			{ userId, credentialId, },
			{
				schema : yup.object().shape({
					user : UserDataWithCredentialCountSchema,
					credential : CredentialDataSchema,
					signalUnknownCredentialOptions : SignalUnknownCredentialOptionsSchema,
				})
			}
		);
	}
	
}
