
(function() {
    "use strict";
    var basecamp_tt = {
        init: function() {
            basecamp_tt.addTimerButtonToTasks();
            basecamp_tt.addSaveButtonToTasks();
            basecamp_tt.addTimerImagesToButton();
            basecamp_tt.addSaveImagesToButton();
            basecamp_tt.addTaskToTimeTracker();
            basecamp_tt.addTimeToTask();
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
        addSaveButtonToTasks: function() {
            var controlDivs, timerButtonHTML;
            controlDivs = document.querySelectorAll(".list.list_with_time_tracking .controls");
            timerButtonHTML = "<span class='icon save'></span>";
            controlDivs.forEach(function(controlDiv) {
                controlDiv.insertAdjacentHTML("beforeend", timerButtonHTML);
            });
        },
        addTimerImagesToButton: function() {
            var imgURL;
            imgURL = chrome.runtime.getURL("images/add_button.png");
            document.querySelectorAll(".list.list_with_time_tracking .controls .icon.add").forEach(function(addButton) {
                addButton.style.backgroundImage = "url('" + imgURL + "')";
            })
        },
        addSaveImagesToButton: function() {
            var imgURL;
            imgURL = chrome.runtime.getURL("images/save_button.png");
            document.querySelectorAll(".list.list_with_time_tracking .controls .icon.save").forEach(function(saveButton) {
                saveButton.style.backgroundImage = "url('" + imgURL + "')";
            })
        },
        addTaskToTimeTracker: function() {
            var addButtons, taskId, taskExtractedNum, taskName, tasks, i, taskUrl, taskItem;
            addButtons = document.querySelectorAll(".icon.add");
            addButtons.forEach(function(addButton) {
                addButton.onclick = function() {
                    taskId = addButton.parentNode.nextElementSibling.id;
                    taskExtractedNum = taskId.match(/\d+/g).map(Number)[0];
                    taskName = document.querySelector("#item_wrap_" + taskExtractedNum).textContent;
                    taskItem = document.querySelector("body.todos #item_" + taskExtractedNum);
                    taskItem.style.backgroundImage = "linear-gradient(to right, #72b740, white 1.5%)";
                    taskUrl = window.location.href;
                    chrome.storage.local.get("taskStorage", function(res) {
                        tasks = res.taskStorage;
                        for(i in tasks) {
                            if(tasks[i].id === taskExtractedNum) {
                                alert("A task with this id is already added to the time tracker!");
                                return;
                            }
                        }
                        tasks.push(basecamp_tt.createTaskObject(taskExtractedNum, taskName, taskUrl));
                        basecamp_tt.setTaskStorage(tasks);
                    });
                }
            })
        },
        addTimeToTask: function() {
            var boolTaskTracked, m, h, saveButtons, taskId, taskExtractedNum, taskInputTime, taskInputDescription, taskSubmitButton, taskTimeTrackingControl, target, observer, config, boolSaveButtonClicked, tasks, i;
            boolSaveButtonClicked = false;
            boolTaskTracked = false;
            saveButtons = document.querySelectorAll(".icon.save");
            target = document.querySelector("body.todos .layout .innercol");
            config = { childList: true, subtree: true };
            observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if(mutation.target.classList.contains("content") && boolSaveButtonClicked) {
                        taskInputTime = mutation.target.childNodes[0].childNodes[3].childNodes[1][5] || mutation.target.childNodes[0].childNodes[5].childNodes[1][5];
                        taskInputDescription = mutation.target.childNodes[0].childNodes[3].childNodes[1][6] || mutation.target.childNodes[0].childNodes[5].childNodes[1][6];
                        taskSubmitButton = mutation.target.childNodes[0].childNodes[3].childNodes[1][7] || mutation.target.childNodes[0].childNodes[5].childNodes[1][7];
                        chrome.storage.local.get("taskStorage", function(res) {
                            tasks = res.taskStorage;
                            for(i in tasks) {
                                if(tasks[i].id === taskExtractedNum) {
                                    m = Math.floor(tasks[i].time/60) % 60;
                                    h = Math.floor(tasks[i].time/3600);
                                    taskInputTime.value = (h >= 10 ? "" : "0" ) + h + ":" + (m >= 10 ? "" : "0" ) + m;
                                    taskInputDescription.value = tasks[i].description;
                                    taskSubmitButton.click();
                                    tasks.splice(i, 1);
                                }
                            }
                            basecamp_tt.setTaskStorage(tasks);
                        });
                        observer.disconnect();
                    }
                });
            });
            observer.observe(target, config);
            saveButtons.forEach(function(saveButton) {
                saveButton.onclick = function() {
                    taskId = saveButton.parentNode.nextElementSibling.id;
                    taskExtractedNum = taskId.match(/\d+/g).map(Number)[0];
                    taskTimeTrackingControl = document.querySelector("body.todos #item_" + taskExtractedNum + "_time_tracking_control");
                    boolSaveButtonClicked = true;
                    chrome.storage.local.get("taskStorage", function(res) {
                        tasks = res.taskStorage;
                        for(i in tasks) {
                            if(tasks[i].id === taskExtractedNum) {
                                boolTaskTracked = true;
                            }
                        }
                        if(boolTaskTracked) {
                            taskTimeTrackingControl.click();
                        } else {
                            alert("No time tracked for this task!");
                        }
                    });                  
                };
            });
        },
        addMarkForTrackedTasks: function() {
            var tasks, taskElement, i;
            chrome.storage.local.get("taskStorage", function(res) {
                tasks = res.taskStorage;
                for(i in tasks) {
                    if(tasks[i].url && document.body.contains(document.querySelector("body.todos #item_" + tasks[i].id))) {
                        taskElement = document.querySelector("body.todos #item_" + tasks[i].id);
                        taskElement.style.backgroundImage = "linear-gradient(to right, #72b740, white 1.5%)";
                    }
                }
            });
        },
        onRemoveTaskRemoveMark: function() {
            var taskElement, oldTaskStorage, newTaskStorage;
            chrome.storage.onChanged.addListener(function(changes, area) {
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
            var target, observer, config, controlDiv, timerButtonHTML, saveButtonHTML;
            config = { childList: true, subtree: true };
            if(document.body.contains(document.querySelector("body.todos .layout .innercol"))) {
                target = document.querySelector("body.todos .layout .innercol");
                observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if(mutation.target.classList.contains("completed_items_todo_list") && mutation.addedNodes.length !== 0 && mutation.addedNodes[0].nodeType === 1) {
                            if(mutation.addedNodes[0].childNodes[1]) {
                                controlDiv = mutation.addedNodes[0].childNodes[1].childNodes[3];
                                timerButtonHTML = "<span class='icon add'></span>";
                                saveButtonHTML = "<span class='icon save'></span>";
                                controlDiv.insertAdjacentHTML("beforeend", timerButtonHTML);
                                controlDiv.insertAdjacentHTML("beforeend", saveButtonHTML);
                                basecamp_tt.addTimerImagesToButton();
                                basecamp_tt.addSaveImagesToButton();
                                basecamp_tt.addTaskToTimeTracker();
                                basecamp_tt.addTimeToTask();
                                basecamp_tt.addMarkForTrackedTasks();
                            }
                        } else if(mutation.target.classList.contains("items") && mutation.addedNodes.length !== 0 && mutation.addedNodes[1]) {
                            controlDiv = mutation.addedNodes[1].childNodes[1].childNodes[3];
                            timerButtonHTML = "<span class='icon add'></span>";
                            saveButtonHTML = "<span class='icon save'></span>";
                            controlDiv.insertAdjacentHTML("beforeend", timerButtonHTML);
                            controlDiv.insertAdjacentHTML("beforeend", saveButtonHTML);
                            basecamp_tt.addTimerImagesToButton();
                            basecamp_tt.addSaveImagesToButton();
                            basecamp_tt.addTaskToTimeTracker();
                            basecamp_tt.addTimeToTask();
                            basecamp_tt.addMarkForTrackedTasks();
                        } else if(mutation.target.classList.contains("items") && mutation.addedNodes.length === 0 && mutation.nextSibling && mutation.previousSibling) {
                            controlDiv = mutation.nextSibling.childNodes[1].childNodes[3];
                            if(!controlDiv.childNodes[5]) {
                                timerButtonHTML = "<span class='icon add'></span>";
                                saveButtonHTML = "<span class='icon save'></span>";
                                controlDiv.insertAdjacentHTML("beforeend", timerButtonHTML);
                                controlDiv.insertAdjacentHTML("beforeend", saveButtonHTML);
                                basecamp_tt.addTimerImagesToButton();
                                basecamp_tt.addSaveImagesToButton();
                                basecamp_tt.addTaskToTimeTracker();
                                basecamp_tt.addTimeToTask();
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
                url: taskUrl,
                description: ""
            }
            return task;
        },
        setTaskStorage: function(taskArray) {
            chrome.storage.local.set({taskStorage: taskArray}, function() {
            });
        }
    }
    basecamp_tt.init();
})();