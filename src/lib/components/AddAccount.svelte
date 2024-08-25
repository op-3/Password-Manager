<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { twoFactorAccounts } from '../stores/twoFactorAccounts';
    import type { TwoFactorAccount } from '../stores/twoFactorAccounts';
    import QrScanner from 'qr-scanner'; // You'll need to install this package
  
    const dispatch = createEventDispatcher();
  
    let secretKey = '';
    let accountName = '';
    let issuer = '';
    let qrImage: File | null = null;
    let qrResult = '';
  
    async function handleSubmit() {
      if (secretKey) {
        const newAccount: Omit<TwoFactorAccount, 'id'> = {
          name: accountName,
          issuer: issuer,
          secret: secretKey,
          type: 'TOTP' // Default to TOTP, can be changed if needed
        };
  
        twoFactorAccounts.add(newAccount);
        await twoFactorAccounts.save();
        dispatch('accountAdded');
        resetForm();
      }
    }
  
    function resetForm() {
      secretKey = '';
      accountName = '';
      issuer = '';
      qrImage = null;
      qrResult = '';
    }
  
    async function handleQrUpload(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        qrImage = target.files[0];
        try {
          const result = await QrScanner.scanImage(qrImage);
          parseQrResult(result);
        } catch (error) {
          console.error('Failed to scan QR code:', error);
        }
      }
    }
  
    function parseQrResult(result: string) {
      qrResult = result;
      // Parse the otpauth:// URL
      try {
        const url = new URL(result);
        if (url.protocol === 'otpauth:') {
          const params = new URLSearchParams(url.search);
          secretKey = params.get('secret') || '';
          issuer = params.get('issuer') || '';
          accountName = decodeURIComponent(url.pathname.substring(1));
        }
      } catch (error) {
        console.error('Failed to parse QR code result:', error);
      }
    }
  
    function handlePaste(event: ClipboardEvent) {
      const pastedText = event.clipboardData?.getData('text');
      if (pastedText) {
        if (pastedText.startsWith('otpauth://')) {
          parseQrResult(pastedText);
        } else {
          secretKey = pastedText;
        }
      }
    }
  </script>
  
  <div class="card bg-base-200 shadow-xl p-4">
    <h3 class="text-xl font-bold mb-4">Add New Account</h3>
    
    <form on:submit|preventDefault={handleSubmit}>
      <div class="mb-4">
        <label for="secretKey" class="block mb-2">Secret Key or otpauth:// URL</label>
        <input
          id="secretKey"
          type="text"
          bind:value={secretKey}
          on:paste={handlePaste}
          placeholder="Enter secret key or paste otpauth:// URL"
          class="input input-bordered w-full"
          required
        />
      </div>
  
      <div class="mb-4">
        <label for="qrUpload" class="block mb-2">Or upload a QR code image</label>
        <input
          id="qrUpload"
          type="file"
          accept="image/*"
          on:change={handleQrUpload}
          class="file-input file-input-bordered w-full"
        />
      </div>
  
      {#if secretKey}
        <div class="mb-4">
          <label for="accountName" class="block mb-2">Account Name</label>
          <input
            id="accountName"
            type="text"
            bind:value={accountName}
            placeholder="e.g. example@gmail.com"
            class="input input-bordered w-full"
            required
          />
        </div>
  
        <div class="mb-4">
          <label for="issuer" class="block mb-2">Issuer (Optional)</label>
          <input
            id="issuer"
            type="text"
            bind:value={issuer}
            placeholder="e.g. Google"
            class="input input-bordered w-full"
          />
        </div>
      {/if}
  
      <button type="submit" class="btn btn-primary mt-4" disabled={!secretKey}>Add Account</button>
    </form>
  </div>