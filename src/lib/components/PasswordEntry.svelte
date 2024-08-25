<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { PasswordEntry, PasswordStrength } from '$lib/types';
    import { passwords } from '$lib/stores/passwords';
    import { generatePassword, checkPasswordStrength } from '$lib/utils/passwordStrength';
  
    const dispatch = createEventDispatcher<{ close: void }>();
  
    let entry: Omit<PasswordEntry, 'id' | 'lastUpdated'> = {
      website: '',
      username: '',
      password: '',
      category: ''
    };
    let passwordStrength: PasswordStrength = { score: 0, feedback: '' };
  
    async function handleSubmit() {
    passwords.add(entry);
    await passwords.save();
    dispatch('close');
  }
    function handlePasswordChange() {
      passwordStrength = checkPasswordStrength(entry.password);
    }
  
    function generateNewPassword() {
      entry.password = generatePassword();
      handlePasswordChange();
    }
    
  </script>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="website" class="label">Website</label>
      <input id="website" bind:value={entry.website} required class="input input-bordered w-full" />
    </div>
  
    <div>
      <label for="username" class="label">Username</label>
      <input id="username" bind:value={entry.username} required class="input input-bordered w-full" />
    </div>
  
    <div>
      <label for="password" class="label">Password</label>
      <div class="flex">
        <input id="password" bind:value={entry.password} on:input={handlePasswordChange} required type="password" class="input input-bordered flex-grow" />
        <button type="button" on:click={generateNewPassword} class="btn btn-outline ml-2">Generate</button>
      </div>
      <progress class="progress w-full mt-2" value={passwordStrength.score} max="4"></progress>
      <p class="text-sm mt-1" class:text-error={passwordStrength.score < 3} class:text-success={passwordStrength.score >= 3}>
        {passwordStrength.feedback}
      </p>
    </div>
  
    <div>
      <label for="category" class="label">Category</label>
      <input id="category" bind:value={entry.category} class="input input-bordered w-full" />
    </div>
  
    <div class="flex justify-end">
      <button type="button" on:click={() => dispatch('close')} class="btn btn-ghost mr-2">Cancel</button>
      <button type="submit" class="btn btn-primary">Save</button>
    </div>
  </form>