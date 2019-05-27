(function() {
    "use strict";
    var basecamp_tt_popup = {
        init: function() {
            basecamp_tt_popup.showTasksInPopup();
            basecamp_tt_popup.taskAddButton();
            basecamp_tt_popup.showVersion();
        },
        showTasksInPopup: function() {
            var tasks;
            chrome.storage.local.get("taskStorage", function(res) {
                tasks = res.taskStorage;
                basecamp_tt_popup.showTask(tasks);
            });
        },
        showTask: function(tasks) {
            var taskHTML, popupTaskTable;
            popupTaskTable = document.querySelector("#popup-task-table tbody");
            tasks.forEach(function(task) {
                taskHTML = `<tr id="${task.id}" class="task">
                    <td id="task-control-${task.id}"><span class="icon ${task.paused?'play':'pause'}"></span></td>
                    <td id="task-timer-${task.id}">${basecamp_tt_popup.showTaskTimer(task)}</td>
                    <td id="task-url-${task.id}" ${task.url?"class='task-text'":""}>${task.name}</td>
                    <td id="task-timer-remove-${task.id}"><span class="icon remove"></span></td>
                </tr>`;
                popupTaskTable.insertAdjacentHTML("beforeend", taskHTML);
                basecamp_tt_popup.taskRemoveButton(task)
                basecamp_tt_popup.taskTimerControl(task);
                basecamp_tt_popup.taskTimerStart(task);
                basecamp_tt_popup.taskTimerOpenUrl(task);
            });
        },
        showTaskTimer: function(task) {
            var s, m, h, taskTime, tasks, i, taskTimerId;
            chrome.storage.local.get("taskStorage", function(res) {
                tasks = res.taskStorage;
                taskTimerId = document.querySelector("#task-timer-" + task.id);
                for(i in tasks) {
                    if(tasks[i].id === task.id) {
                        taskTime = tasks[i].time;;
                    }
                }
                s = taskTime%60;
                m = Math.floor(taskTime/60) % 60;
                h = Math.floor(taskTime/3600);
                taskTimerId.innerHTML = (h >= 10 ? "" : "0" ) + h + ":" + (m >= 10 ? "" : "0" ) + m + ":" + (s >= 10 ? "" : "0") + s;
            });
        },
        showVersion: function() {
            var version;
            version = document.querySelector("#version-text");
            version.textContent = "Version: " + chrome.runtime.getManifest().version;
        },
        taskRemoveButton: function(task) {
            var timerRemoveButton, i, tasks, taskToRemove, i;
            timerRemoveButton = document.querySelector("#task-timer-remove-" + task.id);
            timerRemoveButton.addEventListener("click", function() {
                taskToRemove = document.getElementById(task.id);
                taskToRemove.remove();
                chrome.storage.local.get("taskStorage", function(res) {
                    tasks = res.taskStorage;
                    for(i in tasks) {
                        if(tasks[i].id === task.id) {
                            tasks.splice(i, 1);
                        }
                    }
                    basecamp_tt_popup.setTaskStorage(tasks);
                })
            });
        },
        taskTimerStart: function(task) {
            var taskTimerId, s, m, h, taskTime, tasks, i;
            return setInterval(function() {
                chrome.storage.local.get("taskStorage", function(res) {
                    tasks = res.taskStorage;
                    taskTimerId = document.querySelector("#task-timer-" + task.id);
                    for(i in tasks) {
                        if(tasks[i].id === task.id) {
                            taskTime = tasks[i].time;;
                        }
                    }
                    s = taskTime%60;
                    m = Math.floor(taskTime/60) % 60;
                    h = Math.floor(taskTime/3600);
                    if(document.body.contains(taskTimerId)) {
                        taskTimerId.innerHTML = (h >= 10 ? "" : "0" ) + h + ":" + (m >= 10 ? "" : "0" ) + m + ":" + (s >= 10 ? "" : "0") + s;
                    }
                });
            }, 1000);
        },
        taskTimerControl: function(task) {
            var taskControl, taskControlImg;
            taskControl = document.querySelector("#task-control-" + task.id);
            taskControlImg = document.querySelector("#task-control-" + task.id + " span")
            taskControl.addEventListener("click", function() {
                if(!taskControlImg.classList.contains("pause")) {
                    basecamp_tt_popup.taskTimerSaveState(task, false);
                    taskControlImg.classList.add("pause");
                    taskControlImg.classList.remove("play");
                } else {
                    basecamp_tt_popup.taskTimerSaveState(task, true);
                    taskControlImg.classList.add("play");
                    taskControlImg.classList.remove("pause");
                }
            });
        },
        taskTimerOpenUrl: function(task) {
            var taskText;
            taskText = document.querySelector("#task-url-" + task.id);
            if(task.url) {
                taskText.addEventListener("click", function() {
                    chrome.tabs.create({url: task.url});
                });
            }
        },
        taskTimerSaveState: function (task, boolPaused) {
            var tasks, i;
            chrome.storage.local.get("taskStorage", function(res) {
                tasks = res.taskStorage;
                for(i in tasks) {
                    if(tasks[i].id === task.id) {
                        tasks[i].paused = boolPaused;
                    }
                }
                basecamp_tt_popup.setTaskStorage(tasks);
            });
        },
        taskAddButton: function() {
            var messageArray, addButton, inputTaskName, taskId, taskName, popupTaskTable, taskHTML, task, tasks;
            popupTaskTable = document.querySelector("#popup-task-table tbody");
            addButton = document.querySelector("#add-task-button");
            inputTaskName = document.querySelector("#input-task-name");
            messageArray = ["You're joking, right?", "Don't mess with me!", "Don't even try!"];
            addButton.addEventListener("click", function() {
                if(!inputTaskName.value) {
                    inputTaskName.placeholder = messageArray[Math.floor(Math.random() * messageArray.length)];
                    return;
                }
                taskName = inputTaskName.value;
                taskId = basecamp_tt_popup.randomTaskId();
                task = basecamp_tt_popup.createTaskObject(taskId, taskName);
                taskHTML = `<tr id="${task.id}" class="task">
                    <td id="task-control-${task.id}"><span class="icon ${task.paused?'play':'pause'}"></span></td>
                    <td id="task-timer-${task.id}">00:00:00</td>
                    <td>${task.name}</td>
                    <td id="task-timer-remove-${task.id}"><span class="icon remove"></span></td>
                </tr>`;
                popupTaskTable.insertAdjacentHTML("beforeend", taskHTML);
                basecamp_tt_popup.taskTimerControl(task);
                basecamp_tt_popup.taskTimerStart(task);
                basecamp_tt_popup.taskRemoveButton(task);
                chrome.storage.local.get("taskStorage", function(res) {
                    tasks = res.taskStorage;
                    tasks.push(task);
                    basecamp_tt_popup.setTaskStorage(tasks);
                });
                inputTaskName.value = "";
                inputTaskName.focus();
            });
            inputTaskName.addEventListener("keydown", function(event) {
                if (event.keyCode === 13) {
                    addButton.click();
                }
            }); 
        },
        randomTaskId: function() {
            var randomId, tasks, i;
            randomId = Math.floor(Math.random() * (999999999 - 100000000 + 1) + 100000000);
            chrome.storage.local.get("taskStorage", function(res) {
                tasks = res.taskStorage;
                for(i in tasks) {
                    if(tasks[i].id === randomId) {
                        basecamp_tt_popup.randomTaskId();
                    }
                }
            });
            return randomId;
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
        setTaskStorage: function(taskArray) {
            chrome.storage.local.set({taskStorage: taskArray}, function() {
            });
        }
    }
    basecamp_tt_popup.init();
})();