export function base64UrlDecode(encodedData : string) : ArrayBuffer {
	return Buffer.from(encodedData, "base64url");
}
export function base64UrlEncode(data : ArrayBuffer) : string {
	return Buffer.from(data).toString("base64url");
}