<script lang="ts">
  import { passwords } from '$lib/stores/passwords';
  import { twoFactorStore } from '$lib/stores/twoFactorStore';
  import { invoke } from '@tauri-apps/api/tauri';
  import { fade } from 'svelte/transition';

  let isExporting = false;
  let isImporting = false;
  let importStatus = '';

  async function exportData() {
    isExporting = true;
    try {
      const data = await invoke<string>('export_data');
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'password_manager_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      importStatus = 'تم تصدير البيانات بنجاح';
    } catch (error) {
      console.error('Failed to export data:', error);
      importStatus = 'فشل تصدير البيانات';
    } finally {
      isExporting = false;
      setTimeout(() => importStatus = '', 3000);
    }
  }

  async function importData(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      isImporting = true;
      const reader = new FileReader();
      reader.onload = async function(e) {
        const contents = e.target?.result;
        try {
          const data = JSON.parse(contents as string);
          if (!data.passwords || !data.two_factor_accounts) {
            throw new Error('Invalid data format');
          }
          await invoke('import_data', { data });
          await passwords.load();
          await twoFactorStore.load();
          importStatus = 'تم استيراد البيانات بنجاح';
        } catch (error) {
          console.error('Error importing data:', error);
          importStatus = 'فشل استيراد البيانات';
        } finally {
          isImporting = false;
          setTimeout(() => importStatus = '', 3000);
        }
      };
      reader.readAsText(file);
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-b from-base-200 to-base-300 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-base-content">الإعدادات</h1>
      <p class="mt-3 text-xl text-base-content/80">إدارة بيانات التطبيق وتخصيصه</p>
    </div>

    <div class="bg-base-100 shadow-xl rounded-lg overflow-hidden">
      <div class="p-6 sm:p-8">
        <h2 class="text-2xl font-bold text-base-content mb-6">إدارة البيانات</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-medium text-base-content mb-2">تصدير البيانات</h3>
            <p class="text-base-content/70 mb-4">قم بتصدير جميع بياناتك لحفظها أو نقلها إلى جهاز آخر.</p>
            <button 
              class="btn btn-primary w-full sm:w-auto"
              on:click={exportData}
              disabled={isExporting}
            >
              {isExporting ? 'جاري التصدير...' : 'تصدير البيانات'}
            </button>
          </div>

          <div>
            <h3 class="text-lg font-medium text-base-content mb-2">استيراد البيانات</h3>
            <p class="text-base-content/70 mb-4">قم باستيراد بياناتك من ملف JSON تم تصديره مسبقًا.</p>
            <label for="importFile" class="btn btn-secondary w-full sm:w-auto">
              {isImporting ? 'جاري الاستيراد...' : 'اختر ملف للاستيراد'}
            </label>
            <input 
              type="file" 
              id="importFile" 
              on:change={importData} 
              accept=".json" 
              class="hidden"
              disabled={isImporting}
            />
          </div>
        </div>

        {#if importStatus}
          <div transition:fade class="mt-6 p-4 rounded-md bg-info text-info-content">
            {importStatus}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>