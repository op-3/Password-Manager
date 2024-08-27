<script lang="ts">
  import "../app.css";
  import { onMount } from 'svelte';
  import ThemeController from '$lib/components/ThemeController.svelte';
  import { page } from '$app/stores';

  onMount(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  });
</script>

<div class="flex flex-col min-h-screen bg-base-100 text-base-content">
  <main class="flex-grow container mx-auto p-4 pb-20">
    <slot />
  </main>

  <nav class="fixed bottom-0 left-0 right-0 h-16 bg-base-200 shadow-lg flex items-center justify-around">
    <a href="/" class="flex flex-col items-center justify-center w-1/3 h-full" class:text-primary={$page.url.pathname === "/"}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <span class="text-xs mt-1">Home</span>
    </a>
    <ThemeController />
    <a href="/settings" class="flex flex-col items-center justify-center w-1/3 h-full" class:text-primary={$page.url.pathname === "/settings"}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="text-xs mt-1">Settings</span>
    </a>
  </nav>
</div>