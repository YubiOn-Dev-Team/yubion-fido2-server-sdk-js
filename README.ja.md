# yubion-fido2-server-sdk-js

## yubion-fido2-server-sdk-jsとは
yubion-fido2-server-sdk-js は、YubiOn FIDO2Server Service（以下、YubiOn FSS）をnode.jsから利用するためのSDKライブラリです。node.jsを用いたサーバーアプリケーションからFIDO2認証（Passkey）を簡単に利用するためのAPIを提供します。

## 使い方
利用前に、既にYubiOn FSSにカスタマー登録を行い、RP設定などが完了している必要があります。詳しくはYubiOn FIDO2Server Serviceのマニュアルをご覧ください。  
  
ご利用になるNode.jsプロジェクトに、YubiOn FSS SDKをインストールします。
```
npm install yubion-fido2-server-sdk-js
```
FIDO2認証器の登録・認証処理を行うためのサーバー側APIを準備します。
```
const sdk = new YubiOnFssSdk({
	rpId : "test.example.com",
	apiAuthId : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
	apiAuthType : "NonceSignAuth",
	secretKey : "MI...",
});

app.post("/startRegistration", async (req, res) => {
	const result = await fssSdk.startRegisterCredential({
		creationOptionsBase:{
			attestation:"direct",
			authenticatorSelection:{
				residentKey : "required",
				userVerification : "required",
			},
		},
		user : {
			userId : req.body.userId,
			userName : req.body.userName,
			displayName : req.body.displayName,
			disabled : false,
		},
		options : {
			createUserIfNotExists : true,
			updateUserIfExists : true,
			credentialAttributes : {},
		},
	});
	req.session.fssSessionData = result.session;
	res.json({
		creationOptions : result.creationOptions,
	});
});
app.post("/finishRegistration", async (req, res) => {
	const sessionData = req.session.fssSessionData;
	const verifyResult = await fssSdk.verifyRegisterCredential(req.body, sessionData);
	if(!verifyResult.credential.userPresence || !verifyResult.credential.userVerification){
		throw new Error("require up and uv.");
	}
	const finishResult = await fssSdk.finishRegisterCredential(req.body, sessionData);
	res.json({
		user : finishResult.user,
		credential : finishResult.credential,
	});
});
app.post("/startAuthentication", async (req, res) => {
	const userId = req.body.userId;
	const startResponse = await fssSdk.startAuthenticate({
		requestOptionsBase : {
			userVerification : "required",
		},
		userId,
	});
	req.session.fssSessionData = startResponse.session;
	res.json({
		requestOptions : startResponse.requestOptions,
	});
});
app.post("/finishAuthentication", async (req, res) => {
	const sessionData = req.session.fssSessionData;
	const finishResponse = await fssSdk.finishAuthenticate({
		requestResponse : req.body,
	}, sessionData);
	req.session.userId = finishResponse.user.userId;
	res.json({
		userId : finishResponse.user.userId,
	});
});
```
FIDO2認証のみでなく、登録されているユーザーやクレデンシャルの管理などのAPIも準備されています。詳しくはAPIマニュアルをご参照ください。

## テストケース実行
テストケースを実行するには、以下の環境プロパティを設定しておく必要があります。  
|環境プロパティ名|内容|
|---------------|---|
| FSS_TEST_ENDPOINT | テストに使用するためのAPIエンドポイント（省略可）。 |
| FSS_TEST_RP_ID | テストに使用するためのRPID。このRPIDの各種情報（ユーザー・クレデンシャル）はテストケース実施時に破壊されるため、運用しているRPIDは絶対に用いないでください。 |
| FSS_TEST_NONCE_API_AUTH_ID | Nonce認証の動作を確認するためのAPI認証ID |
| FSS_TEST_NONCE_CORRECT_API_SECRET_KEY | Nonce認証の正常動作を確認するための正しいAPIシークレットキー |
| FSS_TEST_NONCE_INCORRECT_API_SECRET_KEY | Nonce認証の失敗動作を確認するための間違ったAPIシークレットキー |
| FSS_TEST_DATETIME_API_AUTH_ID | 日時認証の動作を確認するためのAPI認証ID |
| FSS_TEST_DATETIME_CORRECT_API_SECRET_KEY | 日時認証の正常動作を確認するための正しいAPIシークレットキー |
| FSS_TEST_DATETIME_INCORRECT_API_SECRET_KEY | 日時認証の失敗動作を確認するための間違ったAPIシークレットキー |
| FSS_TEST_ACCESSKEY_API_AUTH_ID | アクセスキー認証の動作を確認するためのAPI認証ID |
| FSS_TEST_ACCESSKEY_CORRECT_API_SECRET_KEY | アクセスキー認証の正常動作を確認するための正しいAPIシークレットキー |
| FSS_TEST_ACCESSKEY_INCORRECT_API_SECRET_KEY | アクセスキー認証の失敗動作を確認するための間違ったAPIシークレットキー |
| FSS_TEST_RP_ID_FOR_LICENSE_TEST | ライセンス異常時動作の検証に使用するためのRPID。無料登録したカスタマーで作成したRPIDを割り当ててください。このRPIDの各種情報（ユーザー・クレデンシャル）はテストケース実施時に破壊されるため、運用しているRPIDは絶対に用いないでください。 |
| FSS_TEST_API_AUTH_ID_FOR_LICENSE_TEST | ライセンス異常時動作確認に用いるNonce認証のAPI認証ID |
| FSS_TEST_API_SECRET_KEY_FOR_LICENSE_TEST | ライセンス異常時動作確認に用いるNonce認証のAPIシークレットキー |
