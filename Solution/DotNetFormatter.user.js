// ==UserScript==
// @name LeetCode/AlgoExpert C# Code Formatter
// @namespace http://tampermonkey.net/
// @version 2025-07-05
// @description Format C# code for LeetCode and AlgoExpert using a local API and enables Alt+Shift+F shortcut
// @author Oleksandr Kushnir
// @match https://leetcode.com/problems/*
// @match https://www.algoexpert.io/questions/*
// @grant none
// ==/UserScript==

(function() {
    'use strict';

    const API_URL = 'http://127.0.0.1:5000/format';

    async function formatCode(codeToFormat) {
        var response = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(codeToFormat),
        });

        const formattedCode = await response.text();

        const monaco = getMonacoEditor();

        if(monaco && monaco.executeEdits && monaco.getModel){
            const model = monaco.getModel();
            if (model) {
                monaco.executeEdits('format-code', [{
                    range:  model.getFullModelRange(),
                    text: formattedCode
                }]);

                showNotification('Code formatted successfully');
            }
        }
        else{
            document.execCommand('selectAll');
            document.execCommand('insertText', false, formattedCode.replace(/\r\n/g, '\n'));

            showNotification('Code formatted successfully');
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        `;
        document.body.appendChild(notification);
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        // Fade out and remove after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    function getMonacoEditor() {
        if (window.monaco && window.monaco.editor) {
            const editors = window.monaco.editor.getEditors();
            if (editors.length > 0) {
                return editors[0];
            }
        }
        return null;
    }

    document.addEventListener('keydown', async (event) => {
        if (event.altKey && event.shiftKey && (event.key === 'f' || event.key === 'F')) {
            event.preventDefault();

            const lines = Array.from(document.activeElement.querySelectorAll('.cm-line'));
            const codeToFormat = lines.map(line => line.textContent).join('\r\n');

            await formatCode(codeToFormat);
        }
    });

    const observer = new MutationObserver((mutationsList, obs) => {
        const monaco = getMonacoEditor();
        if (monaco) {
            monaco.addCommand(window.monaco.KeyMod.Alt | window.monaco.KeyMod.Shift | window.monaco.KeyCode.KeyF, async () => await formatCode(monaco.getValue()));
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();