
(function() {
    "use strict";
    var basecamp_tt = {
        init: function() {
            basecamp_tt.initAjaxLoaders();
            basecamp_tt.addTimerButtons();
            basecamp_tt.addImagesToButtons();
            basecamp_tt.onClickTimerButtons();
            basecamp_tt.addMarkForTrackedTasks();
            basecamp_tt.onRemoveTaskTimerRemoveMark();
            basecamp_tt.observeMutations();
            basecamp_tt.getTimeEntries("itemIds", 2);
            basecamp_tt.getTimeEntries("listTimeItemIds", 1);
            basecamp_tt.initMarketingBox();
        },
        initAjaxLoaders: () => {
            basecamp_tt.addAjaxLoaderToTasks();
            basecamp_tt.addAjaxLoaderToListTitle();
        },
        addAjaxLoaderToTasks: () => {
            basecamp_tt.getOptionStorage((optionStorage) => {
                if(optionStorage.enableTimeInfoLabels) {
                    if(document.querySelectorAll(".sprite.timeclock.on") && document.querySelectorAll(".list_title").length <= 1) {
                        var timeClocksOn = document.querySelectorAll(".sprite.timeclock.on");
                        var excludedProjects = optionStorage.excludedProjects.split(",");
                        var projectId = basecamp_tt.extractNumber(window.location.href);
                        if(!excludedProjects.includes(projectId)) {
                            timeClocksOn.forEach((timeClock) => {
                                timeClock.parentNode.parentNode.nextElementSibling.insertAdjacentHTML("beforeend", basecamp_tt.getAjaxLoaderHtml());
                            });
                        }
                    }
                }
            });
        },
        addAjaxLoaderToListTitle: () => {
            basecamp_tt.getOptionStorage((optionStorage) => {
                if(optionStorage.enableTimeInfoLabels) {
                    if(document.querySelectorAll(".list_title").length <= 1) {
                        var excludedProjects = optionStorage.excludedProjects.split(",");
                        var projectId = basecamp_tt.extractNumber(window.location.href);
                        if(!excludedProjects.includes(projectId) && document.querySelector(".list_title")) {
                            var listTitle = document.querySelector(".list_title");
                            var listTitleId = basecamp_tt.extractNumber(listTitle.id);
                            var uncompletedTasks = document.querySelector("#list_" + listTitleId + "_title + .items_wrapper .sprite.timeclock.on");
                            var completedTasks = document.querySelector("#list_" + listTitleId + "_title ~ .completed_items_todo_list.done .sprite.timeclock.on");
                            if(uncompletedTasks || completedTasks) {
                                listTitle.insertAdjacentHTML("beforeend", basecamp_tt.getAjaxLoaderHtml(true));
                            }
                        }
                    }
                }
            });
        },
        addAjaxLoaderToTask: (task) => {
            basecamp_tt.getOptionStorage((optionStorage) => {
                if(optionStorage.enableTimeInfoLabels) {
                    if(document.querySelectorAll(".list_title").length <= 1) {
                        var excludedProjects = optionStorage.excludedProjects.split(",");
                        var projectId = basecamp_tt.extractNumber(window.location.href);
                        if(!excludedProjects.includes(projectId)) {
                            if(task.querySelector(".sprite.timeclock.on")) {
                                var taskId = basecamp_tt.extractNumber(task.id);
                                var taskContent = document.querySelector("#item_" + taskId + "_content");
                                taskContent.insertAdjacentHTML("beforeend", basecamp_tt.getAjaxLoaderHtml());
                            }
                        }
                    }
                }
            });
        },
        getAjaxLoaderHtml: (title = false) => {
            return `<div class='ajax-loader${title ? " title-loader" : ""}'><div></div><div></div><div></div><div></div></div>`;
        },
        addTimerButtons: () => {
            var controlDivs = document.querySelectorAll(".list.list_with_time_tracking .controls");
            controlDivs.forEach((controlDiv) => {
                controlDiv.insertAdjacentHTML("beforeend", basecamp_tt.getButtonHtml("add"));
                controlDiv.insertAdjacentHTML("beforeend", basecamp_tt.getButtonHtml("save"));
            });
        },
        addImagesToButtons: function() {
            var addImgUrl = chrome.runtime.getURL("images/add_button.png");
            var saveImgUrl = chrome.runtime.getURL("images/save_button.png");
            document.querySelectorAll(".list.list_with_time_tracking .controls .icon.add").forEach(function(addButton) {
                addButton.style.backgroundImage = "url('" + addImgUrl + "')";
            })
            document.querySelectorAll(".list.list_with_time_tracking .controls .icon.save").forEach(function(saveButton) {
                saveButton.style.backgroundImage = "url('" + saveImgUrl + "')";
            })
        },
        onClickTimerButtons: () => {
            basecamp_tt.onClickAddButtons();
            basecamp_tt.onClickSaveButtons();
        },
        onClickAddButtons: () => {
            var addButtons = document.querySelectorAll(".icon.add");
            addButtons.forEach((addButton) => {
                addButton.onclick = () => {
                    var taskId = addButton.parentNode.nextElementSibling.id;
                    var taskExtractedNum = basecamp_tt.extractNumber(taskId);
                    var taskName = document.querySelector("#item_wrap_" + taskExtractedNum).textContent;
                    var taskItem = document.querySelector("body.todos #item_" + taskExtractedNum);
                    taskItem.style.backgroundImage = "linear-gradient(to right, #72b740, white 1.5%)";
                    var taskCompany = document.querySelector("#Header h1 span").textContent;
                    var taskProject = document.querySelector("#Header h1").childNodes[0].textContent;
                    var taskUrl = window.location.href;
                    basecamp_tt.getTaskStorage((taskStorage) => {
                        for(var i in taskStorage) {
                            if(taskStorage[i].id === taskExtractedNum) {
                                alert("A task with this id is already added to the time tracker!");
                                return;
                            }
                        }
                        taskStorage.push(basecamp_tt.getTaskObject(taskExtractedNum, taskName, taskUrl, taskCompany, taskProject));
                        basecamp_tt.setTaskStorage(taskStorage);
                    });
                };
            });
        },
        onClickSaveButtons: () => {
            if(document.querySelector("body.todos .layout .innercol")) {
                var taskExtractedNum, taskTimeTrackingControl, boolSaveButtonClicked = false;
                var target = document.querySelector("body.todos .layout .innercol");
                var config = { childList: true, subtree: true };
                var observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if(mutation.target.classList.contains("content") && boolSaveButtonClicked) {
                            var taskInputTime = mutation.target.childNodes[0].childNodes[3].childNodes[1][5] || mutation.target.childNodes[0].childNodes[5].childNodes[1][5];
                            var taskSubmitButton = mutation.target.childNodes[0].childNodes[3].childNodes[1][7] || mutation.target.childNodes[0].childNodes[5].childNodes[1][7];
                            basecamp_tt.getTaskStorage((taskStorage) => {
                                for(var i in taskStorage) {
                                    if(taskStorage[i].id === taskExtractedNum) {
                                        var m = Math.floor(taskStorage[i].time / 60) % 60;
                                        var h = Math.floor(taskStorage[i].time / 3600);
                                        taskInputTime.value = (h >= 10 ? "" : "0") + h + ":" + (m >= 10 ? "" : "0") + m;
                                        taskStorage.splice(i, 1);
                                    }
                                }
                                taskSubmitButton.onclick = () => {
                                    basecamp_tt.setTaskStorage(taskStorage);
                                }
                            });
                            observer.disconnect();
                        }
                    });
                });
                observer.observe(target, config);
                var saveButtons = document.querySelectorAll(".icon.save");
                saveButtons.forEach((saveButton) => {
                    saveButton.onclick = () => {
                        var boolTaskTracked = false;
                        var taskId = saveButton.parentNode.nextElementSibling.id;
                        taskExtractedNum = basecamp_tt.extractNumber(taskId)
                        taskTimeTrackingControl = document.querySelector("body.todos #item_" + taskExtractedNum + "_time_tracking_control");
                        boolSaveButtonClicked = true;
                        basecamp_tt.getTaskStorage((taskStorage) => {
                            for(var i in taskStorage) {
                                if(taskStorage[i].id === taskExtractedNum) {
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
            }
        },
        addMarkForTrackedTasks: () => {
            basecamp_tt.getTaskStorage((taskStorage) => {
                for(var i in taskStorage) {
                    if(taskStorage[i].url && document.querySelector("body.todos #item_" + taskStorage[i].id)) {
                        var taskElement = document.querySelector("body.todos #item_" + taskStorage[i].id);
                        taskElement.style.backgroundImage = "linear-gradient(to right, #72b740, white 1.5%)";
                    }
                }
            })
        },
        initMarketingBox: () => {
            basecamp_tt.getOptionStorage((optionStorage) => {
                if(optionStorage.enableMarketingInfoBox) {
                    basecamp_tt.addMarketingBox();
                    basecamp_tt.showHideMarketingBox();
                    basecamp_tt.loadMarketingInfo();
                    basecamp_tt.saveMarketingInfo();
                }
            });
        },
        addMarketingBox: () => {
            var marketingInfoHTML, monthsName;
            if(basecamp_tt.extractNumber(window.location.href) && document.querySelector("#sidebar")) {
                var monthsArray = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
                var monthsName = monthsArray[new Date().getMonth()];
                marketingInfoHTML = `
                <div id="marketing-info-box" class="marketing-info-box indent">
                    <h2>Onlinemarketing ${monthsName}</h2>
                    <div class="progress-values">
                        <span id="marketing-progress-value">0</span>
                        <span>/</span>
                        <span id="marketing-progress-max" class="marketing-progress-max">0</span>
                    </div>
                    <progress id="progressBar" value="0" max="0"></progress>
                    <div class="show-marketing-options-container">
                        <a id="show-marketing-options" class="show-marketing-options">Zeige Optionen &#x25BC;</a>
                    </div>
                    <div id="marketing-options" class="box-hide">
                        <p>Monatliches Stundenkontingent (Pflicht)</p>
                        <input id="marketing-max-hours" placeholder="3,5,1"/>
                        <p>Eingeschlossene Projekte (Pflicht)</p>
                        <input id="marketing-included-projects" placeholder="42422414,12424214"/>
                        <p>Übersichtsname (Pflicht)</p>
                        <input id="marketing-overview-name" placeholder="Name"/>
                        <label for="marketing-overview-show" class="marketing-overview-show-label"><input id="marketing-overview-show" type="checkbox"/>In Übersicht anzeigen</label>
                        <button id="marketing-save-data">Speichern</button>
                    </div>
                </div>`;
                var sidebar = document.querySelector("#sidebar");
                sidebar.insertAdjacentHTML("afterend", marketingInfoHTML);
            }
        },
        showHideMarketingBox: () => {
            if(basecamp_tt.extractNumber(window.location.href)) {
                var showMarketingOption = document.querySelector("#show-marketing-options");
                showMarketingOption.addEventListener("click", () => {
                    var marketingOptions = document.querySelector("#marketing-options");
                    if(marketingOptions.classList.contains("box-hide")) {
                        marketingOptions.classList.remove("box-hide");
                        showMarketingOption.innerHTML = "Verstecke Optionen &#x25B2;";
                    } else {
                        marketingOptions.classList.add("box-hide");
                        showMarketingOption.innerHTML = "Zeige Optionen &#x25BC;";
                    }
                });
            }
        },
        saveMarketingInfo: () => {
            if(basecamp_tt.extractNumber(window.location.href)) {
                var saveButton = document.querySelector("#marketing-save-data");
                saveButton.addEventListener("click", () => {
                    if(confirm("Sind Sie sicher?")) {
                        basecamp_tt.getOptionStorage((optionStorage) => {
                            if(optionStorage.url && optionStorage.username && optionStorage.password) {
                                var maxHours = document.querySelector("#marketing-max-hours").value || 0;
                                var includedProjects = document.querySelector("#marketing-included-projects").value || 0;
                                var overviewName = document.querySelector("#marketing-overview-name").value || "";
                                var showInOverview = document.querySelector("#marketing-overview-show").checked;
                                fetch(optionStorage.url + "basecamp-extension-api?projectIds=" + includedProjects + "&maxHours=" + maxHours + "&overviewName=" + overviewName + "&showInOverview=" + showInOverview, {
                                    headers: basecamp_tt.getAuthHeader(
                                        optionStorage.username,
                                        optionStorage.password,
                                    )
                                }).then((response) => {
                                    if(!response.ok) {
                                        basecamp_tt.addErrorMessage(`Basecamp Time Tracker API Options - Error: ${response.statusText ? response.statusText : "Unauthorized"} `);
                                    } else {
                                        saveButton.innerHTML = "Gespeichert!";
                                        basecamp_tt.loadMarketingInfo();
                                    }
                                })
                            } else {
                                basecamp_tt.addErrorMessage("BasecampTimeTracker API options not set!");
                            }
                        });
                    } else {

                    }
                });
            }
        },
        loadMarketingInfo: () => {
            var windowHref = window.location.href;
            if(basecamp_tt.extractNumber(windowHref)) {
                basecamp_tt.getOptionStorage((optionStorage) => {
                    if(optionStorage.url && optionStorage.username && optionStorage.password) {
                        fetch(optionStorage.url + "basecamp-extension-api/?marketingHoursInfo=" + basecamp_tt.extractNumber(windowHref), {
                            headers: basecamp_tt.getAuthHeader(
                                optionStorage.username,
                                optionStorage.password
                            )
                        }).then((response) => {
                            if(!response.ok) {
                                basecamp_tt.addErrorMessage(`BasecampTimeTracker API options - Error: ${response.statusText ? response.statusText : "Unauthorized"}`);
                            }
                            return response.json();
                        }).then((itemsJson) => {
                            var progressBar = document.querySelector("#progressBar");
                            var maxHours = document.querySelector("#marketing-max-hours");
                            var includedProjects = document.querySelector("#marketing-included-projects");
                            var marketingProgressValue = document.querySelector("#marketing-progress-value");
                            var marketingProgressMax = document.querySelector("#marketing-progress-max");
                            var progressValuesText = document.querySelectorAll(".progress-values span");
                            var overviewName = document.querySelector("#marketing-overview-name");
                            var showInOverview = document.querySelector("#marketing-overview-show");
                            var includedProjectsArray = itemsJson.includedProjects.split(",");
                            if(includedProjectsArray.includes(basecamp_tt.extractNumber(windowHref))) {
                                maxHours.value = itemsJson.maxHours;
                                includedProjects.value = itemsJson.includedProjects;
                                var minutesToTwoDecimal = parseFloat(itemsJson.minutes);
                                marketingProgressMax.textContent = itemsJson.maxHours;
                                marketingProgressValue.textContent = minutesToTwoDecimal;
                                progressBar.setAttribute("max", itemsJson.maxHours);
                                progressBar.setAttribute("value", minutesToTwoDecimal);
                                var dangerValue = (100 / itemsJson.maxHours) * minutesToTwoDecimal;
                                overviewName.value = itemsJson.overviewName;
                                showInOverview.checked = (itemsJson.showInOverview === "true") ? true : (itemsJson.showInOverview === "false") ? false : false;
                                if(minutesToTwoDecimal >= itemsJson.maxHours) {
                                    progressValuesText.forEach((span) => {
                                        span.style.color = "#f00";
                                    });
                                } else if(dangerValue >= 80) {
                                    progressValuesText.forEach((span) => {
                                        span.style.color = "#f29700";
                                    });
                                }
                            }
                        })
                    } else {
                        basecamp_tt.addErrorMessage("BasecampTimeTracker API options not set!");
                    }
                });
            }
        },
        onRemoveTaskTimerRemoveMark: () => {
            chrome.storage.onChanged.addListener((changes, area) => {
                var oldTaskStorage = changes.taskStorage.oldValue, newTaskStorage = changes.taskStorage.newValue;
                if(newTaskStorage.length < oldTaskStorage.length) {
                    var taskElement;
                    oldTaskStorage.forEach((task) => {
                        if(task.url && document.querySelector("#item_" + task.id)) {
                            taskElement = document.querySelector("#item_" + task.id);
                            taskElement.style.backgroundImage = "none";
                        }
                    });
                    newTaskStorage.forEach((task) => {
                        if(task.url && document.querySelector("#item_" + task.id)) {
                            taskElement = document.querySelector("#item_" + task.id);
                            taskElement.style.backgroundImage = "linear-gradient(to right, #72b740, white 1.5%)";
                        }
                    });
                }
            });
        },
        observeMutations: function() {
            if(document.querySelector("body.todos .layout .innercol")) {
                var target = document.querySelector("body.todos .layout .innercol"), controlDiv, timeInfo;
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if(mutation.target.classList.contains("completed_items_todo_list") && mutation.addedNodes.length !== 0 && mutation.addedNodes[0].nodeType === 1) {
                            if(mutation.addedNodes[0].childNodes[1]) {
                                controlDiv = mutation.addedNodes[0].childNodes[1].childNodes[3];
                                controlDiv.insertAdjacentHTML("beforeend", basecamp_tt.getButtonHtml("add"));
                                controlDiv.insertAdjacentHTML("beforeend", basecamp_tt.getButtonHtml("save"));
                                basecamp_tt.addImagesToButtons();
                                basecamp_tt.onClickTimerButtons();
                                basecamp_tt.addMarkForTrackedTasks();
                                basecamp_tt.addAjaxLoaderToTask(mutation.addedNodes[0]);
                                basecamp_tt.getTimeEntries("itemId", 3, mutation.addedNodes[0]);
                                if(mutation.addedNodes.length < 1) {
                                    basecamp_tt.addAjaxLoaderToListTitle();
                                    timeInfo = document.querySelector(".list_title .item-time-info.title-info");
                                    timeInfo.remove();
                                    basecamp_tt.getTimeEntries("listTimeItemIds", 1);
                                }
                            }
                        } else if(mutation.target.classList.contains("items") && mutation.addedNodes.length !== 0 && mutation.addedNodes[1]) {
                            controlDiv = mutation.addedNodes[1].childNodes[1].childNodes[3];
                            controlDiv.insertAdjacentHTML("beforeend", basecamp_tt.getButtonHtml("add"));
                            controlDiv.insertAdjacentHTML("beforeend", basecamp_tt.getButtonHtml("save"));
                            basecamp_tt.addImagesToButtons();
                            basecamp_tt.onClickTimerButtons();
                            basecamp_tt.addMarkForTrackedTasks();
                            basecamp_tt.addAjaxLoaderToTask(mutation.addedNodes[1]);
                            basecamp_tt.addAjaxLoaderToListTitle();
                            basecamp_tt.getTimeEntries("itemId", 3, mutation.addedNodes[1]);
                            timeInfo = document.querySelector(".list_title .item-time-info.title-info");
                            if(timeInfo) {
                                timeInfo.remove();
                            }
                            basecamp_tt.getTimeEntries("listTimeItemIds", 1);
                        } else if(mutation.target.classList.contains("items") && mutation.addedNodes.length === 0 && mutation.nextSibling && mutation.previousSibling) {
                            controlDiv = mutation.nextSibling.childNodes[1].childNodes[3];
                            if(!controlDiv.childNodes[5]) {
                                controlDiv.insertAdjacentHTML("beforeend", basecamp_tt.getButtonHtml("add"));
                                controlDiv.insertAdjacentHTML("beforeend", basecamp_tt.getButtonHtml("save"));
                                basecamp_tt.addImagesToButtons();
                                basecamp_tt.onClickTimerButtons();
                                basecamp_tt.addMarkForTrackedTasks();
                                if(mutation.addedNodes[1]) {
                                    basecamp_tt.addAjaxLoaderToTask(mutation.addedNodes[1]);
                                    basecamp_tt.getTimeEntries("itemId", 3, mutation.addedNodes[1]);
                                } else if(mutation.nextSibling) {
                                    basecamp_tt.addAjaxLoaderToTask(mutation.nextSibling);
                                    basecamp_tt.getTimeEntries("itemId", 3, mutation.nextSibling);
                                }
                                else if(mutation.target.childNodes[1]) {
                                    basecamp_tt.addAjaxLoaderToTask(mutation.target.childNodes[1]);
                                    basecamp_tt.getTimeEntries("itemId", 3, mutation.target.childNodes[1]);
                                }
                                if(mutation.addedNodes.length > 0) {
                                    basecamp_tt.addAjaxLoaderToListTitle();
                                    timeInfo = document.querySelector(".list_title .item-time-info.title-info");
                                    timeInfo.remove();
                                    basecamp_tt.getTimeEntries("listTimeItemIds", 1);
                                }
                            }
                        }
                    });
                });
                var config = { childList: true, subtree: true };
                observer.observe(target, config);
            }
        },
        getTimeEntries: (nameFor, type, task = null) => {
            basecamp_tt.getOptionStorage((optionStorage) => {
                if(optionStorage.enableTimeInfoLabels) {
                    var windowHref = window.location.href;
                    if(basecamp_tt.extractNumber(windowHref) && document.querySelectorAll(".list_title").length <= 1) {
                        var projectId = basecamp_tt.extractNumber(windowHref);
                        var excludedProjectIds = optionStorage.excludedProjects.split(",");
                        if(!excludedProjectIds.includes(projectId)) {
                            if(optionStorage.url && optionStorage.username && optionStorage.password) {
                                fetch(optionStorage.url + "basecamp-extension-api?" + nameFor + "=" + ((type === 1) ? basecamp_tt.getTasksWithTimeEntries() : (type === 2) ? projectId : (type === 3) ? basecamp_tt.extractNumber(task.id) : ""), {
                                    headers: basecamp_tt.getAuthHeader(
                                        optionStorage.username,
                                        optionStorage.password,
                                    )
                                }).then((response) => {
                                    if(!response.ok) {
                                        basecamp_tt.addErrorMessage(`BasecampTimeTracker API options - Error: ${response.statusText ? response.statusText : "Unauthorized"}`);
                                    }
                                    return response.json();
                                }).then((timeEntries) => {
                                    switch(type) {
                                        case 1: basecamp_tt.addTimeInfoToListTitle(timeEntries[0]); break;
                                        case 2:
                                        case 3: timeEntries.forEach((timeEntry) => { basecamp_tt.addTimeInfoToTask(timeEntry); }); break;
                                    }
                                });
                            } else {
                                basecamp_tt.addErrorMessage("BasecampTimeTracker API options not set!");
                            }
                        }
                    }
                }
            });
        },
        addTimeInfoToTask: (item) => {
            var itemId = item.itemId;
            if(document.querySelector("#item_" + itemId + "_content")) {
                var itemContentId = document.querySelector("#item_" + itemId + "_content");
                itemContentId.insertAdjacentHTML("beforeend", basecamp_tt.getTimeInfoBoxHtml(basecamp_tt.getTimeInfo(item)));
                var timeInfoAjaxLoader = document.querySelector("#item_" + itemId + "_content .ajax-loader");
                timeInfoAjaxLoader.remove();
            }
        },
        addTimeInfoToListTitle: (item) => {
            if(document.querySelector(".list_title")) {
                var itemContentId = document.querySelector(".list_title");
                itemContentId.insertAdjacentHTML("beforeend", basecamp_tt.getTimeInfoBoxHtml(basecamp_tt.getTimeInfo(item), true));
                var timeInfoAjaxLoader = document.querySelector(".list_title .ajax-loader.title-loader");
                timeInfoAjaxLoader.remove();
            }
        },
        getTimeInfo: (item) => {
            var m = item.minutes % 60;
            var h = Math.floor(item.minutes / 60);
            return (h >= 10 ? "" : "0") + h + ":" + (m >= 10 ? "" : "0") + m;
        },
        getTimeInfoBoxHtml: (time, titleInfo = false) => {
            return `<span id = "list-time-info" class="item-time-info${titleInfo ? " title-info" : ""}"> ${time}</span > `;
        },
        getTasksWithTimeEntries: () => {
            var extractedTaskIds = [];
            var tasks = document.querySelectorAll("body.todos div.list div.list_widget");
            tasks.forEach((task) => {
                if(task.querySelector(".sprite.timeclock.on")) {
                    var listTitle = document.querySelector(".list_title");
                    var listTitleId = basecamp_tt.extractNumber(listTitle.id);
                    var uncompletedTasks = document.querySelector("#list_" + listTitleId + "_title + .items_wrapper .sprite.timeclock.on");
                    var completedTasks = document.querySelector("#list_" + listTitleId + "_title ~ .completed_items_todo_list.done .sprite.timeclock.on");
                    if(uncompletedTasks || completedTasks) {
                        extractedTaskIds.push(basecamp_tt.extractNumber(task.id));
                    }
                }
            });
            return extractedTaskIds.join(",");
        },
        extractNumber: (string) => {
            if(string.match(/\d+/g)) {
                var itemExtractedNum = string.match(/\d+/g).map(String)[0];
                if(itemExtractedNum) {
                    return itemExtractedNum;
                } else {
                    return false;
                }
            }
        },
        getButtonHtml: (button) => {
            switch(button) {
                case "add": return "<span class='icon add'></span>";
                case "save": return "<span class='icon save'></span>";
            }
        },
        addErrorMessage: (message) => {
            var errorMessage = `<div class="error-message">${message}</div>`;
            document.body.insertAdjacentHTML("afterbegin", errorMessage);
        },
        getAuthHeader: (username, password) => {
            var headers = new Headers();
            headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
            return headers;
        },
        getTaskObject: (taskId, taskName, taskUrl, taskCompany, taskProject) => {
            return {
                id: taskId,
                name: taskName,
                time: 0,
                paused: false,
                url: taskUrl,
                company: taskCompany,
                project: taskProject
            }
        },
        getOptionStorage: (callback) => {
            chrome.storage.local.get("optionStorage", (res) => {
                callback(res.optionStorage);
            });
        },
        getTaskStorage: (callback) => {
            chrome.storage.local.get("taskStorage", (res) => {
                callback(res.taskStorage);
            });
        },
        setTaskStorage: function(taskArray) {
            chrome.storage.local.set({ taskStorage: taskArray }, function() {
            });
        }
    }
    basecamp_tt.init();
})();