// ==UserScript==
// @name LeetCode C# Code Formatter
// @namespace http://tampermonkey.net/
// @version 2025-07-05
// @description Adds a button to format C# code on LeetCode using a local API and enables Alt+Shift+F shortcut
// @author Oleksandr Kushnir
// @match https://leetcode.com/problems/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=leetcode.com
// @grant none
// ==/UserScript==

(function() {
    'use strict';
    const API_URL = 'http://127.0.0.1:5000/FormatCode';
    let buttonAdded = false;

    function findMonacoEditor() {
        if (typeof window.monaco !== 'undefined' && window.monaco.editor) {
            const editors = window.monaco.editor.getEditors();
            if (editors.length > 0) {
                return editors[0];
            }
        }
        return null;
    }

    function updateMonacoEditor(editor, formattedCode) {
        try {
            if (editor.executeEdits && editor.getModel) {
                const model = editor.getModel();
                if (model) {
                    const fullRange = model.getFullModelRange();
                    editor.executeEdits('format-code', [{
                        range: fullRange,
                        text: formattedCode
                    }]);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error updating Monaco editor:', error);
            return false;
        }
    }

    async function formatCode() {
        const editor = findMonacoEditor();

        if (!editor) {
            showNotification('Code editor not found. Please ensure the code editor is visible and loaded.', 'error');
            return;
        }

        const codeToFormat = editor.getValue();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(codeToFormat),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${response.statusText || 'Unknown Status'} - ${errorText}`);
            }

            const formattedCode = await response.text();

            try {
                let updateSuccess = false;
                if (!editor.isCodeMirror && !editor.isTextarea) { // Assuming Monaco editor based on your previous code
                    updateSuccess = updateMonacoEditor(editor, formattedCode);
                }

                if (!updateSuccess) {
                    // Fallback for other editors or if updateMonacoEditor fails
                    editor.setValue(formattedCode);
                }

                showNotification('Code formatted successfully!', 'success');
            } catch (error) {
                showNotification('Code formatted, but could not update editor. Please copy the formatted code manually.', 'error');
            }

        } catch (error) {
            showNotification(`Error formatting code: ${error.message}. Check your local API server and CORS settings.`, 'error');
        }
    }

    function getNotificationContainer() {
        const region = document.querySelector('div[role="region"][aria-label="Notifications (F8)"]');
        if (!region) {
            console.error('LeetCode notification region not found. Notifications might not display correctly.');
            return null;
        }

        let container = region.querySelector('ol.z-message.pointer-events-none');
        if (!container) {
            console.error('LeetCode notification container (ol) not found. Attempting to create it.');
            container = document.createElement('ol');
            container.className = 'z-message pointer-events-none fixed left-0 top-0 flex max-h-screen w-full flex-col-reverse items-center gap-4 p-4';
            container.setAttribute('tabindex', '-1');

            const firstSpan = region.querySelector('span[aria-hidden="true"]');
            if (firstSpan) {
                firstSpan.after(container);
            } else {
                region.appendChild(container);
            }
        }
        return container;
    }

    const ICONS = {
        success: '<path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>',
        error: '<path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L289.9 256l47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L256 289.9l-47 47c-9.4-9.4-9.4-24.6 0-33.9z"></path>',
    };

    function getIconSVG(type) {
        const path = ICONS[type] || ICONS.error;
        let colorClass = 'text-sd-text-primary';
        switch (type) {
            case 'success': colorClass = 'text-sd-success'; break;
            case 'error': colorClass = 'text-sd-danger'; break;
        }
        return `<svg aria-hidden="true" focusable="false" class="svg-inline--fa fa-circle-check h-4 w-4 ${colorClass} mt-0.5 self-start mt-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${path}</svg>`;
    }

    function showNotification(message, type = 'success') {
        const container = getNotificationContainer();

        if (!container) {
            console.error('Failed to find or create notification container. Cannot display message.');
            return;
        }

        const listItem = document.createElement('li');
        listItem.role = 'status';
        listItem.ariaLive = 'off';
        listItem.ariaAtomic = 'true';
        listItem.tabIndex = 0;
        listItem.dataset.state = 'open';
        listItem.dataset.swipeDirection = 'up';
        listItem.dataset.radixCollectionItem = '';

        listItem.className = `group sd-sm:max-w-[600px] max-w-full pointer-events-auto relative flex items-center justify-between gap-2 bg-sd-popover text-sd-foreground overflow-hidden rounded-sd-md border border-sd-border py-1.5 px-4 shadow-md transition data-[swipe=cancel]:translate-y-0 data-[swipe=end]:translate-y-[var(--radix-toast-swipe-end-y)] data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-top-24 data-[state=open]:slide-in-from-top-24 last:mt-[48px]`;

        listItem.innerHTML = `
            ${getIconSVG(type)}
            <div class="grid gap-1">
                <div class="text-sm opacity-90">
                    <div class="inline">${message}</div>
                </div>
            </div>
            <button class="flex h-7 w-7 items-center justify-center rounded-sd-md p-1 opacity-70 transition-opacity hover:bg-sd-background hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-sd-ring disabled:pointer-events-none" aria-label="Close">
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark" class="svg-inline--fa fa-xmark h-4 w-4 text-sd-muted-foreground" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path></svg>
            </button>
        `;

        container.prepend(listItem);

        const closeAndRemove = () => {
            if (listItem.parentNode) {
                listItem.dataset.state = 'closed';
                listItem.addEventListener('animationend', function handler() {
                    listItem.remove();
                    listItem.removeEventListener('animationend', handler);
                }, { once: true });
            }
        };

        const closeButton = listItem.querySelector('button[aria-label="Close"]');
        if (closeButton) {
            closeButton.addEventListener('click', closeAndRemove);
        }

        setTimeout(closeAndRemove, 2000);
    }

    function isCSharpSelected() {
        // Find the button that displays the currently selected language
        // This button has type="button", aria-haspopup="dialog", and is within a div with class "h-full"
        const languageDisplayButton = document.querySelector('div.h-full > button[type="button"][aria-haspopup="dialog"]');

        if (languageDisplayButton) {
            // The language text is directly inside this button's text content,
            // or in a child div with class "text-sm"
            const languageTextElement = languageDisplayButton.querySelector('div.text-sm');
            const languageText = languageTextElement ? languageTextElement.textContent.trim() : languageDisplayButton.textContent.trim();
            return languageText === 'C#';
        }

        // Fallback for when the dialog is open and the active language has the checkmark
        const activeCSharpOption = document.querySelector('div.group.flex.min-w-\\[140px\\].cursor-pointer.items-center.justify-between.rounded-\\[4px\\] .text-sm');
        if (activeCSharpOption && activeCSharpOption.textContent.trim() === 'C#') {
            const checkmarkSvg = activeCSharpOption.previousElementSibling;
            if (checkmarkSvg && checkmarkSvg.classList.contains('visible')) {
                return true;
            }
        }

        return false;
    }

    function addFormatButton() {
        const buttonContainer = document.querySelector('div.flex.h-full.items-center.gap-1');
        const isCsSelected = isCSharpSelected();

        if (buttonContainer) {
            const existingButton = document.getElementById('formatCodeButton');

            if (isCsSelected && !existingButton) {
                // Add button if C# is selected and button doesn't exist
                const formatButton = document.createElement('button');
                formatButton.id = 'formatCodeButton';
                formatButton.className = 'relative inline-flex gap-2 items-center justify-center font-medium cursor-pointer focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors bg-transparent enabled:hover:bg-fill-secondary enabled:active:bg-fill-primary text-caption rounded text-text-primary aspect-1 group ml-auto h-full p-1';
                formatButton.setAttribute('data-state', 'closed');
                formatButton.title = 'Format C# Code [Alt]+[Shift]+[F]';
                formatButton.innerHTML = `
                   <div class="relative text-[14px] leading-[normal] p-[1px] before:block before:h-3.5 before:w-3.5 text-sd-muted-foreground">
                       <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="align-left" class="svg-inline--fa fa-align-left absolute left-1/2 top-1/2 h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em]" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                             <path fill="currentColor" d="M24 40C10.7 40 0 50.7 0 64S10.7 88 24 88H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H24zm0 128c-13.3 0-24 10.7-24 24s10.7 24 24 24H424c13.3 0 24-10.7 24-24s-10.7-24-24-24H24zM0 320c0 13.3 10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H24c-13.3 0-24 10.7-24 24zM24 424c-13.3 0-24 10.7-24 24s10.7 24 24 24H424c13.3 0 24-10.7 24-24s-10.7-24-24-24H24z">
                             </path>
                       </svg>
                   </div>
                `;
                formatButton.addEventListener('click', formatCode);
                buttonContainer.prepend(formatButton);
                buttonAdded = true;
            } else if (!isCsSelected && existingButton) {
                // Remove button if C# is not selected and button exists
                existingButton.remove();
                buttonAdded = false;
            }
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.altKey && event.shiftKey && (event.key === 'f' || event.key === 'F') && isCSharpSelected()) {
            event.preventDefault();
            formatCode();
        }
    });

    const observer = new MutationObserver((mutationsList, obs) => {
        addFormatButton();

        const editor = findMonacoEditor();

        if (editor && isCSharpSelected()) {
            editor.addCommand(window.monaco.KeyMod.Alt | window.monaco.KeyMod.Shift | window.monaco.KeyCode.KeyF, () => formatCode());
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();