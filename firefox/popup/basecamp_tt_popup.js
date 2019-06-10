(function() {
    "use strict";
    var basecamp_tt_popup = {
        init: function() {
            basecamp_tt_popup.showTasksInPopup();
            basecamp_tt_popup.taskAddButton();
            basecamp_tt_popup.showVersion();
        },
        showTasksInPopup: function() {
            var taskStoragePromise, tasks;
            taskStoragePromise = basecamp_tt_popup.getTaskStorage();
            taskStoragePromise.then(function(res) {
                tasks = res.taskStorage;    
                basecamp_tt_popup.showTask(tasks);
            }).catch(function(err) {
                console.log(err);
            });
        },
        showTask: function(tasks) {
            var taskHTML, taskEditHTML, popupTaskTable;
            popupTaskTable = document.querySelector("#popup-task-table tbody");
            tasks.forEach(function(task) {
                taskEditHTML = `<tr id="task-timer-edit-row-${task.id}" class="hide">
                    <td colspan="3"><input id="task-timer-edit-input-${task.id}" value="${task.description?task.description:""}" placeholder="Description"/></td>
                    <td><span id="task-timer-edit-save-${task.id}" class="icon save"></span></td>
                    <td><span id="task-timer-edit-check-${task.id}" class="icon check hide"></span></td>
                </tr>`;
                taskHTML = `<tr id="${task.id}" class="task">
                    <td id="task-control-${task.id}"><span class="icon ${task.paused?'play':'pause'}"></span></td>
                    <td id="task-timer-${task.id}">${basecamp_tt_popup.showTaskTimer(task)}</td>
                    <td id="task-url-${task.id}" class="task-text${task.url?"":" no-link"}">${task.name}</a></td>
                    <td id="task-timer-edit-${task.id}">${task.url?"<span class='icon edit'>":""}</span></td>
                    <td id="task-timer-remove-${task.id}"><span class="icon remove"></span></td>
                </tr>${task.url?taskEditHTML:""}`;
                popupTaskTable.insertAdjacentHTML("beforeend", taskHTML);
                basecamp_tt_popup.taskRemoveButton(task)
                basecamp_tt_popup.taskTimerControl(task);
                basecamp_tt_popup.taskTimerStart(task);
                basecamp_tt_popup.taskTimerOpenUrl(task);
                basecamp_tt_popup.taskTimerShowEdit(task);
                basecamp_tt_popup.taskTimerSaveEdit(task);
            });
        },
        showTaskTimer: function(task) {
            var s, m, h, taskTime, taskStoragePromise, tasks, i, taskTimerId;
            taskStoragePromise = basecamp_tt_popup.getTaskStorage();
                taskStoragePromise.then(function(res) {
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
                }).catch(function(err) {
                    console.log(err);
            });
        },
        showVersion: function() {
            var version;
            version = document.querySelector("#version-text");
            version.textContent = "Version: " + browser.runtime.getManifest().version;
        },
        taskRemoveButton: function(task) {
            var timerRemoveButton, i, taskStoragePromise, tasks, taskToRemove, taskEditToRemove;
            timerRemoveButton = document.querySelector("#task-timer-remove-" + task.id);
            timerRemoveButton.addEventListener("click", function() {
                if(document.body.contains(document.querySelector("#task-timer-edit-row-" + task.id))) {
                    taskEditToRemove = document.querySelector("#task-timer-edit-row-" + task.id);
                    taskEditToRemove.remove();
                }
                taskToRemove = document.getElementById(task.id);
                taskToRemove.remove();
                taskStoragePromise = basecamp_tt_popup.getTaskStorage();
                taskStoragePromise.then(function(res) {
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
            browser.storage.onChanged.addListener(function(changes, area) {
                tasks = changes.taskStorage.newValue;
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
                    browser.tabs.create({url: task.url});
                });
            }
        },
        taskTimerShowEdit: function(task) {
            var taskEditPen, taskEdit;
            taskEditPen = document.querySelector("#task-timer-edit-" + task.id);
            taskEdit = document.querySelector("#task-timer-edit-row-" + task.id);
            taskEditPen.addEventListener("click", function() {
                taskEdit.classList.toggle("hide");
            });
        },
        taskTimerSaveEdit: function(task) {
            var taskEditInput, taskEditSave, taskEditCheck, taskStoragePromise, tasks, i;
            if(document.body.contains(document.querySelector("#task-timer-edit-input-" + task.id))) {
                taskEditSave = document.querySelector("#task-timer-edit-save-" + task.id);
                taskEditInput = document.querySelector("#task-timer-edit-input-" + task.id);
                taskEditCheck = document.querySelector("#task-timer-edit-check-" + task.id);
                taskEditSave.addEventListener("click", function() {
                    taskEditCheck.classList.remove("hide");
                    taskStoragePromise = basecamp_tt_popup.getTaskStorage();
                    taskStoragePromise.then(function(res) {
                        tasks = res.taskStorage;
                        for(i in tasks) {
                            if(tasks[i].id === task.id) {
                                tasks[i].description = taskEditInput.value;
                            }
                        }
                        basecamp_tt_popup.setTaskStorage(tasks);
                    }).catch(function(err) {
                        console.log(err);
                    });
                });
                taskEditInput.addEventListener("keydown", function(event) {
                    if (event.keyCode === 13) {
                        taskEditSave.click();
                    }
                }); 
            }
        },
        taskTimerSaveState: function (task, boolPaused) {
            var taskStoragePromise, tasks, i;
            taskStoragePromise = basecamp_tt_popup.getTaskStorage();
            taskStoragePromise.then(function(res) {
                tasks = res.taskStorage;
                for(i in tasks) {
                    if(tasks[i].id === task.id) {
                        tasks[i].paused = boolPaused;
                    }
                }
                basecamp_tt_popup.setTaskStorage(tasks);
            }).catch(function(err) {
                console.log(err);
            });
        },
        taskAddButton: function() {
            var messageArray, addButton, inputTaskName, taskId, taskName, popupTaskTable, taskHTML, task, taskStoragePromise, tasks;
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
                    <td></td>
                    <td id="task-timer-remove-${task.id}"><span class="icon remove"></span></td>
                </tr>`
                popupTaskTable.insertAdjacentHTML("beforeend", taskHTML);
                basecamp_tt_popup.taskTimerControl(task);
                basecamp_tt_popup.taskTimerStart(task);
                basecamp_tt_popup.taskRemoveButton(task);
                taskStoragePromise = basecamp_tt_popup.getTaskStorage();
                taskStoragePromise.then(function(res) {
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
            var randomId, taskStoragePromise, tasks, i;
            randomId = Math.floor(Math.random() * (999999999 - 100000000 + 1) + 100000000);
            taskStoragePromise = basecamp_tt_popup.getTaskStorage();
            taskStoragePromise.then(function(res) {
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