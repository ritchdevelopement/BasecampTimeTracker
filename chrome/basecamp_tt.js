
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
            basecamp_tt.observeMutations();
            basecamp_tt.addAjaxLoaderToTasks();
            basecamp_tt.getEntries("itemIds", 2);
            basecamp_tt.addAjaxLoaderToListTitle();
            basecamp_tt.getEntries("listTimeItemIds", 1);
            basecamp_tt.addMarketingBox();
            basecamp_tt.showHideMarketingBox();
            basecamp_tt.saveMarketingInfo();
            basecamp_tt.loadMarketingInfo();
        },
        addMarketingBox: function() {
            var marketingInfoHTML, sidebar, str, actualMonth, monthsArray, date, monthsName, projectId;
            str = window.location.href;
            if(basecamp_tt.getNumberFromItemId(str) && document.querySelector("#sidebar")) {
                projectId = basecamp_tt.getNumberFromItemId(str);
                monthsArray    = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
                date = new Date();
                actualMonth  = date.getMonth();
                monthsName = monthsArray[actualMonth];
                marketingInfoHTML = `<div id="marketing-info-box" class="marketing-info-box indent">
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
                sidebar = document.querySelector("#sidebar");
                sidebar.insertAdjacentHTML("afterend", marketingInfoHTML);
            }
        },
        showHideMarketingBox: function() {
            var showMarketingOption, marketingOptions, str;
            str = window.location.href;
            if(basecamp_tt.getNumberFromItemId(str)) {
                showMarketingOption = document.querySelector("#show-marketing-options");
                showMarketingOption.addEventListener("click", function() {
                    marketingOptions = document.querySelector("#marketing-options");
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
        saveMarketingInfo: function() {
            var maxHours, includedProjects, overviewName, showInOverview, saveButton, str, headers, optionStorage, url, username, password;
            str = window.location.href;
            if(basecamp_tt.getNumberFromItemId(str)) {
                saveButton = document.querySelector("#marketing-save-data");
                saveButton.addEventListener("click", function() {
                    if(confirm("Sind Sie sicher?")) {
                        maxHours = document.querySelector("#marketing-max-hours").value || 0;
                        includedProjects = document.querySelector("#marketing-included-projects").value || 0;
                        overviewName = document.querySelector("#marketing-overview-name").value || "";
                        showInOverview = document.querySelector("#marketing-overview-show").checked;
                        headers = new Headers();
                        chrome.storage.local.get("optionStorage", function(option) {
                            optionStorage = option.optionStorage;
                            if(!optionStorage.length) {
                                if(optionStorage["url"] || optionStorage["user"] || optionStorage["pass"]) {
                                    url = optionStorage["url"];
                                    username = optionStorage["user"];
                                    password = optionStorage["pass"];
                                    headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
                                    fetch(url + "basecamp-extension-api?projectIds=" + includedProjects + "&maxHours=" + maxHours + "&overviewName=" + overviewName + "&showInOverview=" + showInOverview, {
                                        headers: headers
                                    })
                                    .then(function(response) {
                                        if(!response.ok) {
                                            throw Error(response.statusText);
                                        }
                                        saveButton.innerHTML = "Gespeichert!";
                                        basecamp_tt.loadMarketingInfo();
                                    })
                                } else {
                                    console.warn("Options aren't set or false");
                                }
                            } else {
                                console.warn("Options aren't set")
                            }
                        });
                    } else {

                    }
                });
            }
        },
        loadMarketingInfo: function() {
            var maxHours, overviewName, showInOverview, includedProjects, includedProjectsArray, dangerValue, i, progressBar, minutesToTwoDecimal, str, headers, progressValuesText, optionStorage, url, username, password, companyName, itemsJson, marketingProgressValue, marketingProgressMax;
            str = window.location.href;
            if(basecamp_tt.getNumberFromItemId(str)) {
                companyName = document.querySelector("#Header h1 > span").textContent;
                progressBar = document.querySelector("#progressBar");
                maxHours = document.querySelector("#marketing-max-hours");
                includedProjects = document.querySelector("#marketing-included-projects");
                marketingProgressValue = document.querySelector("#marketing-progress-value");
                marketingProgressMax = document.querySelector("#marketing-progress-max");
                progressValuesText = document.querySelectorAll(".progress-values span");
                overviewName = document.querySelector("#marketing-overview-name");
                showInOverview = document.querySelector("#marketing-overview-show");
                headers = new Headers();
                chrome.storage.local.get("optionStorage", function(option) {
                    optionStorage = option.optionStorage;
                    if(!optionStorage.length) {
                        if(optionStorage["url"] || optionStorage["user"] || optionStorage["pass"]) {
                            url = optionStorage["url"];
                            username = optionStorage["user"];
                            password = optionStorage["pass"];
                            headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
                            fetch(url + "basecamp-extension-api/?marketingHoursInfo=" + basecamp_tt.getNumberFromItemId(str), {
                                headers: headers
                            })
                            .then(function(response) {
                                if(!response.ok) {
                                    throw Error(response.statusText);
                                }
                                return response.json();
                            })
                            .then(function(json) {
                                itemsJson = json;  
                                includedProjectsArray = itemsJson.includedProjects.split(",");
                                if(includedProjectsArray.includes(basecamp_tt.getNumberFromItemId(str))) {
                                    maxHours.value = itemsJson.maxHours;
                                    includedProjects.value = itemsJson.includedProjects;
                                    minutesToTwoDecimal = parseFloat(itemsJson.minutes);
                                    marketingProgressMax.textContent = itemsJson.maxHours;
                                    marketingProgressValue.textContent = minutesToTwoDecimal;
                                    progressBar.setAttribute("max", itemsJson.maxHours);
                                    progressBar.setAttribute("value", minutesToTwoDecimal);
                                    dangerValue = (100/itemsJson.maxHours) * minutesToTwoDecimal;
                                    overviewName.value = itemsJson.overviewName;
                                    showInOverview.checked = (itemsJson.showInOverview === "true") ? true : (itemsJson.showInOverview === "false") ? false : false;
                                    if(minutesToTwoDecimal >= itemsJson.maxHours) {
                                        progressValuesText.forEach(function(span) {
                                            span.style.color = "#f00";
                                        });
                                    } else if(dangerValue >= 80) {
                                        progressValuesText.forEach(function(span) {
                                            span.style.color = "#f29700";
                                        });
                                    }
                                }
                            })
                        } else {
                            console.warn("Options aren't set or false");
                        }
                    } else {
                        console.warn("Options aren't set")
                    }
                });
            }
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
        addAjaxLoaderToTasks: function() {
            var ajaxLoaderHtml, timeClocksOn, optionStorage, projectsExcluded, str, newstr, projectsExcludedArray;
            str = window.location.href;
            if(document.querySelectorAll(".sprite.timeclock.on") && document.querySelectorAll(".list_title").length <= 1) {
                timeClocksOn = document.querySelectorAll(".sprite.timeclock.on");
                ajaxLoaderHtml = "<div class='ajax-loader'><div></div><div></div><div></div><div></div></div>";
                chrome.storage.local.get("optionStorage", function(option) {
                    optionStorage = option.optionStorage;
                    projectsExcluded = optionStorage.excl || "";
                    projectsExcludedArray = projectsExcluded.split(",");
                    newstr = basecamp_tt.getNumberFromItemId(str);
                    if(!projectsExcludedArray.includes(newstr)) {
                        timeClocksOn.forEach(function(timeClock) {
                            timeClock.parentNode.parentNode.nextElementSibling.insertAdjacentHTML("beforeend", ajaxLoaderHtml);
                        });
                    }
                });
            }
        },
        addAjaxLoaderToListTitle: function() {
            var ajaxLoaderHtml, listTitle, optionStorage, projectsExcluded, str, newstr, projectsExcludedArray, listTitleExtractedId, checkListHasTimeElement1, checkListHasTimeElement2;
            str = window.location.href;
            if(document.querySelectorAll(".list_title").length <= 1) {
                ajaxLoaderHtml = "<div class='ajax-loader title-loader'><div></div><div></div><div></div><div></div></div>";
                chrome.storage.local.get("optionStorage", function(option) {
                    optionStorage = option.optionStorage;
                    projectsExcluded = optionStorage.excl || "";
                    projectsExcludedArray = projectsExcluded.split(",");
                    newstr = basecamp_tt.getNumberFromItemId(str);
                    if(!projectsExcludedArray.includes(newstr) && document.querySelector(".list_title")) {
                        listTitle = document.querySelector(".list_title");
                        listTitleExtractedId = basecamp_tt.getNumberFromItemId(listTitle.id);
                        checkListHasTimeElement1 = document.querySelector("#list_" + listTitleExtractedId + "_title + .items_wrapper .sprite.timeclock.on");
                        checkListHasTimeElement2 = document.querySelector("#list_" + listTitleExtractedId + "_title ~ .completed_items_todo_list.done .sprite.timeclock.on");
                        if(checkListHasTimeElement1 || checkListHasTimeElement2) {
                            listTitle.insertAdjacentHTML("beforeend", ajaxLoaderHtml);
                        }
                    }
                });
            }
        },
        addAjaxLoaderToTask: function(task) {
            var ajaxLoaderHtml, taskId, taskContent, taskExtractedNum, optionStorage, projectsExcludedArray, newstr, projectsExcluded, str;
            if(document.querySelectorAll(".list_title").length <= 1) {
                chrome.storage.local.get("optionStorage", function(option) {
                    str = window.location.href;
                    optionStorage = option.optionStorage;
                    projectsExcluded = optionStorage.excl || "";
                    projectsExcludedArray = projectsExcluded.split(",");
                    newstr = basecamp_tt.getNumberFromItemId(str);
                    if(!projectsExcludedArray.includes(newstr)) {
                        ajaxLoaderHtml = "<div class='ajax-loader'><div></div><div></div><div></div><div></div></div>";
                        taskId = task.id;
                        taskExtractedNum = basecamp_tt.getNumberFromItemId(taskId);
                        if(task.querySelector(".sprite.timeclock.on")) {
                            taskContent = document.querySelector("#item_" + taskExtractedNum + "_content");
                            taskContent.insertAdjacentHTML("beforeend", ajaxLoaderHtml);
                        }
                    }
                });
                
            }
        },
        addTaskToTimeTracker: function() {
            var addButtons, taskId, taskExtractedNum, taskName, tasks, i, taskUrl, taskItem, taskCompany, taskProject;
            addButtons = document.querySelectorAll(".icon.add");
            addButtons.forEach(function(addButton) {
                addButton.onclick = function() {
                    taskId = addButton.parentNode.nextElementSibling.id;
                    taskExtractedNum = Number(basecamp_tt.getNumberFromItemId(taskId));
                    taskName = document.querySelector("#item_wrap_" + taskExtractedNum).textContent;
                    taskItem = document.querySelector("body.todos #item_" + taskExtractedNum);
                    taskItem.style.backgroundImage = "linear-gradient(to right, #72b740, white 1.5%)";
                    taskCompany = document.querySelector("#Header h1 span").textContent;
                    taskProject = document.querySelector("#Header h1").childNodes[0].textContent;
                    taskUrl = window.location.href;
                    chrome.storage.local.get("taskStorage", function(res) {
                        tasks = res.taskStorage;
                        console.log(tasks);
                        for(i in tasks) {
                            if(tasks[i].id === taskExtractedNum) {
                                alert("A task with this id is already added to the time tracker!");
                                return;
                            }
                        }
                        tasks.push(basecamp_tt.createTaskObject(taskExtractedNum, taskName, taskUrl, taskCompany, taskProject));
                        basecamp_tt.setTaskStorage(tasks);
                    });
                }
            })
        },
        addTimeToTask: function() {
            var boolTaskTracked, m, h, saveButtons, taskId, taskExtractedNum, taskInputTime, taskInputDescription, taskSubmitButton, taskTimeTrackingControl, target, observer, config, boolSaveButtonClicked, tasks, i;
            boolSaveButtonClicked = false;
            boolTaskTracked = false;
            if(document.querySelector("body.todos .layout .innercol")) {
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
                                        tasks.splice(i, 1);
                                    }
                                }
                                taskSubmitButton.onclick = function() {
                                    basecamp_tt.setTaskStorage(tasks);
                                }
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
            }
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
        addTimeInfoToTask: function(item) {
            var itemContentId, timeInfoBoxHTML, itemId, itemTime, h, m, timeInfo;
            itemId = item.itemId;
            if(document.querySelector("#item_" + itemId + "_content")) {
                m = item.minutes % 60;
                h = Math.floor(item.minutes/60);
                itemContentId = document.querySelector("#item_" + itemId + "_content");
                itemTime = (h >= 10 ? "" : "0" ) + h + ":" + (m >= 10 ? "" : "0" ) + m
                timeInfoBoxHTML = `<span id="item-time-info-${itemId}" class="item-time-info">${itemTime}</span>`;
                itemContentId.insertAdjacentHTML("beforeend", timeInfoBoxHTML);
                timeInfo = document.querySelector("#item_" + itemId + "_content .ajax-loader");
                timeInfo.remove();
            }
        },
        addTimeInfoToList: function(item) {
            var itemContentId, timeInfoBoxHTML, listTime, h, m, timeInfoAjaxLoader;
            if(document.querySelector(".list_title")) {    
                m = item.minutes % 60;
                h = Math.floor(item.minutes/60);
                itemContentId = document.querySelector(".list_title");
                listTime = (h >= 10 ? "" : "0" ) + h + ":" + (m >= 10 ? "" : "0" ) + m
                timeInfoBoxHTML = `<span id="list-time-info" class="item-time-info title-info">${listTime}</span>`;
                itemContentId.insertAdjacentHTML("beforeend", timeInfoBoxHTML);
                timeInfoAjaxLoader = document.querySelector(".list_title .ajax-loader.title-loader");
                timeInfoAjaxLoader.remove();
            }
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
        observeMutations: function() {
            var target, observer, config, controlDiv, timerButtonHTML, saveButtonHTML, timeInfo;
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
                                basecamp_tt.addAjaxLoaderToTask(mutation.addedNodes[0]);
                                basecamp_tt.getEntries("itemId", 3, mutation.addedNodes[0]);
                                if(mutation.addedNodes.length < 1) {
                                    basecamp_tt.addAjaxLoaderToListTitle();
                                    timeInfo = document.querySelector(".list_title .item-time-info.title-info");
                                    timeInfo.remove();
                                    basecamp_tt.getEntries("listTimeItemIds", 1);
                                }
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
                            basecamp_tt.addAjaxLoaderToTask(mutation.addedNodes[1]);
                            basecamp_tt.getEntries("itemId", 3, mutation.addedNodes[1]);
                            basecamp_tt.addAjaxLoaderToListTitle();
                            timeInfo = document.querySelector(".list_title .item-time-info.title-info");
                            timeInfo.remove();
                            basecamp_tt.getEntries("listTimeItemIds", 1);
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
                                if(mutation.addedNodes[1]) {
                                    basecamp_tt.addAjaxLoaderToTask(mutation.addedNodes[1]);
                                    basecamp_tt.getEntries("itemId", 3, mutation.addedNodes[1]);
                                } else if(mutation.nextSibling) {
                                    basecamp_tt.addAjaxLoaderToTask(mutation.nextSibling);
                                    basecamp_tt.getEntries("itemId", 3, mutation.nextSibling);
                                }
                                else if(mutation.target.childNodes[1]) {
                                    basecamp_tt.addAjaxLoaderToTask(mutation.target.childNodes[1]);
                                    basecamp_tt.getEntries("itemId", 3, mutation.target.childNodes[1]);
                                }
                                if(mutation.addedNodes.length > 0) {
                                    basecamp_tt.addAjaxLoaderToListTitle();
                                    timeInfo = document.querySelector(".list_title .item-time-info.title-info");
                                    timeInfo.remove();
                                    basecamp_tt.getEntries("listTimeItemIds", 1);
                                }
                            }
                        }
                    });  
                });
                observer.observe(target, config);
            }
        },
        getEntries: function(nameFor, type, task = null) {
            var str, headers, optionStorage, projectsExcluded, projectsExcludedArray, newstr, url, username, password, itemsJson;
            str = window.location.href;
            if(basecamp_tt.getNumberFromItemId(str) && document.querySelectorAll(".list_title").length <= 1) {
                newstr = basecamp_tt.getNumberFromItemId(str);
                headers = new Headers();
                chrome.storage.local.get("optionStorage", function(option) {
                    optionStorage = option.optionStorage;
                    projectsExcluded = optionStorage.excl;
                    projectsExcludedArray = projectsExcluded.split(",");
                    if(!projectsExcludedArray.includes(newstr)) {
                        if(!optionStorage.length) {
                            if(optionStorage["url"] || optionStorage["user"] || optionStorage["pass"]) {
                                url = optionStorage["url"];
                                username = optionStorage["user"];
                                password = optionStorage["pass"];
                                headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
                                fetch(url + "basecamp-extension-api?" + nameFor + "=" + ((type === 1) ? basecamp_tt.getExtractedIdItemIdArray() : (type === 2) ? newstr : (type === 3) ? basecamp_tt.getNumberFromItemId(task.id) : ""), {
                                    headers: headers
                                })
                                .then(function(response) {
                                    if(!response.ok) {
                                        throw Error(response.statusText);
                                    }
                                    return response.json();
                                })
                                .then(function(json) {
                                    itemsJson = json;
                                    switch(type) {
                                        case 1: basecamp_tt.addTimeInfoToList(itemsJson[0]); break;
                                        case 2: itemsJson.forEach(function(item) { basecamp_tt.addTimeInfoToTask(item); }); break;
                                        case 3: itemsJson.forEach(function(item) { basecamp_tt.addTimeInfoToTask(item); }); break;
                                    }  
                                })
                            } else {
                                console.warn("Options aren't set or false");
                            }
                        } else {
                            console.warn("Options aren't set")
                        }
                    } else {
                        console.warn("Project is excluded")
                    }
                });
            }
        },
        getExtractedIdItemIdArray: function() {
            var itemExtracedIdArray, itemIdArray, listTitleId, itemExtractedId, listTitleExtractedId, checkListHasTimeElement1, checkListHasTimeElement2, itemIdsString;
            itemExtracedIdArray = [];
            itemIdArray = document.querySelectorAll("body.todos div.list div.list_widget");
            listTitleId = document.querySelector(".list_title");
            itemIdArray.forEach(function(itemId) {
                if(itemId.querySelector(".sprite.timeclock.on")) {
                    itemExtractedId = basecamp_tt.getNumberFromItemId(itemId.id);
                    listTitleExtractedId = basecamp_tt.getNumberFromItemId(listTitleId.id);
                    checkListHasTimeElement1 = document.querySelector("#list_" + listTitleExtractedId + "_title + .items_wrapper .sprite.timeclock.on");
                    checkListHasTimeElement2 = document.querySelector("#list_" + listTitleExtractedId + "_title ~ .completed_items_todo_list.done .sprite.timeclock.on");
                    if(checkListHasTimeElement1 || checkListHasTimeElement2) {
                        itemExtracedIdArray.push(itemExtractedId);
                    }
                }     
            });
            itemIdsString = itemExtracedIdArray.join(",");
            return itemIdsString;
        },
        getNumberFromItemId: function(itemId) {
            if(itemId.match(/\d+/g)) {
                var itemExtractedNum = itemId.match(/\d+/g).map(String)[0];
                if(itemExtractedNum) {
                    return itemExtractedNum;
                } else {
                    return false;
                }
            }
        },
        createTaskObject: function(taskId, taskName, taskUrl, taskCompany, taskProject) {
            var task;
            task = {
                id: taskId,
                name: taskName,
                time: 0,
                paused: false,
                url: taskUrl,
                description: "",
                company: taskCompany,
                project: taskProject
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