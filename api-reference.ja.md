# YubiOn FIDO2 Server SDK for JavaScript/TypeScript APIリファレンス

このドキュメントは、YubiOn FIDO2 Server SDK for JavaScript/TypeScript のAPIリファレンスです。  
[English](api-reference.md) | [Japanese](api-reference.ja.md)

## `YubiOnFssSdk` クラス

FIDO2サーバーとの通信を行うためのメインクラスです。

### コンストラクタ

#### `new YubiOnFssSdk(config)`

`YubiOnFssSdk` の新しいインスタンスを初期化します。

**引数:**

*   `config` (`FssSdkConfigParameter`): FIDO2サーバーへの接続設定。
    *   `endpoint` (`string`, 省略可能, デフォルト: `"https://fss.yubion.com/api/"`): APIのエンドポイントURL。
    *   `rpId` (`string`): このSDKを使用するRP（リライングパーティ）のID。
    *   `apiAuthId` (`string`): API認証に使用するID。
    *   `apiAuthType` (`FssApiAuthType`): API認証のタイプ。`"NonceSignAuth"`, `"DatetimeSignAuth"`, `"AccessKeyAuth"` のいずれかを指定します。
    *   `secretKey` (`string`): API認証に使用するシークレットキー。
    *   `agent` (`string`, 省略可能, デフォルト: `"yubion-fido2-server-sdk-js"`): APIリクエスト時に使用されるユーザーエージェント文字列。

---

## ユーザー管理

### `getUser(userId, withDisabledUser, withDisabledCredential)`

指定されたIDのユーザー情報を取得します。

**引数:**

*   `userId` (`string`): 取得するユーザーのID。
*   `withDisabledUser` (`boolean`, 省略可能, デフォルト: `false`): 無効化されたユーザーを含めるかどうか。
*   `withDisabledCredential` (`boolean`, 省略可能, デフォルト: `false`): 無効化されたクレデンシャルを含めるかどうか。

**戻り値:**

*   `Promise<{ user: UserDataWithCredentialCount, credentials: Array<CredentialData>, signalCurrentUserDetailsOptions: SignalCurrentUserDetailsOptions }>`: ユーザー情報とクレデンシャル情報の配列を含むオブジェクトを解決するPromise。
    *   `user` (`UserDataWithCredentialCount`): ユーザー情報。
    *   `credentials` (`Array<CredentialData>`): ユーザーに紐づくクレデンシャル情報の配列。
    *   `signalCurrentUserDetailsOptions` (`SignalCurrentUserDetailsOptions`): クライアント側でユーザー情報を更新するためのシグナル情報。`PublicKeyCredential.signalCurrentUserDetails()`を呼び出すための引数として用います。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `getAllUsers(withDisabledUser)`

すべてのユーザー情報を取得します。

**引数:**

*   `withDisabledUser` (`boolean`, 省略可能, デフォルト: `false`): 無効化されたユーザーを含めるかどうか。

**戻り値:**

*   `Promise<{ users: Array<UserDataWithCredentialCount> }>`: ユーザー情報の配列を含むオブジェクトを解決するPromise。
    *   `users` (`Array<UserDataWithCredentialCount>`): ユーザー情報の配列。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `getUsersByUserName(userName, withDisabledUser)`

指定されたユーザー名のユーザー情報を取得します。

**引数:**

*   `userName` (`string`): 検索するユーザー名。
*   `withDisabledUser` (`boolean`, 省略可能, デフォルト: `false`): 無効化されたユーザーを含めるかどうか。

**戻り値:**

*   `Promise<{ users: Array<UserDataWithCredentialCount> }>`: ユーザー情報の配列を含むオブジェクトを解決するPromise。
    *   `users` (`Array<UserDataWithCredentialCount>`): ユーザー情報の配列。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `registerUser(user)`

新しいユーザーを登録します。

**引数:**

*   `user` (`UserDataRegisterParameter`): 登録するユーザー情報。
    *   `userId` (`string`): ユーザーID。
    *   `userName` (`string`): ユーザー名。
    *   `displayName` (`string | null`, 省略可能): 表示名。
    *   `userAttributes` (`{ [key: string]: any } | string | null`, 省略可能): ユーザーの追加属性。JSONオブジェクトまたはJSON文字列で指定します。
    *   `disabled` (`boolean`): ユーザーを無効として登録するかどうか。

