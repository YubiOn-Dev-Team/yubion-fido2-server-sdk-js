<template>
	<div id="app-container">
		<header v-if="isLoggedIn">
			<nav>
				<span>Welcome, {{ store.user?.displayName }}</span>
				<button @click="logout">Logout</button>
			</nav>
		</header>
		<main>
			<RouterView />
		</main>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import { store, setUser } from './services/store';
import api from './services/api';

const router = useRouter();
const route = useRoute();
const isLoggedIn = computed(() => !!store.user);

const checkLoginStatus = async () => {
	try {
		const { data } = await api.get('/session');
		if (data.loggedIn) {
			setUser(data.user);
		} else {
			setUser(null);
			// If not logged in and not on a public page, redirect to login
			if (route.name !== 'login' && route.name !== 'register') {
				router.push('/');
			}
		}
	} catch (error) {
		console.error('Failed to check session status:', error);
		setUser(null);
		router.push('/');
	}
};

const logout = async () => {
	try {
		await api.post('/logout');
		setUser(null);
		router.push('/');
	} catch (error) {
		console.error('Logout failed:', error);
	}
};

// Check login status when the app is loaded
onMounted(checkLoginStatus);

// Expose for other components
defineExpose({ checkLoginStatus });
</script>

<style>
#app-container {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
}

header {
	background: #f8f9fa;
	padding: 10px 20px;
	border-bottom: 1px solid #dee2e6;
	display: flex;
	justify-content: flex-end;
	align-items: center;
}

nav span {
	margin-right: 15px;
}

nav button {
	padding: 5px 10px;
	cursor: pointer;
}

main {
	padding: 20px;
}
</style>