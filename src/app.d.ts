// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	declare namespace svelteHTML {
		// enhance attributes
		interface HTMLAttributes<T> {
			'on:escape'?: (event: CustomEvent<MouseEvent | KeyboardEvent>) => void
		}
	}

	interface Window {
		setDevMode: Function
		setUserMode: Function
	}
}

export {}