**戻り値:**

*   `Promise<{ user: UserDataWithCredentialCount }>`: 登録されたユーザー情報を含むオブジェクトを解決するPromise。
    *   `user` (`UserDataWithCredentialCount`): 登録されたユーザー情報。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `updateUser(user, withUpdatedCheck)`

指定されたユーザーの情報を更新します。

**引数:**

*   `user` (`UserDataUpdateParameter`): 更新するユーザー情報。
    *   `userId` (`string`): ユーザーID。
    *   `userName` (`string`): ユーザー名。
    *   `displayName` (`string | null`, 省略可能): 表示名。
    *   `userAttributes` (`{ [key: string]: any } | string | null`, 省略可能): ユーザーの追加属性。JSONオブジェクトまたはJSON文字列で指定します。
    *   `disabled` (`boolean`): ユーザーを無効にするかどうか。
    *   `updated` (`Date`, 省略可能): 最終更新日時。`withUpdatedCheck`が`true`の場合、この値とDB上の`updated`が一致しない場合は更新に失敗します。
*   `withUpdatedCheck` (`boolean`, 省略可能, デフォルト: `false`): 最終更新日時をチェックするかどうか。

**戻り値:**

*   `Promise<{ user: UserDataWithCredentialCount, signalCurrentUserDetailsOptions: SignalCurrentUserDetailsOptions }>`: 更新されたユーザー情報を含むオブジェクトを解決するPromise。
    *   `user` (`UserDataWithCredentialCount`): 更新されたユーザー情報。
    *   `signalCurrentUserDetailsOptions` (`SignalCurrentUserDetailsOptions`): クライアント側でユーザー情報を更新するためのシグナル情報。`PublicKeyCredential.signalCurrentUserDetails()`を呼び出すための引数として用います。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `deleteUser(userId)`

指定されたIDのユーザーを削除します。

**引数:**

*   `userId` (`string`): 削除するユーザーのID。

**戻り値:**

*   `Promise<{ user: UserDataWithCredentialCount, credentials: Array<CredentialData>, signalAllAcceptedCredentialsOptions: SignalAllAcceptedCredentialsOptions }>`: 削除されたユーザー情報と関連情報を含むオブジェクトを解決するPromise。
    *   `user` (`UserDataWithCredentialCount`): 削除されたユーザー情報。
    *   `credentials` (`Array<CredentialData>`): 削除されたユーザーに紐づいていたクレデンシャル情報の配列。
    *   `signalAllAcceptedCredentialsOptions` (`SignalAllAcceptedCredentialsOptions`): クライアント側でクレデンシャル情報を削除するためのシグナル情報。`PublicKeyCredential.signalAllAcceptedCredentials()`を呼び出すための引数として用います。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

---

## FIDO2/WebAuthn クレデンシャル管理

### `startRegisterCredential(startRegisterParameter)`

クレデンシャル登録プロセスを開始します。

**引数:**

