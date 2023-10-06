document.addEventListener("DOMContentLoaded", function () {
    const translationResult = document.getElementById("translationResult");
    const pronunciationCheckbox = document.getElementById("pronunciationCheckbox");
    const searchPhraseInput = document.getElementById("searchPhrase");
    const translateButton = document.getElementById("translateButton");
    const translationResultPhrase = document.getElementById("translationResultPhrase");

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
                translateButton.removeAttribute("disabled");
            })
            .catch((error) => {
                translationResult.textContent = "Error loading data files: " + error;
            });
    }

    // Function to filter and display words based on the "enable" attribute and pronunciation.
    function displayWords(enableFilter) {
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

    // Event listener for the translate button.
    translateButton.addEventListener("click", () => {
        const inputPhrase = searchPhraseInput.value.trim();
        const words = inputPhrase.split(/\s+/); // Split the input phrase into words
        let result = "";

        words.forEach((word) => {
            const translatedWord = translateWord(word.toLowerCase());
            result += `<p>${word}: ${translatedWord}</p>`;
        });

        translationResultPhrase.innerHTML = result;
    });

    // Function to translate a single word.
    function translateWord(word) {
        for (const letter of alphabet) {
            if (jsonData[letter]) {
                const matchingWord = jsonData[letter].words.find((w) => w.spanish === word);
                if (matchingWord && matchingWord.enable) {
                    return matchingWord.english;
                }
            }
        }
        return "Not found";
    }

    // Start loading JSON files when the page loads.
    loadAllJSONFiles();
});
