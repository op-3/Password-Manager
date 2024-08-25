<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { twoFactorStore } from '$lib/stores/twoFactorStore';
    import type { TwoFactorAccount } from '$lib/types/twoFactor';
    import { parseOtpAuthUri } from '$lib/utils/otpAuth';
    import jsQR from 'jsqr';
    import base32Decode from 'base32-decode';
    import * as protobuf from 'protobufjs';
  
    const dispatch = createEventDispatcher();
  
    let input = '';
    let accountName = '';
    let issuer = '';
    let secret = '';
    let type: TwoFactorAccount['type'] = 'TOTP';
    let algorithm: TwoFactorAccount['algorithm'] = 'SHA1';
    let digits = 6;
    let period = 30;
  
    let qrImageFile: File | null = null;
    let importedAccounts: (Partial<TwoFactorAccount> & { selected?: boolean })[] = [];
    let qrProcessingError = '';
  
    const googleAuthProto = `
      syntax = "proto3";
      message MigrationPayload {
        repeated OtpParameters otp_parameters = 1;
      }
      message OtpParameters {
        bytes secret = 1;
        string name = 2;
        string issuer = 3;
        int32 algorithm = 4;
        int32 digits = 5;
        int32 type = 6;
        int64 counter = 7;
      }
    `;
  
    function handleInput() {
      if (input.startsWith('otpauth://')) {
        const parsed = parseOtpAuthUri(input);
        if (parsed) {
          ({ name: accountName, issuer, secret, type, algorithm, digits, period } = parsed);
        }
      } else {
        secret = input.replace(/\s/g, '');
      }
    }
  
    async function handleQrImageImport(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        qrImageFile = target.files[0];
        qrProcessingError = '';
        importedAccounts = [];
  
        try {
          const imageData = await getImageData(qrImageFile);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            console.log('QR Code data:', code.data); // Для отладки
            importedAccounts = await parseMultipleAccounts(code.data);
            if (importedAccounts.length === 0) {
              qrProcessingError = 'QR code detected, but no valid accounts found.';
            }
          } else {
            qrProcessingError = 'No QR code detected in the image.';
          }
        } catch (error) {
          console.error('Error processing QR image:', error);
          qrProcessingError = 'Error processing the image. Please try a different image.';
        }
      }
    }
  
    async function getImageData(file: File): Promise<ImageData> {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(ctx.getImageData(0, 0, img.width, img.height));
          } else {
            reject(new Error('Could not create canvas context'));
          }
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    }
  
    async function parseMultipleAccounts(data: string): Promise<(Partial<TwoFactorAccount> & { selected?: boolean })[]> {
      if (data.startsWith('otpauth-migration://offline?data=')) {
        return parseGoogleAuthenticatorExport(data);
      } else if (data.startsWith('otpauth://')) {
        const account = parseOtpAuthUri(data);
        return account ? [{ ...account, selected: true }] : [];
      } else if (data.includes('\n')) {
        return data.split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('otpauth://'))
          .map(uri => ({ ...parseOtpAuthUri(uri), selected: true }))
          .filter((account): account is Partial<TwoFactorAccount> & { selected: boolean } => account !== null);
      }
      return [];
    }
  
    async function parseGoogleAuthenticatorExport(data: string): Promise<(Partial<TwoFactorAccount> & { selected: boolean })[]> {
      try {
        const uriData = data.split('data=')[1];
        const decodedData = decodeURIComponent(uriData);
        const binaryData = atob(decodedData);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }
  
        const root = protobuf.parse(googleAuthProto).root;
        const MigrationPayload = root.lookupType('MigrationPayload');
        const payload = MigrationPayload.decode(bytes);
        const decodedPayload = MigrationPayload.toObject(payload, {
          longs: String,
          enums: String,
          bytes: String,
        });
  
        return decodedPayload.otpParameters.map(otp => ({
          name: otp.name,
          issuer: otp.issuer,
          secret: base32Decode(otp.secret, 'RFC4648').toString('hex'),
          type: otp.type === 2 ? 'TOTP' : 'HOTP',
          algorithm: ['SHA1', 'SHA256', 'SHA512'][otp.algorithm - 1] || 'SHA1',
          digits: otp.digits,
          period: 30,
          selected: true
        }));
      } catch (error) {
        console.error('Failed to parse Google Authenticator export:', error);
        return [];
      }
    }
  
    function handleSubmit() {
      const newAccount = {
        name: accountName,
        issuer,
        secret,
        type,
        algorithm,
        digits,
        period
      };
      twoFactorStore.addAccount(newAccount);
      twoFactorStore.save();
      dispatch('close');
    }
  
    function addSelectedAccounts() {
      const selectedAccounts = importedAccounts.filter(account => account.selected);
      twoFactorStore.addMultipleAccounts(selectedAccounts as TwoFactorAccount[]);
      twoFactorStore.save();
      dispatch('close');
    }
  </script>
  
  <div class="card bg-base-200 shadow-xl p-4">
    <h3 class="text-xl font-bold mb-4">Add New 2FA Account</h3>
    
    <form on:submit|preventDefault={handleSubmit}>
      <input
        type="text"
        bind:value={input}
        on:input={handleInput}
        placeholder="Enter secret key or otpauth:// URL"
        class="input input-bordered w-full mb-4"
      />
  
      <div class="mb-4">
        <label for="qr-image" class="block mb-2">Import QR Code Image</label>
        <input
          id="qr-image"
          type="file"
          accept="image/*"
          on:change={handleQrImageImport}
          class="file-input file-input-bordered w-full"
        />
        {#if qrProcessingError}
          <p class="text-error mt-2">{qrProcessingError}</p>
        {/if}
      </div>
  
      {#if importedAccounts.length > 0}
        <div class="mb-4">
          <h4 class="text-lg font-semibold mb-2">Imported Accounts</h4>
          {#each importedAccounts as account, index}
            <div class="p-2 bg-base-300 rounded mb-2 flex items-center">
              <input type="checkbox" bind:checked={account.selected} class="checkbox mr-2">
              <div>
                <p><strong>Name:</strong> {account.name}</p>
                <p><strong>Issuer:</strong> {account.issuer}</p>
              </div>
            </div>
          {/each}
          <button type="button" class="btn btn-primary w-full" on:click={addSelectedAccounts}>
            Add Selected Accounts
          </button>
        </div>
      {:else if secret}
        <input
          type="text"
          bind:value={accountName}
          placeholder="Account Name"
          class="input input-bordered w-full mb-2"
          required
        />
        <input
          type="text"
          bind:value={issuer}
          placeholder="Issuer (optional)"
          class="input input-bordered w-full mb-2"
        />
        <select bind:value={type} class="select select-bordered w-full mb-2">
          <option value="TOTP">TOTP</option>
          <option value="HOTP">HOTP</option>
          <option value="STEAM">Steam</option>
        </select>
        <select bind:value={algorithm} class="select select-bordered w-full mb-2">
          <option value="SHA1">SHA1</option>
          <option value="SHA256">SHA256</option>
          <option value="SHA512">SHA512</option>
        </select>
        <input
          type="number"
          bind:value={digits}
          placeholder="Digits"
          class="input input-bordered w-full mb-2"
          min="6"
          max="8"
        />
        <input
          type="number"
          bind:value={period}
          placeholder="Period (seconds)"
          class="input input-bordered w-full mb-2"
          min="30"
          step="30"
        />
        <button type="submit" class="btn btn-primary w-full">Add Account</button>
      {/if}
    </form>
  </div>