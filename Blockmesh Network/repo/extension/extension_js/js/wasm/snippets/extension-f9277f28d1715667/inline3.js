
    export async function remove_storage_value(key) {
        try {
            await chrome.storage.sync.remove(key);
        } catch (e) {
            return ""
        }
    };
