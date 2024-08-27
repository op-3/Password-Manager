<script lang="ts">
    import { onMount } from 'svelte';
    import { passwords } from '$lib/stores/passwords';
    import { twoFactorStore } from '$lib/stores/twoFactorStore';
  
    let theme = 'light';
    let language = 'en';
  
    onMount(() => {
      theme = localStorage.getItem('theme') || 'light';
      language = localStorage.getItem('language') || 'en';
      document.documentElement.setAttribute('data-theme', theme);
    });
  
    function saveSettings() {
      localStorage.setItem('theme', theme);
      localStorage.setItem('language', language);
      document.documentElement.setAttribute('data-theme', theme);
      alert('تم حفظ الإعدادات بنجاح!');
    }
  
    function exportData() {
      const data = {
        passwords: $passwords,
        twoFactor: $twoFactorStore
      };
      const dataStr = JSON.stringify(data);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'password_manager_data.json';
  
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  
    function importData(event: Event) {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const contents = e.target?.result;
          try {
            const data = JSON.parse(contents as string);
            if (data.passwords && data.twoFactor) {
              passwords.set(data.passwords);
              twoFactorStore.set(data.twoFactor);
              alert('تم استيراد البيانات بنجاح!');
            } else {
              alert('تنسيق البيانات غير صالح');
            }
          } catch (error) {
            console.error('خطأ في تحليل JSON:', error);
            alert('خطأ في استيراد البيانات');
          }
        };
        reader.readAsText(file);
      }
    }
  </script>
  
  <div class="container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4">الإعدادات</h2>
    
    <div class="form-control w-full max-w-xs mb-4">
      <label for="theme" class="label">
        <span class="label-text">السمة:</span>
      </label>
      <select id="theme" class="select select-bordered" bind:value={theme}>
        <option value="light">فاتح</option>
        <option value="dark">داكن</option>
      </select>
    </div>
  
    <div class="form-control w-full max-w-xs mb-4">
      <label for="language" class="label">
        <span class="label-text">اللغة:</span>
      </label>
      <select id="language" class="select select-bordered" bind:value={language}>
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  
    <button class="btn btn-primary mb-4" on:click={saveSettings}>حفظ الإعدادات</button>
  
    <h3 class="text-xl font-bold mb-4">إدارة البيانات</h3>
    <button class="btn btn-secondary mb-4" on:click={exportData}>تصدير البيانات</button>
    
    <div class="form-control w-full max-w-xs">
      <label for="importFile" class="label">
        <span class="label-text">استيراد البيانات:</span>
      </label>
      <input type="file" id="importFile" on:change={importData} accept=".json" class="file-input file-input-bordered w-full max-w-xs" />
    </div>
  </div>