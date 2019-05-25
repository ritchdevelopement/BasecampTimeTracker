(function() {
    "use strict";
    var basecamp_tt_popup = {
        init: function() {
            basecamp_tt_popup.showTasksInPopup();
        },
        showTasksInPopup: function() {
            var taskStoragePromise, tasks;
            taskStoragePromise = basecamp_tt_popup.getTaskStorage();
            taskStoragePromise.then(function(res) {
                tasks = res.taskStorage;
                basecamp_tt_popup.showTask(tasks);
                basecamp_tt_popup.showTaskRemoveButton(tasks)
            }).catch(function(err) {
                console.log(err);
            });
        },
        showTask: function(tasks) {
            var taskHTML, popupTaskTable;
            popupTaskTable = document.querySelector("#popup-task-table tbody");
            tasks.forEach(function(task) {
                taskHTML = `<tr id="${task.id}" class="task">
                    <td id="task-control-${task.id}"><span class="timer${task.paused?' pause':''}"></span></td>
                    <td id="task-timer-${task.id}">${basecamp_tt_popup.showTaskTimer(task)}</td>
                    <td>${task.name}</td>
                    <td><span class="timer remove"></span></td>
                </tr>`;
                popupTaskTable.insertAdjacentHTML("beforeend", taskHTML);
                basecamp_tt_popup.taskTimerControl(task);
                basecamp_tt_popup.taskTimerStart(task);
            });
        },
        showTaskRemoveButton: function(tasks) {
            var timerRemoveButtons, taskId, i;
            timerRemoveButtons = document.querySelectorAll(".timer.remove");
            timerRemoveButtons.forEach(function(removeButton) {
                removeButton.addEventListener("click", function() {
                    removeButton.parentElement.parentElement.remove();
                    taskId = removeButton.parentElement.parentElement.id;
                    for(i in tasks) {
                        if(tasks[i].id == taskId) {
                            tasks.splice(i, 1);
                        }
                    }
                    basecamp_tt_popup.setTaskStorage(tasks);
                });
            });
        },
        showTaskTimer: function(task) {
            var s, m, h, taskTime, taskStoragePromise, tasks, i, taskTimerId;
            taskStoragePromise = basecamp_tt_popup.getTaskStorage();
                taskStoragePromise.then(function(res) {
                    tasks = res.taskStorage;
                    taskTimerId = document.querySelector("#task-timer-" + task.id);
                    for(i in tasks) {
                        if(tasks[i].id == task.id) {
                            taskTime = tasks[i].time;;
                        }
                    }
                    s = taskTime%60;
                    m = Math.floor(taskTime/60) % 60;
                    h = Math.floor(taskTime/3600);
                    taskTimerId.innerHTML = (h >= 10 ? "" : "0" ) + h + ":" + (m >= 10 ? "" : "0" ) + m + ":" + (s >= 10 ? "" : "0") + s;
                }).catch(function(err) {
                    console.log(err);
            });
        },
        taskTimerStart: function(task) {
            var taskTimerId, s, m, h, taskTime, taskStoragePromise, tasks, i;
            return setInterval(function() {
                taskStoragePromise = basecamp_tt_popup.getTaskStorage();
                taskStoragePromise.then(function(res) {
                    tasks = res.taskStorage;
                    taskTimerId = document.querySelector("#task-timer-" + task.id);
                    for(i in tasks) {
                        if(tasks[i].id == task.id) {
                            taskTime = tasks[i].time;;
                        }
                    }
                    s = taskTime%60;
                    m = Math.floor(taskTime/60) % 60;
                    h = Math.floor(taskTime/3600);
                    if(document.body.contains(taskTimerId)) {
                        taskTimerId.innerHTML = (h >= 10 ? "" : "0" ) + h + ":" + (m >= 10 ? "" : "0" ) + m + ":" + (s >= 10 ? "" : "0") + s;
                    }
                }).catch(function(err) {
                    console.log(err);
                });
            }, 1000);
        },
        taskTimerControl: function(task) {
            var taskControl, taskControlImg;
            var taskControl = document.querySelector("#task-control-" + task.id);
            var taskControlImg = document.querySelector("#task-control-" + task.id + " span")
            taskControl.addEventListener("click", function() {
                if(!taskControlImg.classList.contains("pause")) {
                    basecamp_tt_popup.taskTimerSaveState(task, true);
                    taskControlImg.classList.add("pause");
                } else {
                    basecamp_tt_popup.taskTimerSaveState(task, false);
                    taskControlImg.classList.remove("pause");
                }
            });
        },
        taskTimerSaveState: function (task, boolPaused) {
            var taskStoragePromise, tasks, i;
            taskStoragePromise = basecamp_tt_popup.getTaskStorage();
            taskStoragePromise.then(function(res) {
                tasks = res.taskStorage;
                for(i in tasks) {
                    if(tasks[i].id == task.id) {
                        tasks[i].paused = boolPaused;
                    }
                }
                basecamp_tt_popup.setTaskStorage(tasks);
            }).catch(function(err) {
                console.log(err);
            });
        },
        getTaskStorage: function() {
            return browser.storage.local.get("taskStorage");
        },
        setTaskStorage: function(taskArray) {
            browser.storage.local.set({
                taskStorage: taskArray
            });
        }
    }
    basecamp_tt_popup.init();
})();