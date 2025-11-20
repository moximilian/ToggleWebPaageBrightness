loadContent = async tabId => {
    await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/content.js'],
    })
}

sendTabMessage = async (tabId, request, count = 0) => {
    try {
        if (count > 10) return
        await chrome.tabs.sendMessage(tabId, request)
    } catch (err) {
        // console.error(err, count)
        await loadContent(tabId)
        await sendTabMessage(tabId, request, count++)
    }
}

sendTabsMessages = (request, sendResponse = null) => {
    chrome.tabs.query({ currentWindow: true }, tabs => {
        tabs.forEach(async tab => {
            // if (!tab) return console.error('No active tab')
            await sendTabMessage(tab.id, request)
            sendResponse?.({ status: 'success', value: request.value })
        })
    })
    return true
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendTabsMessages(request, sendResponse)
})

chrome.tabs.onUpdated.addListener(tabId => {
    chrome.storage.sync.get('lastRequest').then(items => {
        sendTabMessage(tabId, items.lastRequest)
    })
})

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
