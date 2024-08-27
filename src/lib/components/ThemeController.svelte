<script lang="ts">
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

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

  $: currentTheme = themes.find(t => t.name === $theme) || themes[0];
</script>

<div class="relative flex flex-col items-center justify-center w-1/3 h-full">
  <button on:click={toggleThemeSelector} class="flex flex-col items-center justify-center w-full h-full focus:outline-none" aria-label="Toggle theme selector">
    <span class="text-2xl">{currentTheme.icon}</span>
    <span class="text-xs mt-1">Themes</span>
  </button>
  
  {#if isOpen}
    <div 
      class="absolute bottom-full mb-2 p-4 bg-base-200 rounded-lg shadow-xl z-50 w-64"
      transition:fly="{{ y: 10, duration: 300 }}"
    >
      <h3 class="font-bold text-lg mb-4 text-center">Select Theme</h3>
      <div class="grid grid-cols-3 gap-4">
        {#each themes as { name, icon }}
          <button
            on:click={() => setTheme(name)}
            class="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-base-300 transition-colors duration-200"
            class:bg-primary={name === $theme}
            class:text-primary-content={name === $theme}
          >
            <span class="text-2xl mb-1">{icon}</span>
            <span class="text-xs capitalize">{name}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>