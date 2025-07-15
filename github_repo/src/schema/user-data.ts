
import * as yup from "yup";
import { RpIdSchema } from "./rp-data";

export interface UserDataRegisterParameter {
	userId : string,
	userName? : string,
	displayName? : string | null,
	userAttributes? : { [key : string] : any} | string | null,
	disabled? : boolean,
}
export interface UserDataUpdateParameter extends UserDataRegisterParameter {
	updated? : Date,
}
export interface UserData extends UserDataRegisterParameter {
	rpId : string,
	userAttributes? : { [key : string] : any} | null,
	registered? : Date,
	updated? : Date,
};
export interface UserDataWithCredentialCount extends UserData {
	enabledCredentialCount : number,
	credentialCount : number,
};

export const UserIdSchema = yup.string().max(128);

// ユーザー登録時のスキーマ
export const UserDataSchema = yup.object().shape({
	rpId : RpIdSchema,
	userId : UserIdSchema,
	userName : yup.string(),
	displayName : yup.string().nullable(),
	userAttributes : yup.mixed().nullable(),
	registered : yup.date(),
	updated : yup.date(),
});
export const UserDataWithCredentialCountSchema = UserDataSchema.shape({
	enabledCredentialCount : yup.number(),
	credentialCount : yup.number(),
});