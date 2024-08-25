<script lang="ts">
    import { twoFactorStore } from '$lib/stores/twoFactorStore';
    import { generateTotp } from '$lib/utils/otpAuth';
    import { onDestroy } from 'svelte';
  
    let codes: { [key: string]: string } = {};
    let timer: number;
  
    function updateCodes() {
      $twoFactorStore.forEach(account => {
        codes[account.id] = generateTotp(account);
      });
    }
  
    function startTimer() {
      updateCodes();
      timer = setInterval(updateCodes, 1000);
    }
  
    startTimer();
  
    onDestroy(() => {
      clearInterval(timer);
    });
  
    function copyCode(code: string) {
      navigator.clipboard.writeText(code);
      // TODO: Show a toast notification
    }
  
    function removeAccount(id: string) {
      if (confirm('Are you sure you want to remove this account?')) {
        twoFactorStore.removeAccount(id);
        twoFactorStore.save();
      }
    }
  </script>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each $twoFactorStore as account (account.id)}
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">{account.issuer}</h2>
          <p>{account.name}</p>
          <div class="text-3xl font-mono">{codes[account.id] || '------'}</div>
          <div class="card-actions justify-end">
            <button class="btn btn-primary" on:click={() => copyCode(codes[account.id])}>Copy</button>
            <button class="btn btn-error" on:click={() => removeAccount(account.id)}>Remove</button>
          </div>
        </div>
      </div>
    {/each}
  </div>