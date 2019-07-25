(function() {
    "use strict";
    var basecamp_options = {
        init: function() {
            basecamp_options.loadOptions();
            basecamp_options.saveOptions();
        },
        loadOptions: function() {
            var option1, option2, option3, option4, optionStorage;
            option1 = document.querySelector("#option-1");
            option2 = document.querySelector("#option-2");
            option3 = document.querySelector("#option-3");
            option4 = document.querySelector("#option-4");
            basecamp_options.getOptionsStorage().then(function(option) {
                optionStorage = option.optionStorage;
                option1.value = optionStorage["url"] || "";
                option2.value = optionStorage["user"] || "";
                option3.value = optionStorage["pass"] || "";
                option4.value = optionStorage["excl"] || "";
            });
        },
        saveOptions: function() {
            var option1, option2, option3, option4, saveButton;
            option1 = document.querySelector("#option-1");
            option2 = document.querySelector("#option-2");
            option3 = document.querySelector("#option-3");
            option4 = document.querySelector("#option-4");
            saveButton = document.querySelector("#save-button");
            saveButton.addEventListener("click", function() {
                var options = {
                    url: option1.value,
                    user: option2.value,
                    pass: option3.value,
                    excl: option4.value
                }
                basecamp_options.setOptionsStorage(options);
                saveButton.innerHTML = "Saved!";
            });
        },
        getOptionsStorage: function() {
            return browser.storage.local.get("optionStorage");
        },
        setOptionsStorage: function(optionsArray) {
            browser.storage.local.set({
                optionStorage: optionsArray
            });
        }
    }
    basecamp_options.init();
})();