chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === "PROCESS_POST_TEXT") {
        const postText = message.postText || "";
        console.log("Processing post text:", postText);

        const prompt = `Provide a brief summary of this text in 1-2 sentences (your response must contain only the summary and nothing else):\n\n${postText}`;

        fetch("http://localhost:11434/v1/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gemma3:1b",
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
    }
});

