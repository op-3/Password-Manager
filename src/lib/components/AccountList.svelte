<script lang="ts">
    import { twoFactorAccounts } from '../stores/twoFactorAccounts';
    import { generateTOTP } from '../utils/twoFactorAuth';
  
    export let searchTerm = '';
  
    $: filteredAccounts = $twoFactorAccounts.filter(account => 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.issuer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    function copyToClipboard(code: string) {
      navigator.clipboard.writeText(code);
      // TODO: Show a toast notification
    }
  </script>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each filteredAccounts as account (account.id)}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">{account.issuer}</h3>
          <p>{account.name}</p>
          <div class="flex justify-between items-center mt-2">
            <span class="text-2xl font-mono">{generateTOTP(account.secret)}</span>
            <button class="btn btn-sm btn-ghost" on:click={() => copyToClipboard(generateTOTP(account.secret))}>
              Copy
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>