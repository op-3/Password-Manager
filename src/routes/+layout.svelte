<script lang="ts">
    import "../app.css";
    import { onMount } from 'svelte';
    import ThemeController from '$lib/components/ThemeController.svelte';
  
    onMount(() => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
    });
  </script>
  
  <div class="min-h-screen bg-base-100 text-base-content">
    <nav class="navbar bg-base-200 shadow-lg">
      <div class="flex-1">
        <a href="/" class="btn btn-ghost normal-case text-xl">Password Manager</a>
      </div>
      <div class="flex-none">
        <ThemeController />
      </div>
    </nav>
  
    <main class="container mx-auto p-4">
      <slot />
    </main>
  

  </div>