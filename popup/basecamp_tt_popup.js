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
                basecamp_tt_popup.taskTimerStart(task);
                basecamp_tt_popup.taskTimerControl(task);
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
            var taskTime, s, m, h;
            taskTime = basecamp_tt_popup.getTaskTime(task);
            s = Math.floor(taskTime/1000) % 60;
            m = Math.floor(taskTime/(1000*60)) % 60;
            h = Math.floor(taskTime/(1000*60*60));
            return (h >= 10 ? "" : "0" ) + h + ":" + (m >= 10 ? "" : "0" ) + m + ":" + (s >= 10 ? "" : "0") + s;
        },
        taskTimerStart: function(task) {
            var taskControlImg, taskTimerId;
            taskControlImg = document.querySelector("#task-control-" + task.id + " span");
            taskTimerId = document.querySelector("#task-timer-" + task.id);
            
            return setInterval(function() {
                if(!taskControlImg.classList.contains("pause")) {
                    if(document.body.contains(taskTimerId)) {
                        taskTimerId.innerHTML = basecamp_tt_popup.showTaskTimer(task);
                    }
                }
            }, 1000);
        },
        getTaskTime: function(task) {
            if(task.paused) {
                return task.totalTime;
            } else if(!task.paused) {
                return Date.now() - task.startTime;
            }
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
            var taskStoragePromise, tasks, i, taskTime;
            taskTime = Date.now() - task.startTime;
            taskStoragePromise = basecamp_tt_popup.getTaskStorage();
            taskStoragePromise.then(function(res) {
                tasks = res.taskStorage;
                for(i in tasks) {
                    if(tasks[i].id == task.id) {
                        tasks[i].paused = boolPaused;
                        tasks[i].totalTime = taskTime;
                    }
                    basecamp_tt_popup.setTaskStorage(tasks);
                }
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