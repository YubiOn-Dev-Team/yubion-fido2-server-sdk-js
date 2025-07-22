<template>
	<div class="container">
		<h1>Login</h1>
		<form @submit.prevent="login">
			<p v-if="errorMessage" class="error">{{ errorMessage }}</p>
			<button type="submit" :disabled="loading">Login with Passkey</button>
		</form>
		<router-link to="/register">Create a new account</router-link>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { convertRequestOptionsToBinary, convertPublicKeyCredentialToJsonable } from '@yubion-dev-team/yubion-fido2-server-sdk-client-js';
import api from '../services/api';

const loading = ref(false);
const errorMessage = ref('');

const login = async () => {
	loading.value = true;
	errorMessage.value = '';
	try {
		// 1. Get challenge from server
		const { data } = await api.post('/login/start');
		const requestOptions = data.requestOptions;

		// 2. Convert options and call WebAuthn API
		const binaryOptions = convertRequestOptionsToBinary(requestOptions);
		const credential = await navigator.credentials.get({ publicKey: binaryOptions });

		if (!credential) {
			throw new Error('Credential retrieval failed or was canceled.');
		}

		// 3. Convert result to JSON and send to server
		const jsonableCredential = convertPublicKeyCredentialToJsonable(credential as PublicKeyCredential);
		const resp = {
			requestResponse: {
				attestationResponse : jsonableCredential,
			}
		};
		await api.post('/login/finish', resp);
		
		// Reload the page to update login state in App.vue
		window.location.href = '/users';
	} catch (error: any) {
		errorMessage.value = error.response?.data?.message || 'Login failed. Please try again.';
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
</style>
