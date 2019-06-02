
(function() {
    "use strict";
    var basecamp_tt = {
        init: function() {
            basecamp_tt.addTimerButtonToTasks();
            basecamp_tt.addTaskToTimeTracker();
            basecamp_tt.addMarkForTrackedTasks();
            basecamp_tt.onRemoveTaskRemoveMark();
            basecamp_tt.onMutationAddTimerButtonToTask();
        },
        addTimerButtonToTasks: function() {
            var controlDivs, timerButtonHTML;
            controlDivs = document.querySelectorAll(".list.list_with_time_tracking .controls");
            timerButtonHTML = "<span class='icon add'></span>";
            controlDivs.forEach(function(controlDiv) {
                controlDiv.insertAdjacentHTML("beforeend", timerButtonHTML);
            });
        },
        addTaskToTimeTracker: function() {
            var addButtons, taskId, taskExtractedNum, taskName, tasks, taskStoragePromise, i, taskUrl, taskItem;
            addButtons = document.querySelectorAll(".icon.add");
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
                    if(tasks[i].url && document.body.contains(document.querySelector("body.todos #item_" + tasks[i].id))) {
                        taskElement = document.querySelector("body.todos #item_" + tasks[i].id);
                        taskElement.style.backgroundImage = "linear-gradient(to right, #72b740, white 1.5%)";
                    }
                }
            }).catch(function(err) {
                console.log(err);
            });
        },
        onRemoveTaskRemoveMark: function() {
            var taskElement, oldTaskStorage, newTaskStorage;
            browser.storage.onChanged.addListener(function(changes, area) {
                oldTaskStorage = changes.taskStorage.oldValue;
                newTaskStorage = changes.taskStorage.newValue;
                if(newTaskStorage.length < oldTaskStorage.length) {
                    oldTaskStorage.forEach(function(task) {
                        if(task.url && document.body.contains(document.querySelector("#item_" + task.id))) {
                            taskElement = document.querySelector("#item_" + task.id);
                            taskElement.style.backgroundImage = "none";
                        }
                    });
                    newTaskStorage.forEach(function(task) {
                        if(task.url && document.body.contains(document.querySelector("#item_" + task.id))) {
                            taskElement = document.querySelector("#item_" + task.id);
                            taskElement.style.backgroundImage = "linear-gradient(to right, #72b740, white 1.5%)";
                        }
                    });
                }
            });
        },
        onMutationAddTimerButtonToTask: function() {
            var target, observer, config, controlDiv, timerButtonHTML;
            config = { childList: true, subtree: true };
            if(document.body.contains(document.querySelector("body.todos .layout .innercol"))) {
                target = document.querySelector("body.todos .layout .innercol");
                observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if(mutation.target.classList.contains("completed_items_todo_list")) {
                            controlDiv = mutation.addedNodes[0].childNodes[1].childNodes[3];
                            timerButtonHTML = "<span class='icon add'></span>";
                            controlDiv.insertAdjacentHTML("beforeend", timerButtonHTML);
                            basecamp_tt.addTaskToTimeTracker();
                            basecamp_tt.addMarkForTrackedTasks();
                        } else if(mutation.target.classList.contains("items") && mutation.addedNodes.length !== 0) {
                            controlDiv = mutation.addedNodes[1].childNodes[1].childNodes[3];
                            timerButtonHTML = "<span class='icon add'></span>";
                            controlDiv.insertAdjacentHTML("beforeend", timerButtonHTML);
                            basecamp_tt.addTaskToTimeTracker();
                            basecamp_tt.addMarkForTrackedTasks();
                        } else if(mutation.target.classList.contains("items") && mutation.addedNodes.length === 0 && mutation.nextSibling) {
                            controlDiv = mutation.nextSibling.childNodes[1].childNodes[3];
                            if(!controlDiv.childNodes[5]) {
                                timerButtonHTML = "<span class='icon add'></span>";
                                controlDiv.insertAdjacentHTML("beforeend", timerButtonHTML);
                                basecamp_tt.addTaskToTimeTracker();
                                basecamp_tt.addMarkForTrackedTasks();
                            }
                        }
                    });    
                });
                observer.observe(target, config);
            }
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