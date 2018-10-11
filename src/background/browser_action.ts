import { getUserAndTweetFromUrl, matchTweetURL } from './parse_url';

namespace background {
    chrome.contextMenus.create({
        title: 'Archive Mode',
        contexts: ['page_action'],
        id: 'archive'
    })

    chrome.contextMenus.create({
        title: 'Help',
        contexts: ['page_action'],
        id: 'readme'
    })

    chrome.contextMenus.onClicked.addListener((info) => {
        if (info.menuItemId == 'archive') {
            let url = `resources/index.html`;
            chrome.tabs.create({ 'url': chrome.extension.getURL(url) });
        } else if (info.menuItemId == 'readme') {
            chrome.tabs.create({ 'url': 'https://github.com/paulgb/Treeverse/blob/master/README.md#readme' });
        }

    })

    chrome.pageAction.onClicked.addListener(function (tab) {
        let userTweetPair = getUserAndTweetFromUrl(tab.url);
        if (!userTweetPair) {
            return;
        }

        let [username, tweetId] = userTweetPair;

        var indexUrl = chrome.extension.getURL(`resources`);

        chrome.tabs.executeScript(tab.id, {
            file: 'resources/ext/d3.v4.min.js'
        }, () => {
            chrome.tabs.executeScript(tab.id, {
                file: 'resources/script/viewer.js'
            }, () => {
                chrome.tabs.executeScript(tab.id, {
                    code: `Treeverse.initialize(${JSON.stringify(indexUrl)}, ${JSON.stringify(username)}, ${JSON.stringify(tweetId)});`
                });
            });
        });
    });

    chrome.runtime.onInstalled.addListener((callback) => {
        (<any>chrome).declarativeContent.onPageChanged.removeRules(undefined, () => {
            (<any>chrome).declarativeContent.onPageChanged.addRules([
                {
                    conditions: [
                        new (<any>chrome).declarativeContent.PageStateMatcher({
                            pageUrl: {
                                urlMatches: matchTweetURL
                            }
                        })
                    ],
                    actions: [new (<any>chrome).declarativeContent.ShowPageAction()]
                }
            ]);
        });
    });
}