
(function() {
    "use strict";
    var basecamp_tt = {
        init: function() {
            basecamp_tt.initTaskStorage();
            basecamp_tt.addTimerButtonToTasks();
            basecamp_tt.addTaskToTimeTracker();
        },
        addTimerButtonToTasks: function() {
            var controlsDiv, timerButtonHTML;
            controlsDiv = document.querySelectorAll(".controls");
            timerButtonHTML = "<span class='timer'></span>";
            controlsDiv.forEach(function(c) {
                c.insertAdjacentHTML("beforeend", timerButtonHTML);
            });
        },
        addTaskToTimeTracker: function() {
            var timerButtons, timerId, timerExtractedNum, timerTaskName, tasks, taskStoragePromise;
            timerButtons = document.querySelectorAll(".timer");
            timerButtons.forEach(function(t) {
                t.onclick = function() {
                    taskStoragePromise = basecamp_tt.getTaskStorage();
                    taskStoragePromise.then(function(res) {
                        timerId = t.parentNode.nextElementSibling.id;
                        timerExtractedNum = timerId.match(/\d+/g).map(Number)[0];
                        timerTaskName = document.querySelector("#item_wrap_" + timerExtractedNum).textContent;
                        tasks = res.taskStorage;
                        tasks.push(basecamp_tt.createTask(timerExtractedNum, timerTaskName));
                        basecamp_tt.setTaskStorage(tasks);
                        console.log(tasks);
                    });
                };
            }).catch(function(err) {
                console.log(err);
            });
           
        },
        createTask: function(taskNumber, taskName) {
            var task;
            task = {
                id: taskNumber,
                name: taskName,
                startTime: Date.now(),
                endTime: 0,
                totalTime: 0,
                paused: false
            }
            return task;
        },
        initTaskStorage: function() {
            var taskStoragePromise;
            taskStoragePromise = basecamp_tt.getTaskStorage();
            taskStoragePromise.then(function(res) {
                if(!res.taskStorage) basecamp_tt.setTaskStorage([]);
            });
        },
        getTaskStorage: function() {
            return browser.storage.local.get("taskStorage");
        },
        setTaskStorage: function(taskArray) {
            browser.storage.local.set({
                taskStorage: taskArray
            });
        },
    }
    basecamp_tt.init();
})();