import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { defineConfig } from 'vite';

// BASE_PATH is set by the GitHub Actions workflow (e.g. "/Calamitydle").
// Locally it is empty, so `npm run dev` keeps working at the root.
const base = process.env.BASE_PATH ?? '';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({ fallback: '404.html' }),
			paths: { base }
		})
	]
});
