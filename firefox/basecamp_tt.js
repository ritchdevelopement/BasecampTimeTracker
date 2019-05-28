
(function() {
    "use strict";
    var basecamp_tt = {
        init: function() {
            basecamp_tt.addTimerButtonToTasks();
            basecamp_tt.addTaskToTimeTracker();
            basecamp_tt.addMarkForTrackedTasks();
        },
        addTimerButtonToTasks: function() {
            var controlDivs, timerButtonHTML;
            controlDivs = document.querySelectorAll(".list .controls");
            timerButtonHTML = "<span class='icon add'></span>";
            controlDivs.forEach(function(controlDiv) {
                controlDiv.insertAdjacentHTML("beforeend", timerButtonHTML);
            });
        },
        addTaskToTimeTracker: function() {
            var addButtons, taskId, taskExtractedNum, taskName, tasks, taskStoragePromise, i, taskUrl, taskItem;
            addButtons = document.querySelectorAll(".icon");
            addButtons.forEach(function(addButton) {
                addButton.onclick = function() {
                    taskId = addButton.parentNode.nextElementSibling.id;
                    taskExtractedNum = taskId.match(/\d+/g).map(Number)[0];
                    taskName = document.querySelector("#item_wrap_" + taskExtractedNum).textContent;
                    taskItem = document.querySelector("body.todos #item_" + taskExtractedNum);
                    taskItem.style.backgroundImage = "linear-gradient(to right, #72b740, white 1.5%)";
                    taskUrl = window.location.href;
                    taskStoragePromise = basecamp_tt.getTaskStorage();
                    taskStoragePromise.then(function(res) {
                        tasks = res.taskStorage;
                        for(i in tasks) {
                            if(tasks[i].id === taskExtractedNum) {
                                alert("A task with this id is already added to the time tracker!");
                                return;
                            }
                        }
                        tasks.push(basecamp_tt.createTaskObject(taskExtractedNum, taskName, taskUrl));
                        basecamp_tt.setTaskStorage(tasks);
                    }).catch(function(err) {
                        console.log(err);
                    });
                };
            });
        },
        addMarkForTrackedTasks: function() {
            var tasks, taskStoragePromise, i, taskElement;
            taskStoragePromise = basecamp_tt.getTaskStorage();
            taskStoragePromise.then(function(res) {
                tasks = res.taskStorage;
                for(i in tasks) {
                    if(tasks[i].url) {
                        taskElement = document.querySelector("body.todos #item_" + tasks[i].id);
                        taskElement.style.backgroundImage = "linear-gradient(to right, #72b740, white 1.5%)";
                    }
                }
            }).catch(function(err) {
                console.log(err);
            });
        },
        createTaskObject: function(taskId, taskName, taskUrl) {
            var task;
            task = {
                id: taskId,
                name: taskName,
                time: 0,
                paused: false,
                url: taskUrl
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