<template>
	<div class="container" v-if="user">
		<h1>User Detail</h1>
		<p><strong>Name (UserID):</strong> {{ user.user.userName }}</p>
		<p><strong>Display Name:</strong> {{ user.user.displayName }}</p>

		<h2>Credentials</h2>
		<p v-if="errorMessage" class="error">{{ errorMessage }}</p>
		<ul>
			<li v-for="cred in user.credentials" :key="cred.credentialId">
				<span>{{ cred.credentialName }} ( {{ cred.credentialId }} )</span>
				<button v-if="isCurrentUser" @click="deleteCredential(cred.credentialId)" class="delete-btn">Delete</button>
			</li>
		</ul>

		<div v-if="isCurrentUser">
			<button @click="addCredential" :disabled="loading">Add New Credential</button>
		</div>
		<router-link to="/users">Back to User List</router-link>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { convertCreationOptionsToBinary, convertPublicKeyCredentialToJsonable } from '@yubion-dev-team/yubion-fido2-server-sdk-client-js';
import api from '../services/api';
import { store } from '../services/store';

interface Credential {
	credentialId: string;
	credentialName: string;
}

interface User {
	user : {
		userId: string;
		userName: string;
		displayName: string;
	},
	credentials: Credential[];
}

const route = useRoute();
const user = ref<User | null>(null);
const loading = ref(false);
const errorMessage = ref('');

const userId = computed(() => route.params.id as string);
const isCurrentUser = computed(() => store.user?.id === userId.value);

const fetchUser = async () => {
	errorMessage.value = '';
	try {
		const response = await api.get(`/users/${userId.value}`);
		user.value = response.data;
	} catch (error: any) {
		errorMessage.value = 'Failed to fetch user details.';
		console.error(error);
	}
};

const addCredential = async () => {
	loading.value = true;
	errorMessage.value = '';
	try {
		// 1. Get challenge from server
		const { data } = await api.post(`/users/${userId.value}/credentials/start`);
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
		await api.post(`/users/${userId.value}/credentials/finish`, resp);
		
		await fetchUser(); // Refresh user data
	} catch (error: any) {
		errorMessage.value = 'Failed to add new credential.';
		console.error(error);
	} finally {
		loading.value = false;
	}
};

const deleteCredential = async (credentialId: string) => {
	if (user.value?.credentials.length === 1) {
		alert('You cannot delete the last credential.');
		return;
	}
	if (!confirm('Are you sure you want to delete this credential?')) {
		return;
	}
	errorMessage.value = '';
	try {
		await api.delete(`/users/${userId.value}/credentials/${credentialId}`);
		await fetchUser(); // Refresh user data
	} catch (error: any) {
		errorMessage.value = 'Failed to delete credential.';
		console.error(error);
	}
};

onMounted(fetchUser);
</script>

<style scoped>
.container {
	max-width: 800px;
	margin: 50px auto;
	padding: 20px;
}
.error {
	color: red;
}
.delete-btn {
	margin-left: 10px;
	background-color: #ff4d4d;
	color: white;
	border: none;
	padding: 2px 5px;
	border-radius: 3px;
	cursor: pointer;
}
</style>
