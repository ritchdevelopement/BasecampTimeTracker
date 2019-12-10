(function() {
    "use strict";
    var basecamp_tt_pp = {
        init: () => {
            basecamp_tt_pp.initTaskStorage();
            basecamp_tt_pp.initOptionStorage();
            basecamp_tt_pp.getTimerInterval();
            basecamp_tt_pp.setActiveTimersBadge();
        },
        getTimerInterval: () => {
            return setInterval(() => {
                basecamp_tt_pp.getTaskStorage().then((taskStorage) => {
                    for(var i in taskStorage) {
                        if(!taskStorage[i].paused) {
                            taskStorage[i].time += 1;
                        }
                    }
                    basecamp_tt_pp.setTaskStorage(taskStorage);
                }).catch((error) => {
                    console.log(error);
                });
            }, 1000);
        },
        setActiveTimersBadge: () => {
            browser.browserAction.setBadgeText({ text: "0" });
            browser.browserAction.setBadgeBackgroundColor({ color: "#FF0000" });
            browser.browserAction.setBadgeTextColor({ color: "#FFF" });
            browser.storage.onChanged.addListener((changes, area) => {
                if(changes.taskStorage) {
                    var newTaskStorage = changes.taskStorage.newValue;
                    var numberofTimers = newTaskStorage.length;
                    browser.browserAction.setBadgeText({ text: numberofTimers.toString() });
                }
            });
        },
        initTaskStorage: () => {
            basecamp_tt_pp.getTaskStorage().then((taskStorage) => {
                if(!taskStorage) {
                    basecamp_tt_pp.setTaskStorage([]);
                }
            }).catch((error) => {
                console.log(error);
            });
        },
        initOptionStorage: () => {
            basecamp_tt_pp.getOptionStorage().then((optionStorage) => {
                if(!optionStorage) {
                    basecamp_tt_pp.setOptionStorage([]);
                }
            }).catch((error) => {
                console.log(error);
            });
        },
        setOptionStorage: (optionsArray) => {
            browser.storage.local.set({
                optionStorage: optionsArray
            });
        },
        setTaskStorage: (taskArray) => {
            browser.storage.local.set({
                taskStorage: taskArray
            });
        },
        getOptionStorage: () => {
            return browser.storage.local.get("optionStorage").then((res) => {
                return res.optionStorage;
            });
        },
        getTaskStorage: () => {
            return browser.storage.local.get("taskStorage").then((res) => {
                return res.taskStorage;
            });
        }
    }
    basecamp_tt_pp.init();
})();