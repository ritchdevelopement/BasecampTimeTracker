(function() {
    "use strict";
    var basecamp_tt_popup = {
        init: () => {
            basecamp_tt_popup.addFavouritesToTable();
            basecamp_tt_popup.setVersion();
            basecamp_tt_popup.onClickOptionsButton();
        },
        addFavouritesToTable: () => {
            if(document.querySelector("#task-table")) {
                var taskTable = document.querySelector("#task-table");
                basecamp_tt_popup.getFavouriteStorage().then((favouriteStorage) => {
                    favouriteStorage.forEach((task) => {
                        taskTable.insertAdjacentHTML("beforeend", basecamp_tt_popup.getTaskHtml(task));
                        basecamp_tt_popup.onClickAddTimerButton(task);
                        basecamp_tt_popup.openTaskUrl(task);
                        basecamp_tt_popup.onClickFavouriteRemove(task);
                    });
                }).catch((error) => {
                    console.log(error);
                });
            }
        },
        getTaskHtml: (task) => {
            var taskCompanyProject = task.company ? `<div class="task-company-project">${task.company ? task.company + " - " + task.project : ""}</div>` : "";
            return `
                <tr id="${task.id}" class="task">
                <td id="task-control-${task.id}" class="task-control"><span class="icon add"></span></td>
                    <td id="task-url-${task.id}" class="task-text${task.url ? "" : " no-link"}">
                        ${task.name}
                        ${taskCompanyProject}
                    </td>
                    <td id="favourite-remove-${task.id}"><span class="icon remove"></span></td>
                </tr>`;
        },
        onClickAddTimerButton: (task) => {
            var taskControl = document.querySelector("#task-control-" + task.id + " span:nth-child(1)");
            taskControl.addEventListener("click", () => {
                basecamp_tt_popup.getTaskStorage().then((taskStorage) => {
                    for(var i in taskStorage) {
                        if(taskStorage[i].id === task.id) {
                            return;
                        }
                    }
                    taskStorage.push(basecamp_tt_popup.getTaskObject(task.id, task.name, task.url, task.company, task.project));
                    basecamp_tt_popup.setTaskStorage(taskStorage);
                });
            });
        },
        openTaskUrl: (task) => {
            var taskText = document.querySelector("#task-url-" + task.id);
            if(task.url) {
                taskText.addEventListener("click", () => {
                    browser.tabs.create({ url: task.url });
                });
            }
        },
        onClickFavouriteRemove: (task) => {
            var favouriteRemoveButton = document.querySelector("#favourite-remove-" + task.id + " .icon.remove");
            favouriteRemoveButton.addEventListener("click", () => {
                var favouriteRemove = document.getElementById(task.id);
                favouriteRemove.remove();
                basecamp_tt_popup.getFavouriteStorage().then((favouriteStorage) => {
                    var filteredFavouriteStorage = favouriteStorage.filter((favouriteTask) => favouriteTask.id !== task.id)
                    basecamp_tt_popup.setFavouriteStorage(filteredFavouriteStorage);
                })
                basecamp_tt_popup.setTaskTimerUnfavourised(task);
            });
        },
        setTaskTimerUnfavourised: (task) => {
            basecamp_tt_popup.getTaskStorage().then((taskStorage) => {
                for(var i in taskStorage) {
                    if(taskStorage[i].id === task.id) {
                        taskStorage[i].favourised = false;
                    }
                }
                basecamp_tt_popup.setTaskStorage(taskStorage);
            }).catch((error) => {
                console.log(error);
            });
        },
        getTaskObject: (taskId, taskName, taskUrl = "", taskCompany = "", taskProject = "") => {
            return {
                id: taskId,
                name: taskName,
                time: 0,
                paused: false,
                favourised: true,
                url: taskUrl,
                company: taskCompany,
                project: taskProject
            }
        },
        setVersion: () => {
            var version = document.querySelector("#version-text");
            version.textContent = "Version: " + browser.runtime.getManifest().version;
        },
        onClickOptionsButton: () => {
            var optionsButton = document.querySelector("#options");
            optionsButton.addEventListener("click", () => {
                browser.runtime.openOptionsPage();
            });
        },
        getTaskStorage: () => {
            return browser.storage.local.get("taskStorage").then((res) => {
                return res.taskStorage;
            });
        },
        getFavouriteStorage: () => {
            return browser.storage.local.get("favouriteStorage").then((res) => {
                return res.favouriteStorage;
            });
        },
        setTaskStorage: (taskArray) => {
            browser.storage.local.set({
                taskStorage: taskArray
            });
        },
        setFavouriteStorage: (favouriteArray) => {
            browser.storage.local.set({
                favouriteStorage: favouriteArray
            });
        }
    }
    basecamp_tt_popup.init();
})();