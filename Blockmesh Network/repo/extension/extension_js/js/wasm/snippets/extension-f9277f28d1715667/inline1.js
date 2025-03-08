
    export function report_progress(msg) {
        function onSuccess(message) {
            console.log(`report_progress::onSuccess: ${JSON.stringify(message)}`);
        }
        function onError(error) {
            console.log(`report_progress::onError: ${error}`);
        }
        try {
            chrome.runtime.sendMessage(msg).then(onSuccess, onError)
        } catch (e) {
            console.log('report_progress', { e })
        }
    }