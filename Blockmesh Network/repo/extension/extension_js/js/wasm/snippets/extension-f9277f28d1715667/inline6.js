
    export function storageOnChange(callback) {
        chrome.storage.sync.onChanged.addListener((changes, namespace) => {
            Object.keys(changes).forEach((key) => {
                callback( { [key]: changes[key].newValue } );
            });
        });
    }
