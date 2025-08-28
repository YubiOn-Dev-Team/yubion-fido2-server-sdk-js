export function base64UrlDecode(encodedData : string) : BufferSource {
	return Buffer.from(encodedData, "base64url");
}
export function base64UrlEncode(data : Uint8Array) : string {
	return Buffer.from(data).toString("base64url");
}