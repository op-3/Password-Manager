<script lang="ts">
    import { onMount } from 'svelte';
    import PasswordList from '$lib/components/PasswordList.svelte';
    import PasswordEntry from '$lib/components/PasswordEntry.svelte';
    import TwoFactorAuth from '$lib/components/TwoFactorAuth.svelte';
    import { passwords, filteredPasswords } from '$lib/stores/passwords';
  
    let showPasswordEntry = false;
    let activeTab = 'passwords';
  
    onMount(async () => {
      await passwords.load();
    });
  </script>
  
  <div class="hero bg-base-200 mb-8">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">Password Manager</h1>
        <p class="py-6">Securely store and manage all your passwords in one place.</p>
      </div>
    </div>
  </div>
  
  <div class="container mx-auto p-4">
    <div class="tabs tabs-boxed mb-4">
      <a class="tab" class:tab-active={activeTab === 'passwords'} on:click={() => activeTab = 'passwords'}>Passwords</a>
      <a class="tab" class:tab-active={activeTab === '2fa'} on:click={() => activeTab = '2fa'}>Two-Factor Auth</a>
    </div>
  
    {#if activeTab === 'passwords'}
      <div class="mb-4">
        <button class="btn btn-primary" on:click={() => showPasswordEntry = true}>
          Add New Password
        </button>
      </div>
  
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <PasswordList />
        </div>
      </div>
  
      {#if showPasswordEntry}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-base-100 p-6 rounded-lg shadow-2xl w-full max-w-md">
            <PasswordEntry on:close={() => showPasswordEntry = false} />
          </div>
        </div>
      {/if}
  
      <div class="mt-8 text-center">
        <p class="text-lg">Total passwords: <span class="font-bold">{$filteredPasswords.length}</span></p>
      </div>
    {:else if activeTab === '2fa'}
      <TwoFactorAuth />
    {/if}
  </div>