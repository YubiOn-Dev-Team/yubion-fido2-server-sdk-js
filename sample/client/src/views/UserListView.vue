<template>
	<div class="container">
		<h1>User List</h1>
		<p v-if="errorMessage" class="error">{{ errorMessage }}</p>
		<ul>
			<li v-for="user in users" :key="user.userId">
				<router-link :to="`/users/${user.userId}`">{{ user.displayName }} ({{ user.userName }})</router-link>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

interface User {
	userId: string;
	userName: string;
	displayName: string;
}

const users = ref<User[]>([]);
const errorMessage = ref('');

const fetchUsers = async () => {
	try {
		const response = await api.get('/users');
		users.value = response.data.users;
	} catch (error: any) {
		errorMessage.value = error.response?.data?.message || 'Failed to fetch users.';
		console.error(error);
	}
};

onMounted(fetchUsers);
</script>

<style scoped>
.container {
	max-width: 600px;
	margin: 50px auto;
	padding: 20px;
}
.error {
	color: red;
}
</style>
