(function() {
    "use strict";
    var basecamp_tt_pp = {
        init: function() {
            basecamp_tt_pp.initTaskStorage();
            basecamp_tt_pp.initOptionStorage();
            basecamp_tt_pp.getTimerInterval();
            basecamp_tt_pp.setActiveTimersBadge();
        },
        getTimerInterval: () => {
            return setInterval(() => {
                basecamp_tt_pp.getTaskStorage((taskStorage) => {
                    for(var i in taskStorage) {
                        if(!taskStorage[i].paused) {
                            taskStorage[i].time += 1;
                        }
                    }
                    basecamp_tt_pp.setTaskStorage(taskStorage);
                });
            }, 1000);
        },
        setActiveTimersBadge: () => {
            chrome.browserAction.setBadgeText({ text: "0" });
            chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000" });
            chrome.storage.onChanged.addListener((changes, area) => {
                if(changes.taskStorage) {
                    var newTaskStorage = changes.taskStorage.newValue;
                    var numberofTimers = newTaskStorage.length;
                    chrome.browserAction.setBadgeText({ text: numberofTimers.toString() });
                }
            });
        },
        initTaskStorage: () => {
            basecamp_tt_pp.getTaskStorage((taskStorage) => {
                if(!taskStorage) {
                    basecamp_tt_pp.setTaskStorage([]);
                }
            });
        },
        initOptionStorage: () => {
            basecamp_tt_pp.getOptionStorage((optionStorage) => {
                if(!optionStorage) {
                    basecamp_tt_pp.setOptionStorage([]);
                }
            });
        },
        setOptionStorage: (optionsArray) => {
            chrome.storage.local.set({ optionStorage: optionsArray }, () => {
            });
        },
        setTaskStorage: (taskArray) => {
            chrome.storage.local.set({ taskStorage: taskArray }, () => {
            });
        },
        getOptionStorage: (callback) => {
            chrome.storage.local.get("optionStorage", (res) => {
                callback(res.optionStorage);
            });
        },
        getTaskStorage: (callback) => {
            chrome.storage.local.get("taskStorage", (res) => {
                callback(res.taskStorage);
            });
        }
    }
    basecamp_tt_pp.init();
})();