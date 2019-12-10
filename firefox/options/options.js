(function() {
    "use strict";
    var basecamp_options = {
        init: () => {
            basecamp_options.loadOptions();
            basecamp_options.onOptionsFormSubmit();
        },
        loadOptions: () => {
            var optionFormElements = basecamp_options.getOptionsFormElements()
            basecamp_options.getOptionStorage().then((optionStorage) => {
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
        getOptionStorage: () => {
            return browser.storage.local.get("optionStorage").then((res) => {
                return res.optionStorage;
            });
        },
        setOptionStorage: (optionsArray) => {
            browser.storage.local.set({
                optionStorage: optionsArray
            });
        },
    }
    basecamp_options.init();
})();