<template>
	<div class="container">
		<h1>Register</h1>
		<form @submit.prevent="register">
			<div>
				<label for="name">Name (UserID):</label>
				<input id="name" v-model="name" type="text" required maxlength="64">
			</div>
			<div>
				<label for="displayName">Display Name:</label>
				<input id="displayName" v-model="displayName" type="text" required maxlength="64">
			</div>
			<p v-if="errorMessage" class="error">{{ errorMessage }}</p>
			<button type="submit" :disabled="loading">Register and Add Passkey</button>
		</form>
		<router-link to="/">Back to Login</router-link>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { convertCreationOptionsToBinary, convertPublicKeyCredentialToJsonable } from '@yubion-dev-team/yubion-fido2-server-sdk-client-js';
import api from '../services/api';

const router = useRouter();
const name = ref('');
const displayName = ref('');
const loading = ref(false);
const errorMessage = ref('');

const register = async () => {
	loading.value = true;
	errorMessage.value = '';
	try {
		// 1. Get challenge from server
		const { data } = await api.post('/register/start', {
			name: name.value,
			displayName: displayName.value,
		});
		const creationOptions = data.creationOptions;

		// 2. Convert options and call WebAuthn API
		const binaryOptions = convertCreationOptionsToBinary(creationOptions);
		const credential = await navigator.credentials.create({ publicKey: binaryOptions }) as PublicKeyCredential;

		if (!credential) {
			throw new Error('Credential creation failed or was canceled.');
		}

		// 3. Convert result to JSON and send to server
		const jsonableCredential = convertPublicKeyCredentialToJsonable(credential);
		const resp = {
			createResponse : {
				attestationResponse : jsonableCredential,
				transports : (credential.response as AuthenticatorAttestationResponse).getTransports(),
			}
		};
		await api.post('/register/finish', resp);
		
		alert('Registration successful! Please log in.');
		router.push('/');
	} catch (error: any) {
		errorMessage.value = error.response?.data?.message || 'Registration failed. Please try again.';
		console.error(error);
	} finally {
		loading.value = false;
	}
};
</script>

<style scoped>
.container {
	max-width: 400px;
	margin: 50px auto;
	padding: 20px;
	border: 1px solid #ccc;
	border-radius: 5px;
}
.error {
	color: red;
}
div {
	margin-bottom: 10px;
}
</style>
