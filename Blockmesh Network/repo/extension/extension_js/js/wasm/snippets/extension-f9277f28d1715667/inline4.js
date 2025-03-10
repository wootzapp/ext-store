
    export async function get_storage_value(key) {
        try {
            let result = await chrome.storage.sync.get(key);
            if (result[key]) {
                return `${result[key]}`;
            }
            return "";
        } catch (e) {
            return ""
        }
    };
