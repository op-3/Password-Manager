<script lang="ts">
    import { onMount } from 'svelte';
    import PasswordList from '$lib/components/PasswordList.svelte';
    import PasswordEntry from '$lib/components/PasswordEntry.svelte';
    import TwoFactorAuth from '$lib/components/TwoFactorAuth.svelte';
    import { passwords, filteredPasswords } from '$lib/stores/passwords';
    import { fade, fly } from 'svelte/transition';
  
    let showPasswordEntry = false;
    let activeTab = 'passwords';
  
    onMount(async () => {
      await passwords.load();
    });
  
    function togglePasswordEntry() {
      showPasswordEntry = !showPasswordEntry;
    }
  </script>
  
  <div class="min-h-screen bg-gradient-to-b from-base-200 to-base-300 pb-20">
    <div class="hero py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div class="max-w-3xl mx-auto">
            <h1 class="text-5xl font-extrabold text-base-content mb-4">Password Manager</h1>
            <p class="text-xl text-base-content/80">Store and manage all your passwords securely in one place.</p>
        </div>
    </div>
  
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-base-100 rounded-lg shadow-xl overflow-hidden">
            <div class="flex border-b border-base-300">
                <button 
                    class="flex-1 py-4 px-6 text-lg font-medium focus:outline-none transition-colors duration-200"
                    class:text-primary={activeTab === 'passwords'}
                    class:border-b-2={activeTab === 'passwords'}
                    class:border-primary={activeTab === 'passwords'}
                    on:click={() => activeTab = 'passwords'}
                >
                    Passwords
                </button>
                <button 
                    class="flex-1 py-4 px-6 text-lg font-medium focus:outline-none transition-colors duration-200"
                    class:text-primary={activeTab === '2fa'}
                    class:border-b-2={activeTab === '2fa'}
                    class:border-primary={activeTab === '2fa'}
                    on:click={() => activeTab = '2fa'}
                >
                    Two-Factor Authentication
                </button>
            </div>
  
            <div class="p-6">
                {#if activeTab === 'passwords'}
                    <div class="flex justify-between items-center mb-6">
                        <button class="btn btn-primary" on:click={togglePasswordEntry}>
                            Add New Password
                        </button>
                        <p class="text-base-content/70">
                            Total Passwords: <span class="font-bold text-primary">{$filteredPasswords.length}</span>
                        </p>
                    </div>
  
                    <div class="bg-base-200 rounded-lg p-4">
                        <PasswordList />
                    </div>
                {:else if activeTab === '2fa'}
                    <TwoFactorAuth />
                {/if}
            </div>
        </div>
    </div>
  </div>
  
  {#if showPasswordEntry}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" transition:fade>
        <div class="bg-base-100 p-6 rounded-lg shadow-2xl w-full max-w-md" transition:fly="{{ y: 50, duration: 300 }}">
            <PasswordEntry on:close={togglePasswordEntry} />
        </div>
    </div>
  {/if}
  
  <style>
    /* Add any additional styles here if needed */
  </style>
  