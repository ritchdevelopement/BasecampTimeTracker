(function() {
    "use strict";
    var basecamp_tt_pp = {
        init: function() {
            basecamp_tt_pp.initTaskStorage();
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
            chrome.storage.onChanged.addListener(function(changes, area) {
                activeTimer = 0;
                taskStorage = changes.taskStorage.newValue;
                for(i in taskStorage) {
                    if(!taskStorage[i].paused){ 
                        activeTimer += 1;
                    }
                }
                chrome.browserAction.setBadgeText({text: activeTimer.toString()});
            });
        },
        initTaskStorage: function() {
            var tasks;
            chrome.storage.local.get("taskStorage", function(res) {
                tasks = res.taskStorage;
                if(!tasks) {
                    basecamp_tt_pp.setTaskStorage([]);
                }
            });
        },
        setTaskStorage: function(taskArray) {
            chrome.storage.local.set({taskStorage: taskArray}, function() {
            });
        }
    }
    basecamp_tt_pp.init();
})();