async function getModelName() {
    try {
        const result = await chrome.storage.local.get(['modelName']);
        return result.modelName || 'gemma3:1b';
    } catch (error) {
        console.error('Error getting model from storage:', error);
        return 'gemma3:1b';
    }
}

async function setModelName(modelName) {
    try {
        await chrome.storage.local.set({ modelName: modelName });
        console.log('Model saved to storage:', modelName);
        return true;
    } catch (error) {
        console.error('Error saving model to storage:', error);
        return false;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === "PROCESS_POST_TEXT") {
        const postText = message.postText || "";
        const prompt = `Provide a brief summary of this text in 1-2 sentences (your response must contain only the summary and nothing else):\n\n${postText}`;

        getModelName().then(modelName => {
            console.log("Using model:", modelName);
            
            fetch("http://localhost:11434/v1/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: modelName,
                    prompt: prompt,
                    max_tokens: 100,
                    temperature: 0.7
                })
            })
            .then(async (res) => {
                console.log("Ollama API response status:", res.status);
                let text = "";
                try {
                    const data = await res.json();
                    if (data.choices && data.choices[0] && data.choices[0].text) {
                        text = data.choices[0].text.trim();
                    } else {
                        text = "(unexpected response format)";
                    }
                } catch (e) {
                    text = "(failed to parse response)";
                }
                sendResponse({ text });
            })
            .catch((err) => {
                console.error("Ollama API request error:", err);
                sendResponse({ text: "(request error: " + err.message + ")" });
            });
        }).catch((err) => {
            console.error("Error getting model:", err);
            sendResponse({ text: "(error getting model)" });
        });

        return true;
    } else if (message && message.type === "GET_POST_TEXT") {
        const postLink = message.postLink || "";
        console.log("Loading post text from:", postLink);

        fetch(postLink)
            .then(async (res) => {
                console.log("Reddit API response status:", res.status);
                let text = "";
                try {
                    const data = await res.json();
                    if (data && data[0] && data[0].data && data[0].data.children && data[0].data.children[0]) {
                        text = data[0].data.children[0].data.selftext || data[0].data.children[0].data.title || "";
                    }
                    if (!text) {
                        text = "(no text content found)";
                    }
                } catch (e) {
                    text = "(failed to parse response)";
                }
                sendResponse({ text });
            })
            .catch((err) => {
                console.error("Reddit API request error:", err);
                sendResponse({ text: "(request error: " + err.message + ")" });
            });

        return true;
    } else if (message && message.type === "GET_MODEL_NAME") {
        getModelName().then(modelName => {
            sendResponse({ modelName: modelName });
        }).catch((err) => {
            console.error("Error getting model:", err);
            sendResponse({ modelName: "gemma3:1b" });
        });

        return true;
    } else if (message && message.type === "SET_MODEL_NAME") {
        const newModelName = message.modelName;
        if (!newModelName) {
            sendResponse({ success: false, error: "No model provided" });
            return true;
        }

        setModelName(newModelName).then(success => {
            sendResponse({ success: success });
        }).catch((err) => {
            console.error("Error setting model:", err);
            sendResponse({ success: false, error: err.message });
        });

        return true;
    }
});

