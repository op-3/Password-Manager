<script lang="ts">
    import { filteredPasswords, passwords, searchTerm } from '$lib/stores/passwords';
    import { fade } from 'svelte/transition';
    import type { PasswordEntry } from '$lib/types';
  
    let editingEntry: PasswordEntry | null = null;
  
    function formatDate(dateString: string): string {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    }
  
    function copyToClipboard(text: string) {
      navigator.clipboard.writeText(text);
      // TODO: Add a toast notification here
    }
  
    async function deletePassword(id: string) {
      if (confirm('Are you sure you want to delete this password?')) {
        passwords.remove(id);
        await passwords.save();
      }
    }
  
    async function deleteAllPasswords() {
      if (confirm('Are you sure you want to delete all passwords? This action cannot be undone.')) {
        passwords.deleteAll();
        await passwords.save();
      }
    }
  
    function startEditing(entry: PasswordEntry) {
      editingEntry = { ...entry };
    }
  
    async function saveEdit() {
      if (editingEntry) {
        passwords.update(editingEntry.id, editingEntry);
        await passwords.save();
        editingEntry = null;
      }
    }
  
    function cancelEdit() {
      editingEntry = null;
    }
  </script>
  
  <div class="mb-4">
    <input
      type="text"
      placeholder="Search passwords..."
      bind:value={$searchTerm}
      class="input input-bordered w-full"
    />
  </div>
  
  <div class="mb-4">
    <button on:click={deleteAllPasswords} class="btn btn-error">Delete All Passwords</button>
  </div>
  
  <div class="overflow-x-auto">
    <table class="table w-full">
      <thead>
        <tr>
          <th>Website</th>
          <th>Username</th>
          <th>Password</th>
          <th>Category</th>
          <th>Last Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $filteredPasswords as entry (entry.id)}
          <tr transition:fade class="hover">
            {#if editingEntry && editingEntry.id === entry.id}
              <td><input bind:value={editingEntry.website} class="input input-bordered w-full" /></td>
              <td><input bind:value={editingEntry.username} class="input input-bordered w-full" /></td>
              <td><input type="password" bind:value={editingEntry.password} class="input input-bordered w-full" /></td>
              <td><input bind:value={editingEntry.category} class="input input-bordered w-full" /></td>
              <td>{formatDate(editingEntry.lastUpdated)}</td>
              <td>
                <button on:click={saveEdit} class="btn btn-sm btn-success">Save</button>
                <button on:click={cancelEdit} class="btn btn-sm btn-ghost">Cancel</button>
              </td>
            {:else}
              <td>{entry.website}</td>
              <td>{entry.username}</td>
              <td>••••••••</td>
              <td>{entry.category}</td>
              <td>{formatDate(entry.lastUpdated)}</td>
              <td>
                <div class="btn-group">
                  <button on:click={() => copyToClipboard(entry.password)} class="btn btn-sm btn-outline">
                    Copy
                  </button>
                  <button on:click={() => startEditing(entry)} class="btn btn-sm btn-outline btn-info">
                    Edit
                  </button>
                  <button on:click={() => deletePassword(entry.id)} class="btn btn-sm btn-outline btn-error">
                    Delete
                  </button>
                </div>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>