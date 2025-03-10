
    export async function set_storage_value(key, value) {
        try {
            await chrome.storage.sync.set({ [key]: value });
        } catch (e) {
            return ""
        }
    };