*   `startRegisterParameter` (`Fido2StartRegisterParameter`): クレデンシャル登録開始のためのリクエストパラメータ。
    *   `creationOptionsBase` (`Fido2CreationOptionsBase`): WebAuthnの`PublicKeyCredentialCreationOptions`の基本部分。
        *   `authenticatorSelection` (`AuthenticatorSelectionCriteria`, 省略可能): 認証器の選択基準。"platform", "cross-platform"のいずれかの文字列です。
        *   `timeout` (`number`, 省略可能): タイムアウト時間（ミリ秒）。
        *   `hints` (`string[]`, 省略可能): 認証方式をユーザーエージェント(ブラウザ等)に伝えるためのヒント。"security-key", "client-device", "hybrid"のいずれかの文字列の配列です。
        *   `attestation` (`AttestationConveyancePreference`, 省略可能): Attestationの要求設定。"none", "indirect", "direct", "enterprise"のいずれかの文字列です。
        *   `extensions` (`{ [key: string]: any }`, 省略可能): 拡張機能データ。
    *   `user` (`UserDataRegisterParameter`): 登録するユーザーの情報。
        *   `userId` (`string`): ユーザーID。64バイト以内のバイナリデータをBase64URL形式(パディング無し)にエンコードして指定する必要があります。
        *   `userName` (`string`, 省略可能): ユーザー名。`options.createUserIfNotExists`と`options.updateUserIfExists`が共に`false`の場合は省略可能です。
        *   `displayName` (`string | null`, 省略可能): 表示名。`options.createUserIfNotExists`と`options.updateUserIfExists`が共に`false`の場合は省略可能です。
        *   `userAttributes` (`{ [key: string]: any } | string | null`, 省略可能): ユーザーの追加属性。`options.createUserIfNotExists`と`options.updateUserIfExists`が共に`false`の場合は省略可能です。
        *   `disabled` (`boolean`, 省略可能): ユーザーが無効かどうか。登録時は`false`に指定する事はできません。`options.createUserIfNotExists`と`options.updateUserIfExists`が共に`false`の場合は省略可能です。
    *   `options` (`Fido2RegisterOptions`, 省略可能): 登録プロセスの追加オプション。
        *   `createUserIfNotExists` (`boolean`, 省略可能): ユーザーが存在しない場合に新規作成するかどうか。
        *   `updateUserIfExists` (`boolean`, 省略可能): 既存のユーザーを更新するかどうか。
        *   `credentialName` (`Fido2CredentialNameParameter`, 省略可能): クレデンシャル名。詳細はデータ構造の`Fido2CredentialNameParameter`を参照してください。
        *   `credentialAttributes` (`{ [key: string]: any } | string`, 省略可能): クレデンシャルの追加属性。

**戻り値:**

*   `Promise<{ creationOptions: PublicKeyCredentialCreationOptionsJSON, user: UserDataWithCredentialCount, session: string }>`: クレデンシャル登録のための作成オプションとユーザー情報、セッション文字列を含むオブジェクトを解決するPromise。
    *   `creationOptions` (`PublicKeyCredentialCreationOptionsJSON`): WebAuthnの`navigator.credentials.create()`に渡すオプション。
    *   `user` (`UserDataWithCredentialCount`): ユーザー情報。
    *   `session` (`string`): 後続の`verifyRegisterCredential`や`finishRegisterCredential`で使用するセッション文字列。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `verifyRegisterCredential(finishRegisterParameter, session)`

クレデンシャル登録パラメータを検証します。このメソッドは、実際の登録前に登録内容を解析し、RP（SDKを利用するプログラム）が確認できるように分かりやすい形式で提供します。RPは戻り値を確認し、問題がなければ`finishRegisterCredential`を呼び出します。

**引数:**

*   `finishRegisterParameter` (`Fido2FinishRegisterParameter`): クレデンシャル登録を完了するためのパラメータ。
    *   `createResponse`: 認証器からの応答。
        *   `attestationResponse` (`string | PublicKeyCredentialJSON`): 認証器からのAttestation応答。JSON文字列または`PublicKeyCredentialJSON`オブジェクト。`navigator.credentials.create()`の戻り値を設定します。
        *   `transports` (`string | Array<string>`, 省略可能): 認証器がサポートするトランスポートプロトコル。トランスポートプロトコルを保存したい場合、`navigator.credentials.create()`の戻り値の`response`メンバーメソッドである`getTransports()`を呼び出し、その戻り値を`transports`メンバーに設定します。
    *   `options` (省略可能):
        *   `credentialName` (`Fido2CredentialNameParameter`, 省略可能): クレデンシャル名。詳細はデータ構造の`Fido2CredentialNameParameter`を参照してください。
*   `session` (`string`): `startRegisterCredential`で取得したセッション文字列。

**戻り値:**

*   `Promise<{ credential: CredentialData, user: UserDataWithCredentialCount }>`: 検証されたクレデンシャルデータとユーザー情報を含むオブジェクトを解決するPromise。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `finishRegisterCredential(finishRegisterParameter, session)`

クレデンシャル登録プロセスを完了し、クレデンシャルをユーザーアカウントに保存します。

**引数:**

*   `finishRegisterParameter` (`Fido2FinishRegisterParameter`): `verifyRegisterCredential`と同じ。
*   `session` (`string`): `startRegisterCredential`で取得したセッション文字列。

**戻り値:**

