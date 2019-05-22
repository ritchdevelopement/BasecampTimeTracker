var controls = document.querySelectorAll(".controls");
var timerButton = "<span class='timer'></span>";

controls.forEach(function(c) {
    c.insertAdjacentHTML('beforeend', timerButton)
});

var timers = document.querySelectorAll(".timer");
timers.forEach(function(t) {
    t.onclick = function() {
        var tId = t.parentNode.nextElementSibling.id;
        var tExtractedNum = tId.match(/\d+/g).map(Number)[0];
        var tTaskName = document.querySelector("#item_wrap_" + tExtractedNum).textContent;
        console.log(tTaskName);
    }
});