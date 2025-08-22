document.addEventListener('DOMContentLoaded', function() {
    const modelSelection = document.getElementById('modelSelection');
    const saveButton = document.getElementById('saveButton');
    const status = document.getElementById('status');
    chrome.runtime.sendMessage({type: "GET_MODEL_NAME"}, function(response) {
        if (response && response.modelName) {
            modelSelection.value = response.modelName;
        }
    });
    saveButton.addEventListener('click', function() {
        const selectedModel = modelSelection.value;
        chrome.runtime.sendMessage({
            type: "SET_MODEL_NAME",
            modelName: selectedModel
        }, function(response) {
            if (response && response.success) {
                status.textContent = 'Settings saved successfully!';
            } else {
                status.textContent = 'Error saving settings.';
            }
            setTimeout(function() {
                status.textContent = '';
            }, 3000);
        });
    });
});