*   `Promise<{ credential: CredentialData, user: UserDataWithCredentialCount }>`: 登録されたクレデンシャルデータとユーザー情報を含むオブジェクトを解決するPromise。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `startAuthenticate(startAuthenticateParameter)`

認証プロセスを開始します。ユーザーが指定されていない場合は、Discoverable Credentialによる認証が行われます。

**引数:**

*   `startAuthenticateParameter` (`Fido2StartAuthenticateParameter`): 認証開始のためのリクエストパラメータ。
    *   `requestOptionsBase` (`Fido2RequestOptionsBase`): WebAuthnの`PublicKeyCredentialRequestOptions`の基本部分。
        *   `timeout` (`number`, 省略可能): タイムアウト時間（ミリ秒）。
        *   `hints` (`string[]`, 省略可能): 認証方式をユーザーエージェント(ブラウザ等)に伝えるためのヒント。"security-key", "client-device", "hybrid"のいずれかの文字列の配列です。
        *   `userVerification` (`UserVerificationRequirement`, 省略可能): ユーザー検証の要件。"required", "preferred", "discouraged"のいずれかの文字列を設定します。
        *   `extensions` (`{ [key: string]: any }`, 省略可能): 拡張機能データ。
    *   `userId` (`string`, 省略可能): ユーザーID。Discoverable Credentialを使用する場合は省略します。
    *   `options` (`Fido2AuthenticateOptions`, 省略可能): 認証プロセスの追加オプション。このオブジェクトには現在メンバーが定義されていませんが、将来の拡張のために予約されています。

**戻り値:**

*   `Promise<{ requestOptions: PublicKeyCredentialRequestOptionsJSON, user?: UserData, session: string }>`: 認証のためのリクエストオプションとユーザー情報、セッション文字列を含むオブジェクトを解決するPromise。
    *   `requestOptions` (`PublicKeyCredentialRequestOptionsJSON`): WebAuthnの`navigator.credentials.get()`に渡すオプション。
    *   `user` (`UserData`, 省略可能): ユーザー情報。`userId`が指定されていない場合は`null`。
    *   `session` (`string`): 後続の`finishAuthenticate`で使用するセッション文字列。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `finishAuthenticate(finishAuthenticateParameter, session)`

認証プロセスを完了します。

**引数:**

*   `finishAuthenticateParameter` (`Fido2FinishAuthenticateParameter`): 認証を完了するためのパラメータ。
    *   `requestResponse`: 認証器からの応答。
        *   `attestationResponse` (`string | PublicKeyCredentialJSON`): 認証器からのAssertion応答。JSON文字列または`PublicKeyCredentialJSON`オブジェクト。`navigator.credentials.get()`の戻り値を設定します。
*   `session` (`string`): `startAuthenticate`で取得したセッション文字列。

**戻り値:**

*   `Promise<{ credential: CredentialData, user: UserDataWithCredentialCount, signalAllAcceptedCredentialsOptions: SignalAllAcceptedCredentialsOptions, signalCurrentUserDetailsOptions: SignalCurrentUserDetailsOptions }>`: 認証されたクレデンシャルデータとユーザー情報を含むオブジェクトを解決するPromise。
    *   `credential` (`CredentialData`): 認証に使用されたクレデンシャル情報。
    *   `user` (`UserDataWithCredentialCount`): 認証されたユーザー情報。
    *   `signalAllAcceptedCredentialsOptions` (`SignalAllAcceptedCredentialsOptions`): クライアント側でクレデンシャル情報を更新するためのシグナル情報。`PublicKeyCredential.signalAllAcceptedCredentials()`を呼び出すための引数として用います。
    *   `signalCurrentUserDetailsOptions` (`SignalCurrentUserDetailsOptions`): クライアント側でユーザー情報を更新するためのシグナル情報。`PublicKeyCredential.signalCurrentUserDetails()`を呼び出すための引数として用います。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `getCredential(userId, credentialId, withDisabledUser, withDisabledCredential)`

指定されたユーザーIDとクレデンシャルIDに一致するクレデンシャル情報を取得します。

**引数:**

*   `userId` (`string`): ユーザーID。
*   `credentialId` (`string`): クレデンシャルID。
*   `withDisabledUser` (`boolean`, 省略可能, デフォルト: `false`): 無効化されたユーザーを含めるかどうか。
*   `withDisabledCredential` (`boolean`, 省略可能, デフォルト: `false`): 無効化されたクレデンシャルを含めるかどうか。

