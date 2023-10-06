document.addEventListener("DOMContentLoaded", function () {
    const translationResult = document.getElementById("translationResult");
    const pronunciationCheckbox = document.getElementById("pronunciationCheckbox");

    // Define an array to store the loaded JSON data for each letter.
    const jsonData = {};

    // Define an array of alphabet letters.
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

    // Function to load JSON data for a specific letter.
    function loadJSON(letter) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `data/${letter}.json`, true);

            xhr.onload = function () {
                if (xhr.status === 200) {
                    jsonData[letter] = JSON.parse(xhr.responseText);
                    resolve();
                } else {
                    reject(xhr.statusText);
                }
            };

            xhr.onerror = function () {
                reject(xhr.statusText);
            };

            xhr.send();
        });
    }

    // Function to load all JSON files in parallel.
    function loadAllJSONFiles() {
        const promises = alphabet.map(loadJSON);

        Promise.all(promises)
            .then(() => {
                translationResult.textContent = "All data files have been loaded!";
                pronunciationCheckbox.removeAttribute("disabled");
                displayWords();
            })
            .catch((error) => {
                translationResult.textContent = "Error loading data files: " + error;
            });
    }

    // Function to filter and display words based on the "enable" attribute and pronunciation.
    function displayWords() {
        const enableFilter = pronunciationCheckbox.checked;
        let result = "";
        alphabet.forEach((letter) => {
            if (jsonData[letter]) {
                jsonData[letter].words.forEach((word) => {
                    if (!enableFilter || (enableFilter && word.enable)) {
                        let wordHtml = `<p><strong>Spanish:</strong> ${word.spanish}, <strong>English:</strong> ${word.english}`;
                        
                        if (word.pronunciations) {
                            word.pronunciations.forEach((pronunciation) => {
                                const pronunciationClass = pronunciation.type === "low" ? "low-pronunciation" : "high-pronunciation";
                                wordHtml += ` <span class="${pronunciationClass}">${pronunciation.part}</span>`;
                            });
                        }
                        
                        wordHtml += "</p>";
                        result += wordHtml;
                    }
                });
            }
        });
        translationResult.innerHTML = result;
    }

    // Event listener for the enable filter checkbox.
    pronunciationCheckbox.addEventListener("change", displayWords);

    // Start loading JSON files when the page loads.
    loadAllJSONFiles();
});
