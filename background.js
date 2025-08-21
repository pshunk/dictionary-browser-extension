const dictionaryEndpoint = "https://api.dictionaryapi.dev/api/v2/entries/en/";

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        "title": "Define '%s'",
        "contexts": ["selection"],
        "id": "id"
    })
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    chrome.scripting.insertCSS({
        files: ["dictionary.css"],
        target: { tabId: tab.id },
      });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: displayPopup,
        args: [info.selectionText]
    });
});

async function displayPopup(text) {
    popup = document.querySelector('.dictionary-popup');

    let definitionJson = '';

    if (popup === null) {

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            definitionJson = json;
        } catch (error) {
            console.error(error.message);
        }

        let definitionsArray = [];

        definitionJson.forEach(word => {word.meanings.forEach(meaning => {
            meaning.definitions.forEach(definition => {
            definitionsArray.push(definition)
        })})})

        const defintionsHTML = definitionsArray.reduce((accumulator, definition) => accumulator + `<li>${definition.definition}</li>`, '');

        popup = document.createElement('div');
        popup.classList.add('dictionary-popup')
        popup.innerHTML = `
            
                <div class='dictionary'>
                    <div class='word-container'>
                        <button class='close-dictionary-button' type='button'>x</button>
                        <h2 class='word'>${definitionJson[0].word}</h2>
                        <h3 class='phonetic'>${definitionJson[0].phonetic === undefined ? '' : definitionJson[0].phonetic}</h3>
                    </div>
                    <ul class='definitions'>
                        ${defintionsHTML}
                    </ul>
                </div>
                `

        document.body.appendChild(popup);

        const button = document.querySelector('.close-dictionary-button');
        button.addEventListener('click', displayPopup);
    } else {
        document.body.removeChild(popup);
    }
}