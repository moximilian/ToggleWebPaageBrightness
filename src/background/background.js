chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendTabsMessages(request, sendResponse)
})
chrome.tabs.onUpdated.addListener(tabId => {
    // Проверяем, что URL вкладки допустим
    chrome.storage.sync.get('lastRequest').then(items => {
        // chrome.tabs.sendMessage(tab.id, items.lastRequest)
        chrome.scripting
            .executeScript({
                target: { tabId },
                files: ['content/content.js'],
            })
            .then(() => {
                chrome.tabs.sendMessage(tabId, items.lastRequest)
                // sendResponse?.(items.lastRequest.value)
            })
    })
})

sendTabsMessages = (request, sendResponse = null) => {
    chrome.tabs.query({ currentWindow: true }, tabs => {
        tabs.forEach(tab => {
            if (!tab) return console.error('No active tab')
            chrome.scripting
                .executeScript({
                    target: { tabId: tab.id },
                    files: ['content/content.js'],
                })
                .then(() => {
                    chrome.tabs.sendMessage(tab.id, request)
                    sendResponse?.({ status: 'success', value: request.value })
                })
        })
    })
    return true
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.lastRequest?.newValue) {
        sendTabsMessages(changes.lastRequest?.newValue)
    }
})

const storageCache = { count: 0 }
const initStorageCache = chrome.storage.sync.get().then(items => {
    Object.assign(storageCache, items)
})

chrome.action.onClicked.addListener(async tab => {
    try {
        await initStorageCache
    } catch (e) {
        console.error('Storage init error', JSON.stringify(e))
    }
    storageCache.lastTabId = tab.id
    chrome.storage.sync.set(storageCache)
})
