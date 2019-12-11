(function() {
    "use strict";
    var basecamp_tt_popup = {
        init: () => {
            basecamp_tt_popup.addTasksToTable();
            basecamp_tt_popup.taskAddButton();
            basecamp_tt_popup.setVersion();
            basecamp_tt_popup.onClickOptionsButton();
        },
        addTasksToTable: () => {
            var taskTable = document.querySelector("#task-table");
            basecamp_tt_popup.getTaskStorage((taskStorage) => {
                taskStorage.forEach((task) => {
                    taskTable.insertAdjacentHTML("beforeend", basecamp_tt_popup.getTaskHtml(task));
                    basecamp_tt_popup.onClickTaskControl(task);
                    basecamp_tt_popup.onClickFavouriseButtton(task);
                    basecamp_tt_popup.onChangeTaskTimer(task);
                    basecamp_tt_popup.openTaskUrl(task);
                    basecamp_tt_popup.onClickTaskRemove(task);
                });
            });
        },
        onClickTaskControl: (task) => {
            var taskControl = document.querySelector("#task-control-" + task.id + " span:nth-child(2)");
            taskControl.addEventListener("click", () => {
                if(!taskControl.classList.contains("pause")) {
                    basecamp_tt_popup.setTaskTimerState(task, false);
                    taskControl.classList.add("pause");
                    taskControl.classList.remove("play");
                } else {
                    basecamp_tt_popup.setTaskTimerState(task, true);
                    taskControl.classList.add("play");
                    taskControl.classList.remove("pause");
                }
            });
        },
        setTaskTimerState: (task, paused) => {
            basecamp_tt_popup.getTaskStorage((taskStorage) => {
                for(var i in taskStorage) {
                    if(taskStorage[i].id === task.id) {
                        taskStorage[i].paused = paused;
                    }
                }
                basecamp_tt_popup.setTaskStorage(taskStorage);
            });
        },
        onClickFavouriseButtton: (task) => {
            var taskControl = document.querySelector("#task-control-" + task.id + " span:nth-child(1)");
            taskControl.addEventListener("click", () => {
                if(!taskControl.classList.contains("favourised")) {
                    basecamp_tt_popup.favouriseTask(task);
                    basecamp_tt_popup.setTaskTimerFavourised(task, true);
                    taskControl.classList.add("favourised");
                    taskControl.classList.remove("favourise");
                } else {
                    basecamp_tt_popup.unfavouriseTask(task);
                    basecamp_tt_popup.setTaskTimerFavourised(task, false);
                    taskControl.classList.add("favourise");
                    taskControl.classList.remove("favourised");
                }
            });
        },
        setTaskTimerFavourised: (task, favourised) => {
            basecamp_tt_popup.getTaskStorage((taskStorage) => {
                for(var i in taskStorage) {
                    if(taskStorage[i].id === task.id) {
                        taskStorage[i].favourised = favourised;
                    }
                }
                basecamp_tt_popup.setTaskStorage(taskStorage);
            });
        },
        favouriseTask: (task) => {
            basecamp_tt_popup.getFavouriteStorage((favouriteStorage) => {
                favouriteStorage.push(basecamp_tt_popup.getTaskObject(task.id, task.name, task.url, task.company, task.project));
                basecamp_tt_popup.setFavouriteStorage(favouriteStorage);
            });
        },
        unfavouriseTask: (task) => {
            basecamp_tt_popup.getFavouriteStorage((favouriteStorage) => {
                var filteredFavouriteStorage = favouriteStorage.filter((favouriteTask) => favouriteTask.id !== task.id)
                basecamp_tt_popup.setFavouriteStorage(filteredFavouriteStorage);
            });
        },
        onChangeTaskTimer: (task) => {
            chrome.storage.onChanged.addListener((changes, area) => {
                if(changes.taskStorage) {
                    var newTaskStorage = changes.taskStorage.newValue;
                    basecamp_tt_popup.setTaskTimer(task, newTaskStorage);
                }
            });
        },
        setTaskTimer: (task, taskStorage) => {
            var taskTime, taskTimer = document.querySelector("#task-timer-" + task.id);
            for(var i in taskStorage) {
                if(taskStorage[i].id === task.id) {
                    taskTime = taskStorage[i].time;;
                }
            }
            var s = taskTime % 60;
            var m = Math.floor(taskTime / 60) % 60;
            var h = Math.floor(taskTime / 3600);
            if(taskTimer) {
                taskTimer.innerHTML = (h >= 10 ? "" : "0") + h + ":" + (m >= 10 ? "" : "0") + m + ":" + (s >= 10 ? "" : "0") + s;
            }
        },
        getTaskHtml: (task) => {
            var taskCompanyProject = task.company ? `<div class="task-company-project">${task.company ? task.company + " - " + task.project : ""}</div>` : "";
            return `
                <tr id="${task.id}" class="task">
                    <td id="task-control-${task.id}" class="task-control"><span class="icon ${task.favourised ? 'favourised' : 'favourise'}"></span><span class="icon ${task.paused ? 'play' : 'pause'}"></span></td>
                    <td id="task-timer-${task.id}">${basecamp_tt_popup.getTaskTimer(task)}</td>
                    <td id="task-url-${task.id}" class="task-text${task.url ? "" : " no-link"}">
                        ${task.name}
                        ${taskCompanyProject}
                    </td>
                    <td id="task-timer-remove-${task.id}"><span class="icon remove"></span></td>
                </tr>`;
        },
        getTaskTimer: (task) => {
            basecamp_tt_popup.getTaskStorage((taskStorage) => {
                basecamp_tt_popup.setTaskTimer(task, taskStorage);
            });
        },
        openTaskUrl: (task) => {
            var taskText = document.querySelector("#task-url-" + task.id);
            if(task.url) {
                taskText.addEventListener("click", () => {
                    chrome.tabs.create({ url: task.url });
                });
            }
        },
        onClickTaskRemove: (task) => {
            var timerRemoveButton = document.querySelector("#task-timer-remove-" + task.id);
            timerRemoveButton.addEventListener("click", () => {
                var taskToRemove = document.getElementById(task.id);
                taskToRemove.remove();
                basecamp_tt_popup.getTaskStorage((taskStorage) => {
                    var filteredTaskStorage = taskStorage.filter((saveTask) => saveTask.id !== task.id)
                    basecamp_tt_popup.setTaskStorage(filteredTaskStorage);
                })
            });
        },
        taskAddButton: () => {
            var popupTaskTable = document.querySelector("#task-table");
            var addButton = document.querySelector("#add-task-button");
            var inputTaskName = document.querySelector("#input-task-name");
            var messageArray = ["You're joking, right?", "Don't mess with me!", "Don't even try!"];
            addButton.addEventListener("click", () => {
                if(!inputTaskName.value) {
                    inputTaskName.placeholder = messageArray[Math.floor(Math.random() * messageArray.length)];
                    return;
                }
                var taskName = inputTaskName.value;
                var taskId = basecamp_tt_popup.randomTaskId();
                var task = basecamp_tt_popup.getTaskObject(taskId, taskName);
                popupTaskTable.insertAdjacentHTML("beforeend", basecamp_tt_popup.getTaskHtml(task));
                basecamp_tt_popup.onClickTaskControl(task);
                basecamp_tt_popup.onClickFavouriseButtton(task);
                basecamp_tt_popup.onChangeTaskTimer(task);
                basecamp_tt_popup.onClickTaskRemove(task);
                basecamp_tt_popup.getTaskStorage((taskStorage) => {
                    taskStorage.push(task);
                    basecamp_tt_popup.setTaskStorage(taskStorage);
                });
                inputTaskName.value = "";
                inputTaskName.focus();
            });
            inputTaskName.addEventListener("keydown", (event) => {
                if(event.keyCode === 13) {
                    addButton.click();
                }
            });
        },
        randomTaskId: () => {
            var randomId = Math.floor(Math.random() * (999999999 - 100000000 + 1) + 100000000);
            basecamp_tt_popup.getTaskStorage((taskStorage) => {
                for(var i in taskStorage) {
                    if(taskStorage[i].id === randomId) {
                        basecamp_tt_popup.randomTaskId();
                    }
                }
            });
            return randomId;
        },
        getTaskObject: (taskId, taskName, taskUrl = "", taskCompany = "", taskProject = "") => {
            return {
                id: taskId,
                name: taskName,
                time: 0,
                paused: false,
                favourised: false,
                url: taskUrl,
                company: taskCompany,
                project: taskProject
            }
        },
        setVersion: () => {
            var version = document.querySelector("#version-text");
            version.textContent = "Version: " + chrome.runtime.getManifest().version;
        },
        onClickOptionsButton: () => {
            var optionsButton = document.querySelector("#options");
            optionsButton.addEventListener("click", () => {
                chrome.runtime.openOptionsPage();
            });
        },
        getTaskStorage: (callback) => {
            chrome.storage.local.get("taskStorage", (res) => {
                callback(res.taskStorage);
            });
        },
        getFavouriteStorage: (callback) => {
            chrome.storage.local.get("favouriteStorage", (res) => {
                callback(res.favouriteStorage);
            });
        },
        setTaskStorage: (taskArray) => {
            chrome.storage.local.set({ taskStorage: taskArray }, () => {
            });
        },
        setFavouriteStorage: (favouriteArray) => {
            chrome.storage.local.set({ favouriteStorage: favouriteArray }, () => {
            });
        }
    }
    basecamp_tt_popup.init();
})();