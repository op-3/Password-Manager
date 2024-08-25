<script lang="ts">
    import { onMount } from 'svelte';
    import { twoFactorStore } from '../stores/twoFactorStore';
    import TwoFactorList from './TwoFactorList.svelte';
    import AddTwoFactorAccount from './AddTwoFactorAccount.svelte';
  
    let showAddAccount = false;
  
    onMount(() => {
      twoFactorStore.load();
    });
  </script>
  
  <div class="container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
  
    <button 
      class="btn btn-primary mb-4" 
      on:click={() => showAddAccount = !showAddAccount}
    >
      {showAddAccount ? 'Cancel' : 'Add New Account'}
    </button>
  
    {#if showAddAccount}
      <AddTwoFactorAccount on:close={() => showAddAccount = false} />
    {/if}
  
    <TwoFactorList />
  </div>