**戻り値:**

*   `Promise<{ user: UserDataWithCredentialCount, credential: CredentialData }>`: ユーザー情報とクレデンシャル情報を含むオブジェクトを解決するPromise。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `updateCredential(credential, withUpdatedCheck)`

指定されたクレデンシャルの情報を更新します。

**引数:**

*   `credential` (`CredentialDataUpdateParameter`): 更新するクレデンシャル情報。
    *   `userId` (`string`): ユーザーID。
    *   `credentialId` (`string`): クレデンシャルID。
    *   `credentialName` (`string`): クレデンシャル名。
    *   `credentialAttributes` (`{ [key: string]: any } | string | null`, 省略可能): クレデンシャルの追加属性。
    *   `disabled` (`boolean`): クレデンシャルを無効にするかどうか。
    *   `updated` (`Date`, 省略可能): 最終更新日時。`withUpdatedCheck`が`true`の場合、この値とDB上の`updated`が一致しない場合は更新に失敗します。
*   `withUpdatedCheck` (`boolean`, 省略可能, デフォルト: `false`): 最終更新日時をチェックするかどうか。

**戻り値:**

*   `Promise<{ user: UserDataWithCredentialCount, credential: CredentialData }>`: 更新されたユーザー情報とクレデンシャル情報を含むオブジェクトを解決するPromise。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

### `deleteCredential(userId, credentialId)`

指定されたユーザーIDとクレデンシャルIDに一致するクレデンシャルを削除します。

**引数:**

*   `userId` (`string`): ユーザーID。
*   `credentialId` (`string`): クレデンシャルID。

**戻り値:**

*   `Promise<{ user: UserDataWithCredentialCount, credential: CredentialData, signalUnknownCredentialOptions: SignalUnknownCredentialOptions }>`: 削除されたユーザー情報とクレデンシャル情報を含むオブジェクトを解決するPromise。
    *   `user` (`UserDataWithCredentialCount`): ユーザー情報。
    *   `credential` (`CredentialData`): 削除されたクレデンシャル情報。
    *   `signalUnknownCredentialOptions` (`SignalUnknownCredentialOptions`): クライアント側でクレデンシャル情報を削除するためのシグナル情報。`PublicKeyCredential.signalUnknownCredential()`を呼び出すための引数として用います。

**発生する可能性のある例外:**

*   `FssApiError`: APIリクエストに失敗した場合に発生します。

---

## データ構造

### `UserDataWithCredentialCount`

ユーザー情報を表すオブジェクト。

*   `rpId` (`string`): RPのID。
*   `userId` (`string`): ユーザーID。
*   `userName` (`string`): ユーザー名。
*   `displayName` (`string | null`): 表示名。
*   `userAttributes` (`{ [key: string]: any } | null`): ユーザーの追加属性。RPが自由に設定する事が可能です。
*   `disabled` (`boolean`): ユーザーが無効かどうか。
*   `registered` (`Date`): 登録日時。
*   `updated` (`Date`): 最終更新日時。
*   `enabledCredentialCount` (`number`): 有効なクレデンシャルの数。
*   `credentialCount` (`number`): すべてのクレデンシャルの数。

### `CredentialData`

クレデンシャル情報を表すオブジェクト。

