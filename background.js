var registered = null;

async function register() {
    browser.tabs.query({}).then(tabs => {
            for (const tab of tabs) {
                browser.tabs.executeScript(tab.id, {
                    file: "content_scripts/korsotin.js",
                    runAt: "document_end"
                });
            }
        },
        error => {
            console.log(`Virhe: ${error}`);
        }
    );
    registered = await browser.contentScripts.register({
        matches: ["<all_urls>"],
        js: [{
            file: "content_scripts/korsotin.js"
        }],
        runAt: "document_end"
    });
}

function toggle() {
    if (registered) {
        if (typeof browser.browserAction.setIcon === 'function') {
            browser.browserAction.setIcon({
                path: {
                    32: "icons/korso-harmaa-32.png",
                    64: "icons/korso-harmaa-64.png",
                }
            });
        }
        browser.browserAction.setTitle({
            title: "Korsoroi"
        });
        registered.unregister();
        registered = null;
        browser.tabs.query({}).then(tabs => {
                for (const tab of tabs) {
                    browser.tabs.reload(tab.id);
                }
            },
            error => {
                console.log(`Virhe: ${error}`);
            }
        );
    } else {
        if (typeof browser.browserAction.setIcon === 'function') {
            browser.browserAction.setIcon({
                path: {
                    32: "icons/korso-32.png",
                    64: "icons/korso-64.png",
                }
            });
        }
        browser.browserAction.setTitle({
            title: "Lopeta korsorointi"
        });
        register();
    }
}

browser.browserAction.onClicked.addListener(toggle);
browser.runtime.onInstalled.addListener(async ({
    reason,
    temporary,
}) => {
    //if (temporary) return; // skip during development
    switch (reason) {
        case "install": {
            const url = browser.runtime.getURL(
                "views/installed.html");
            await browser.tabs.create({
                url,
            });
        }
        break;
    }
});
