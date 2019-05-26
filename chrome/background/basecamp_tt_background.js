(function() {
    "use strict";
    var basecamp_tt_pp = {
        init: function() {
            basecamp_tt_pp.initTaskStorage();
            basecamp_tt_pp.increaseTimerInterval();
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