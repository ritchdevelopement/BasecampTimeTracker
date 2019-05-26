
(function() {
    "use strict";
    var basecamp_tt = {
        init: function() {
            basecamp_tt.addTimerButtonToTasks();
            basecamp_tt.addTaskToTimeTracker();
        },
        addTimerButtonToTasks: function() {
            var controlsDiv, timerButtonHTML;
            controlsDiv = document.querySelectorAll(".list .controls");
            timerButtonHTML = "<span class='icon add'></span>";
            controlsDiv.forEach(function(c) {
                c.insertAdjacentHTML("beforeend", timerButtonHTML);
            });
        },
        addTaskToTimeTracker: function() {
            var addButtons, taskId, taskExtractedNum, taskName, tasks, taskStoragePromise, i;
            addButtons = document.querySelectorAll(".icon");
            addButtons.forEach(function(addButton) {
                addButton.onclick = function() {
                    taskId = addButton.parentNode.nextElementSibling.id;
                    taskExtractedNum = taskId.match(/\d+/g).map(Number)[0];
                    taskName = document.querySelector("#item_wrap_" + taskExtractedNum).textContent;
                    taskStoragePromise = basecamp_tt.getTaskStorage();
                    taskStoragePromise.then(function(res) {
                        tasks = res.taskStorage;
                        for(i in tasks) {
                            if(tasks[i].id === taskExtractedNum) {
                                alert("A Task with this id is already added to the time tracker!");
                                return;
                            }
                        }
                        tasks.push(basecamp_tt.createTaskObject(taskExtractedNum, taskName));
                        basecamp_tt.setTaskStorage(tasks);
                    });
                };
            }).catch(function(err) {
                console.log(err);
            });
           
        },
        createTaskObject: function(taskId, taskName) {
            var task;
            task = {
                id: taskId,
                name: taskName,
                time: 0,
                paused: false
            }
            return task;
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