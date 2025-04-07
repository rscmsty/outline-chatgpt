document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: extractContent,
            }).then((results) => {
                if (results && results[0] && results[0].result) {
                    document.getElementById("output").innerHTML = results[0].result;
                } else {
                    document.getElementById("output").innerText = "No data extracted.";
                }
            }).catch(err => {
                document.getElementById("output").innerText = "Failed to extract.";
                console.error("Failed to inject script: ", err);
            });
        } else {
            document.getElementById("output").innerText = "No active tab.";
        }
    });
});

// Function to extract content from the page
function extractContent() {
    const articleSelector = "article.w-full.text-token-text-primary";
    const keyTextSelector = "h3 strong";

    const articles = document.querySelectorAll(articleSelector);
    let outputText = `Found ${articles.length} articles:<br><br>`;

    articles.forEach((article, index) => {
        const allText = article.textContent.trim().split("\n").map(line => line.trim()).filter(line => line.length > 0);
        const firstLine = allText.length > 0 ? allText[0]: "(No content found)";

        let from_server = false
        let firstLineProcessed = ''
        const firstLineIndex = firstLine.indexOf("said:");
        if (firstLineIndex !== -1) {
            firstLineProcessed = firstLine.slice(0, firstLineIndex + 5) + "<br>" + firstLine.slice(firstLineIndex + 5);
        }

        if (firstLine.includes("ChatGPT said")) {
            from_server = true
        }
        if (!from_server) {
            const blueText = `<span style="color: blue;">${firstLineProcessed}</span>`;
            firstLineProcessed = blueText


        }

        // get content of the h3 strong element
        const keyTextElements = article.querySelectorAll(keyTextSelector);
        const keyTexts = Array.from(keyTextElements).map(el => el.textContent.trim()).filter(text => text.length > 0);

        outputText += `${firstLineProcessed}<br>`;
        if (keyTexts.length > 0) {
            outputText += `${keyTexts.join(" <br> ")}<br>`;
        }
        if (from_server) {
            outputText += `<br>--------<br>`;
        }
        outputText += "<br>";
    });

    return outputText;
}



