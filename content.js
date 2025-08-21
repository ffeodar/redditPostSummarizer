(function () {
  const MARKER = "post-summarized-by-extension";

  async function processPost(post) {
    if (!post || post.nodeType !== 1) return;
    if (post.hasAttribute(MARKER)) return;
    post.setAttribute(MARKER, "1");

    const postSummary = document.createElement("div");
    postSummary.style.backgroundColor = "#ffdacc";
    postSummary.style.borderRadius = "8px";
    postSummary.style.padding = "12px";
    postSummary.style.margin = "10px 0";
    post.appendChild(postSummary);

    const permalink = post.getAttribute("permalink");
    if (!permalink) {
      return;
    }
    const parts = permalink.split("/");
    parts.pop();
    parts.pop();
    const jsonPostLink = "https://reddit.com" + parts.join("/") + "/.json";
    let postText = "";
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_POST_TEXT",
        postLink: jsonPostLink
      });
      postText = response.text;
      console.log("Loaded post text:", jsonPostLink);
    } catch (e) {
      console.error("Error loading post text:", e);
      postText = "(failed to get post text)";
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: "PROCESS_POST_TEXT",
        postText: postText
      });
      postSummary.textContent = "✨    " + response.text;
      console.log("Got model response:", response.text);
    } catch (e) {
      console.error("Error processing post text:", e);
      postSummary.textContent = "an error occurred: " + e.message;
    }
  }

  function scanExisting() {
    const posts = document.querySelectorAll("shreddit-post");
    posts.forEach((p) => processPost(p));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scanExisting, { once: true });
  } else {
    scanExisting();
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches && node.matches("shreddit-post")) {
          processPost(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll("shreddit-post").forEach((p) => processPost(p));
        }
      }
    }
  });

  function startObserver() {
    const target = document.body || document.documentElement;
    if (!target) {
      requestAnimationFrame(startObserver);
      return;
    }
    observer.observe(target, { childList: true, subtree: true });
  }

  startObserver();
})();
