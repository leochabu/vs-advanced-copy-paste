const vscode = require('vscode');

function registerCommands(context, clipboardProvider, settings) {
    
    /* Refresh List */
    context.subscriptions.push(vscode.commands.registerCommand('acp-view.refresh', () => {
        clipboardProvider.refresh();
    }));


    /* Paste Item */
    context.subscriptions.push(vscode.commands.registerCommand('acp-view.pasteItem', (item) => {
        if (item && item.label) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const settings = vscode.workspace.getConfiguration('advancedCopyPaste');
                let lineEnding = settings.get('LineEnding');
    
                if (lineEnding) {
                    lineEnding = lineEnding.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
                } else {
                    lineEnding = '';
                }
    
                editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, item.tooltip+lineEnding);
                });
            }
        }
    }));


    /* Copy Selection */
    context.subscriptions.push(vscode.commands.registerCommand('acp-view.copySelection', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.document.getText(editor.selection);
            if (selection) {
                clipboardProvider.addItem(selection);
                vscode.window.showInformationMessage(`Copied: "${selection.split('\n')[0]}"`);
            } else {
                vscode.window.showWarningMessage('No selection found. Cannot copy.');
            }
        } else {
            vscode.window.showWarningMessage('No editor active. Cannot copy selection.');
        }
    }));


    /* Paste All */
    context.subscriptions.push(vscode.commands.registerCommand('acp-view.pasteAll', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const allText = clipboardProvider.items.map(item => item.tooltip).join('\n');
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, allText);
            });
            vscode.window.showInformationMessage('All items pasted!');
        } else {
            vscode.window.showWarningMessage('No editor active. Cannot paste items.');
        }
    }));


    /* Remove Item */
    context.subscriptions.push(vscode.commands.registerCommand('acp-view.removeItem', (item) => {
        const index = clipboardProvider.items.indexOf(item);
        if (index > -1) {
            clipboardProvider.items.splice(index, 1);
            clipboardProvider.refresh();
            vscode.window.showInformationMessage(`Item "${item.label}" removed from the list.`);
        } else {
            vscode.window.showWarningMessage('Item not found.');
        }
    }));


    /* Clear All */
    context.subscriptions.push(vscode.commands.registerCommand('acp-view.clearAll', async () => {
        const confirmation = await vscode.window.showWarningMessage(
            'Are you sure you want to clear the clipboard list?',
            { modal: true },
            'Yes', 
            'No' 
        );
    
        if (confirmation === 'Yes') {
            clipboardProvider.items = [];
            clipboardProvider.refresh();
            vscode.window.showInformationMessage('Clipboard list cleared!');
        } else {
            vscode.window.showInformationMessage('Clear action canceled.');
        }
    }));
    

    /* Filter by Text */
    context.subscriptions.push(vscode.commands.registerCommand('acp-view.search', async () => {
        const searchTerm = await vscode.window.showInputBox({
            prompt: 'Enter a term to filter the copied items',
            placeHolder: 'Filter by text...'
        });

        if (searchTerm !== undefined) {
            clipboardProvider.setSearchTerm(searchTerm);
            vscode.window.showInformationMessage(`Filtering by: "${searchTerm}"`);
        }
    }));


    /* Open Webview */
    context.subscriptions.push(vscode.commands.registerCommand('acp-view.openWebview', () => {
        const panel = vscode.window.createWebviewPanel(
            'clipboardList',
            'Copy List',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const htmlContent = clipboardProvider.items
            .map((item, index) => `
                <li>
                    <strong>Item ${index + 1}:</strong>
                    <pre>${item.tooltip}</pre>
                    <button onclick="copyToClipboard('${encodeURIComponent(item.tooltip)}')">Copy</button>
                </li>
            `)
            .join('');

        panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Copy List</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 1em; color: black; }
                    li { margin-bottom: 1em; list-style: none; }
                    pre { background: #f4f4f4; padding: 1em; border-radius: 4px; }
                    button { padding: 0.5em 1em; margin-top: 0.5em; cursor: pointer; }
                </style>
            </head>
            <body>
                <h1>All items</h1>
                <ul>${htmlContent}</ul>
                <script>
                    function copyToClipboard(text) {
                        navigator.clipboard.writeText(decodeURIComponent(text)).then(() => {
                            alert('Copied to clipboard!');
                        }, (err) => {
                            console.error('Error copying to clipboard:', err);
                        });
                    }
                </script>
            </body>
            </html>
        `;
    }));


    /* Save to File */
    context.subscriptions.push(
    vscode.commands.registerCommand("acp-view.saveToFile", async () => {
        const visibleItems = clipboardProvider.getChildren(null);

        if (!visibleItems || visibleItems.length === 0) {
        vscode.window.showWarningMessage("The list is empty. Nothing to save.");
        return;
        }

        const uri = await vscode.window.showSaveDialog({
        filters: { "Text Files": ["txt"] },
        defaultUri: vscode.Uri.file("clipboard-list.txt"),
        });

        if (!uri) {
        vscode.window.showInformationMessage("Save operation canceled.");
        return;
        }

        const fileContent = visibleItems
        .map((item) => `${item.tooltip}`)
        .join("\n");

        try {
        await vscode.workspace.fs.writeFile(
            uri,
            Buffer.from(fileContent, "utf8")
        );
        vscode.window.showInformationMessage(`List saved to: ${uri.fsPath}`);
        } catch (error) {
        vscode.window.showErrorMessage(`Failed to save file: ${error.message}`);
        }
    })
    );

    

    /* Configuration Commands */
    context.subscriptions.push(
        vscode.commands.registerCommand('acp-config-entry.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:acp.advanced-copy-paste');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('advancedCopyPaste.toggleAutoClear', async () => {
            const newValue = await settings.toggle('autoClear');
            vscode.window.showInformationMessage(`Auto Clear is now ${newValue ? 'enabled' : 'disabled'}`);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('advancedCopyPaste.setMaxClipboardItems', async () => {
            const input = await vscode.window.showInputBox({
                prompt: 'Set the maximum number of clipboard items',
                value: `${settings.get('maxClipboardItems')}`
            });

            if (input && !isNaN(input)) {
                await settings.update('maxClipboardItems', parseInt(input, 10));
                vscode.window.showInformationMessage(`Max Clipboard Items set to ${input}`);
            } else {
                vscode.window.showErrorMessage('Invalid input. Please enter a valid number.');
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('advancedCopyPaste.setLineEnding', async () => {
            const input = await vscode.window.showInputBox({
                prompt: 'Set the line ending',
                value: `${settings.get('LineEnding')}`
            });

            if (input && input.length) {
                await settings.update('LineEnding', input);
                vscode.window.showInformationMessage(`Line Ending set to "${input}"`);
            }
        })
    );
}

module.exports = { registerCommands };