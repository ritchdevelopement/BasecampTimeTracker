(function() {
    "use strict";
    var basecamp_tt_pp = {
        init: function() {
            basecamp_tt_pp.initTaskStorage();
            basecamp_tt_pp.increaseTimerInterval();
        },
        increaseTimerInterval: function() {
            var interval, taskStoragePromise, tasks, i;
            var interval = setInterval(function() {
                taskStoragePromise = basecamp_tt_pp.getTaskStorage();
                taskStoragePromise.then(function(res) {
                    tasks = res.taskStorage;
                    for(i in tasks) {
                        if(!tasks[i].paused){ 
                            tasks[i].time += 1;
                        }
                    }
                    basecamp_tt_pp.setTaskStorage(tasks);
                }).catch(function(err) {
                    console.log(err);
                });
            }, 1000);
            return interval;
        },
        initTaskStorage: function() {
            var taskStoragePromise;
            taskStoragePromise = basecamp_tt_pp.getTaskStorage();
            taskStoragePromise.then(function(res) {
                if(!res.taskStorage) basecamp_tt_pp.setTaskStorage([]);
            }).catch(function(err) {
                console.log(err);
            });
        },
        setTaskStorage: function(taskArray) {
            browser.storage.local.set({
                taskStorage: taskArray
            });
        },
        getTaskStorage: function() {
            return browser.storage.local.get("taskStorage");
        }
    }
    basecamp_tt_pp.init();
})();