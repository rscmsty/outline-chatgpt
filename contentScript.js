chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrollTo') {
        const element = document.querySelector(`[data-turn-id="${request.turnId}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});
