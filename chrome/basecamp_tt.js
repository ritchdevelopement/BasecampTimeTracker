
(function() {
    "use strict";
    var basecamp_tt = {
        init: function() {
            basecamp_tt.addTimerButtonToTasks();
            basecamp_tt.addTimerImagesToButton();
            basecamp_tt.addTaskToTimeTracker();
        },
        addTimerButtonToTasks: function() {
            var controlDivs, timerButtonHTML;
            controlDivs = document.querySelectorAll(".list .controls");
            timerButtonHTML = "<span class='icon add'></span>";
            controlDivs.forEach(function(controlDiv) {
                controlDiv.insertAdjacentHTML("beforeend", timerButtonHTML);
            });
        },
        addTimerImagesToButton: function() {
            var imgURL;
            imgURL = chrome.runtime.getURL("images/add_button.png");
            document.querySelectorAll(".icon.add").forEach(function(addButton) {
                addButton.style.backgroundImage = "url('" + imgURL + "')";
            })
        },
        addTaskToTimeTracker: function() {
            var addButtons, taskId, taskExtractedNum, taskName, tasks, i;
            addButtons = document.querySelectorAll(".icon");
            addButtons.forEach(function(addButton) {
                addButton.onclick = function() {
                    taskId = addButton.parentNode.nextElementSibling.id;
                    taskExtractedNum = taskId.match(/\d+/g).map(Number)[0];
                    taskName = document.querySelector("#item_wrap_" + taskExtractedNum).textContent;
                    chrome.storage.local.get("taskStorage", function(res) {
                        tasks = res.taskStorage;
                        for(i in tasks) {
                            if(tasks[i].id === taskExtractedNum) {
                                alert("A task with this id is already added to the time tracker!");
                                return;
                            }
                        }
                        tasks.push(basecamp_tt.createTaskObject(taskExtractedNum, taskName));
                        basecamp_tt.setTaskStorage(tasks);
                    });
                }
            })
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
    basecamp_tt.init();
})();