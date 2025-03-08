
    export async function send_to_iframe(key, value) {
        try {
            if (!window.message_channel_port) {
                console.log("message channel port missing");
                return;
            }
            window.message_channel_port.postMessage({[key]: value});
        } catch (e) {
            return ""
        }
    };
