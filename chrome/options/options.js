(function() {
    "use strict";
    var basecamp_options = {
        init: function() {
            basecamp_options.loadOptions();
            basecamp_options.onOptionsFormSubmit();
        },
        loadOptions: () => {
            var optionFormElements = basecamp_options.getOptionsFormElements()
            basecamp_options.getOptionStorage((optionStorage) => {
                optionFormElements.enableTimeInfoLabelsCheckbox.checked = optionStorage.enableTimeInfoLabels || false;
                optionFormElements.enableMarketingInfoBoxCheckbox.checked = optionStorage.enableMarketingInfoBox || false;
                optionFormElements.urlInput.value = optionStorage.url || "";
                optionFormElements.usernameInput.value = optionStorage.username || "";
                optionFormElements.passwordInput.value = optionStorage.password || "";
                optionFormElements.excludedProjectsInput.value = optionStorage.excludedProjects || "";
            });
        },
        onOptionsFormSubmit: () => {
            var optionsForm = document.querySelector("#options-form");
            optionsForm.addEventListener("submit", (event) => {
                event.preventDefault();
                var optionFormElements = basecamp_options.getOptionsFormElements();
                basecamp_options.setOptionStorage({
                    enableTimeInfoLabels: optionFormElements.enableTimeInfoLabelsCheckbox.checked,
                    enableMarketingInfoBox: optionFormElements.enableMarketingInfoBoxCheckbox.checked,
                    url: optionFormElements.urlInput.value,
                    username: optionFormElements.usernameInput.value,
                    password: optionFormElements.passwordInput.value,
                    excludedProjects: optionFormElements.excludedProjectsInput.value,
                });
                optionFormElements.saveButton.textContent = "Saved!";
            });
        },
        getOptionsFormElements: () => {
            return {
                enableTimeInfoLabelsCheckbox: document.querySelector("#enableTimeInfoLabels"),
                enableMarketingInfoBoxCheckbox: document.querySelector("#enableMarketingInfoBox"),
                urlInput: document.querySelector("#url"),
                usernameInput: document.querySelector("#username"),
                passwordInput: document.querySelector("#password"),
                excludedProjectsInput: document.querySelector("#excluded"),
                saveButton: document.querySelector("#save-button"),
            }
        },
        getOptionStorage: (callback) => {
            chrome.storage.local.get("optionStorage", (res) => {
                callback(res.optionStorage);
            });
        },
        setOptionStorage: (optionsArray) => {
            chrome.storage.local.set({ optionStorage: optionsArray }, () => {
            });
        }
    }
    basecamp_options.init();
})();