*   `rpId` (`string`): RPのID。
*   `userId` (`string`): ユーザーID。
*   `credentialId` (`string`): クレデンシャルID。
*   `credentialName` (`string`, 省略可能): クレデンシャル名。
*   `credentialAttributes` (`{ [key: string]: any } | null`, 省略可能): クレデンシャルの追加属性。RPが自由に設定する事が可能です。
*   `format` (`string`): クレデンシャルのフォーマット。
*   `userPresence` (`boolean`): ユーザープレゼンスが確認されたかどうか。
*   `userVerification` (`boolean`): ユーザー検証が成功したかどうか。
*   `backupEligibility` (`boolean`): バックアップ対象（同期パスキー）かどうか。
*   `backupState` (`boolean`): バックアップ（同期）されているかどうか。
*   `attestedCredentialData` (`boolean`): Attested Credential Dataが含まれているかどうか。
*   `extensionData` (`boolean`): 拡張機能データが含まれているかどうか。
*   `aaguid` (`string`, 省略可能): AAGUID。
*   `aaguidModelName` (`string`, 省略可能): AAGUIDから特定されたモデル名。
*   `publicKey` (`string`): 公開鍵。
*   `transportsRaw` (`string`, 省略可能): トランスポートのJSON文字列。
*   `transportsBle` (`boolean`, 省略可能): BLEをサポートするかどうか。
*   `transportsHybrid` (`boolean`, 省略可能): Hybridをサポートするかどうか。
*   `transportsInternal` (`boolean`, 省略可能): Internalをサポートするかどうか。
*   `transportsNfc` (`boolean`, 省略可能): NFCをサポートするかどうか。
*   `transportsUsb` (`boolean`, 省略可能): USBをサポートするかどうか。
*   `discoverableCredential` (`boolean`, 省略可能): Discoverable Credentialかどうか。
*   `enterpriseAttestation` (`boolean`): Enterprise Attestationかどうか。
*   `vendorId` (`string`, 省略可能): ベンダーID。EnterpriseAttestationをFIDO2Server側で正しく解析出来た場合に、ベンダーを示すIDが設定されます。
*   `authenticatorId` (`string`, 省略可能): 認証器ID。EnterpriseAttestationをFIDO2Server側で正しく解析出来た場合に、キーのシリアル番号などが設定されます。
*   `attestationObject` (`string`): Attestationオブジェクト。
*   `authenticatorAttachment` (`string`, 省略可能): 認証器のアタッチメントタイプ。
*   `credentialType` (`string`): クレデンシャルのタイプ。
*   `clientDataJson` (`string`): ClientDataJSON文字列。
*   `clientDataJsonRaw` (`string`): ClientDataJSONのバイナリ値表現(Base64URL)。
*   `lastAuthenticated` (`Date`, 省略可能): 最終認証日時。
*   `lastSignCounter` (`number`, 省略可能): 最終署名カウンター。
*   `disabled` (`boolean`): クレデンシャルが無効かどうか。
*   `registered` (`Date`): 登録日時。
*   `updated` (`Date`): 最終更新日時。

### `Fido2CredentialNameParameter`

クレデンシャル名を指定するためのパラメータです。単純な文字列、またはオブジェクトで指定します。
オブジェクトで指定した場合、以下のプロパティを持ちます。

*   `name` (`string`): 基本となるクレデンシャル名。
*   `nameIfModelNameExists` (`string`, 省略可能): 認証器のモデル名が取得できた場合に使用されるクレデンシャル名。
*   `nameIfEnterpriseAttestationExists` (`string`, 省略可能): Enterprise Attestationが利用可能な場合に使用されるクレデンシャル名。

**名前の決定ロジック:**

1.  登録時にEnterprise Attestationが検出された場合、`nameIfEnterpriseAttestationExists` が使用されます。
2.  登録時にAttestationが検出され、モデル名が取得できた場合、`nameIfModelNameExists` が使用されます。
3.  上記以外の場合、または対応するプロパティが省略されている場合は `name` が使用されます。

**プレースホルダー:**

クレデンシャル名には以下のプレースホルダーを含めることができ、登録時に実際の値に置換されます。

*   `$$`: `$`に置換されます。
*   `$modelName`: AAGUIDから導出された製品モデル名。
*   `$authenticatorId`: Enterprise Attestationの場合に証明書から導出された認証器ID（シリアル番号など）。

### `FssApiError`

APIエラーを表す例外クラス。`Error`クラスを継承しています。

*   `name` (`string`): エラー名。常に `"FssApiError"`。
*   `message` (`string`): エラーメッセージ。
*   `appStatus` (`FssApiResultStatus`): APIの処理結果ステータス。
*   `appSubStatus` (`FssApiErrorSubStatus`, 省略可能): APIの処理結果サブステータス。
    *   `errorCode` (`Fido2ErrorStatus`, 省略可能): FIDO2関連のエラーコード。
    *   `errorMessage` (`string`, 省略可能): FIDO2関連のエラーメッセージ。
    *   `info` (`any`, 省略可能): 追加情報。

---