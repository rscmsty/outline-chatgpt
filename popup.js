document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: extractContent,
            }).then((results) => {
                if (results && results[0] && results[0].result) {
                    const outputDiv = document.getElementById("output");
                    outputDiv.innerHTML = ''; // Clear previous content
                    results[0].result.forEach(item => {
                        const div = document.createElement('div');
                        if (item.role === 'user') {
                            div.innerHTML = item.text;
                        } else if (item.role === 'assistant') {
                            div.innerHTML = '&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;'; // Visual separator
                        }
                        div.className = `item item-${item.role}`;
                        div.addEventListener('click', () => {
                            chrome.tabs.sendMessage(activeTab.id, {
                                action: 'scrollTo',
                                turnId: item.turnId
                            });
                        });
                        outputDiv.appendChild(div);
                    });
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

function extractContent() {
    const turns = document.querySelectorAll('[data-turn-id]');
    const extracted = [];
    turns.forEach(turn => {
        const turnId = turn.dataset.turnId;
        const role = turn.dataset.turn;
        let text = '';

        if (role === 'user') {
            let fullText = '';
            const quoteEl = turn.querySelector('button.text-token-text-tertiary p');
            if (quoteEl) {
                fullText += `<blockquote>${quoteEl.textContent.trim()}</blockquote>`;
            }

            const userTextEl = turn.querySelector('.whitespace-pre-wrap');
            if (userTextEl) {
                fullText += userTextEl.textContent.trim();
            }
            text = fullText;

        } else if (role === 'assistant') {
            text = '---'; 
        }

        if (text) {
            extracted.push({ turnId, role, text });
        }
    });
    return extracted;
}