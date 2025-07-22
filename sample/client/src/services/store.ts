import { reactive } from 'vue';

interface User {
	id: string;
	name: string;
	displayName: string;
}

interface StoreState {
	user: User | null;
}

export const store = reactive<StoreState>({
	user: null,
});

export function setUser(user: User | null) {
	store.user = user;
}

