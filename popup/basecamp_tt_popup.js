//browser.storage.local.clear();
var taskTable = document.querySelector("#popup-task-table tbody");
var getTaskStorage = browser.storage.local.get("taskStorage");
getTaskStorage.then(function(res) {
    res.taskStorage.forEach(function(task) {
        var taskHTML = `<tr id=${task.id} class="task">
            <td><span class="timer ${task.stopped?'play':'pause'}"></span></td>
            <td id="task-timer-${task.id}">${showTimer(task.time)}</td>
            <td>${task.name}</td>
            <td><span class="timer remove"></span></td>
        </tr>`;
        taskTable.insertAdjacentHTML("beforeend", taskHTML);
        setInterval(function() {
            document.querySelector("#task-timer-"+task.id).innerHTML = showTimer(task.time);
        }, 1000);
    });

    document.querySelectorAll(".timer.remove").forEach(function(d) {
        d.addEventListener("click", function() {
            this.parentElement.parentElement.remove();
            var oldRes = res.taskStorage;
            var removeId = this.parentElement.parentElement.id;
            for(var i in oldRes) {
               if(oldRes[i].id == removeId) {
                   oldRes.splice(i, 1);
               }
            }
            browser.storage.local.remove("taskStorage");
            browser.storage.local.set({
                taskStorage: oldRes
            });
        });
    });
});

function showTimer(taskTime) {
    var diffTime = Date.now() - taskTime;
    var s = Math.round(diffTime/1000) % 60;
    var m = Math.round(diffTime/(1000*60));
    var h = Math.round(diffTime/(1000*60*60));
    return (h >= 10 ? "" : "0" ) + h + ":" + (m >= 10 ? "" : "0" ) + m + ":" + (s >= 10 ? "" : "0") + s;
}

