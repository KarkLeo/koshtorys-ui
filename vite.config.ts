import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import graphql from '@rollup/plugin-graphql';

export default defineConfig({
	plugins: [sveltekit(), graphql()]
});
