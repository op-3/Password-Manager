<script lang="ts">
    import { writable } from 'svelte/store';
  
    const themes = [
      { name: "light", icon: "☀️" },
      { name: "dark", icon: "🌙" },
      { name: "cupcake", icon: "🧁" },
      { name: "bumblebee", icon: "🐝" },
      { name: "emerald", icon: "💎" },
      { name: "corporate", icon: "🏢" }
    ];
  
    const theme = writable(localStorage.getItem('theme') || 'light');
  
    theme.subscribe(value => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', value);
        localStorage.setItem('theme', value);
      }
    });
  
    let isOpen = false;
  
    function toggleThemeSelector() {
      isOpen = !isOpen;
    }
  
    function setTheme(newTheme: string) {
      theme.set(newTheme);
      isOpen = false;
    }
  </script>
  
  <div class="relative">
    <button on:click={toggleThemeSelector} class="btn btn-ghost btn-circle">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    </button>
    
    {#if isOpen}
      <div class="absolute right-0 mt-2 p-4 bg-base-200 rounded-lg shadow-xl z-50 w-64">
        <h3 class="font-bold text-lg mb-4 text-center">Select Theme</h3>
        <div class="grid grid-cols-3 gap-4">
          {#each themes as { name, icon }}
            <button
              on:click={() => setTheme(name)}
              class="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-base-300 transition-colors duration-200"
              data-theme={name}
            >
              <span class="text-2xl mb-1">{icon}</span>
              <span class="text-xs capitalize">{name}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    button[data-theme] {
      aspect-ratio: 1 / 1;
    }
  </style>