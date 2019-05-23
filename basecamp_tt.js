var taskArray = [];
var timerButton = "<span class='timer'></span>";

document.querySelectorAll(".controls").forEach(function(c) {
    c.insertAdjacentHTML('beforeend', timerButton)
});

document.querySelectorAll(".timer").forEach(function(t) {
    t.onclick = function() {
        var getTaskStorage = browser.storage.local.get("taskStorage");
        getTaskStorage.then(function(res) {
            var tId = t.parentNode.nextElementSibling.id;
            var tExtractedNum = tId.match(/\d+/g).map(Number)[0];
            var tTaskName = document.querySelector("#item_wrap_" + tExtractedNum).textContent;
            var timerTaskObject = {
                id: tExtractedNum,
                name: tTaskName,
                time: Date.now(),
                stopped: false
            }
            
            taskArray = res.taskStorage;
            taskArray.push(timerTaskObject);
            browser.storage.local.set({
                taskStorage: taskArray
            });
        }); 
    }
});