(function() {
    "use strict";
    var basecamp_tt_pp = {
        init: function() {
            basecamp_tt_pp.initTaskStorage();
            basecamp_tt_pp.initOptionStorage();
            basecamp_tt_pp.increaseTimerInterval();
            basecamp_tt_pp.setActiveTimerBadgeText();
        },
        increaseTimerInterval: function() {
            var interval, taskStorage, i;
            interval = setInterval(function() {
                chrome.storage.local.get("taskStorage", function(res) {
                    taskStorage = res.taskStorage;
                    for(i in taskStorage) {
                        if(!taskStorage[i].paused){ 
                            taskStorage[i].time += 1;
                        }
                    }
                    basecamp_tt_pp.setTaskStorage(taskStorage);
                });
            }, 1000);
            return interval;
        },
        setActiveTimerBadgeText: function() {
            var taskStorage, activeTimer, i;
            chrome.browserAction.setBadgeText({text: "0"});
            chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});
            chrome.storage.onChanged.addListener(function(changes, area) {
                if(changes.taskStorage) {
                    activeTimer = 0;
                    taskStorage = changes.taskStorage.newValue;
                    for(i in taskStorage) {
                        activeTimer += 1;
                    }
                    chrome.browserAction.setBadgeText({text: activeTimer.toString()});
                }
            });
        },
        initTaskStorage: function() {
            chrome.storage.local.get("taskStorage", function(res) {
                if(!res.taskStorage) basecamp_tt_pp.setOptionsStorage([]);
            });
        },
        initOptionStorage: function() {
            chrome.storage.local.get("optionStorage", function(res) {
                if(!res.optionStorage) basecamp_tt_pp.setOptionsStorage([]);
            });
        },
        setOptionsStorage: function(optionsArray) {
            chrome.storage.local.set({optionStorage: optionsArray}, function() {
            });
        },
        setTaskStorage: function(taskArray) {
            chrome.storage.local.set({taskStorage: taskArray}, function() {
            });
        }
    }
    basecamp_tt_pp.init();
})();