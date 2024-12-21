const vscode = require('vscode');
const ClipboardProvider = require('./acp-providers/ClipboardProvider');
const SearchViewProvider = require('./acp-providers/SearchViewProvider');
const SettingsTreeDataProvider = require('./acp-providers/SettingsProvider');
const SettingsManager = require('./acp-settings/settings');
const { registerCommands } = require('./acp-commands/commands');

function activate(context) {

	const settings = new SettingsManager('advancedCopyPaste');
	const settingsProvider = new SettingsTreeDataProvider(settings);
    vscode.window.registerTreeDataProvider('acp-config-entry', settingsProvider);

    const clipboardProvider = new ClipboardProvider();
    vscode.window.registerTreeDataProvider('acp-view', clipboardProvider);

    vscode.window.registerWebviewViewProvider(
        'acp-search-view',
        new SearchViewProvider(context, clipboardProvider)
    );

    registerCommands(context, clipboardProvider, settings);

    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('advancedCopyPaste.LineEnding')) {
            const settings = vscode.workspace.getConfiguration('advancedCopyPaste');
            const updatedLineEnding = settings.get('LineEnding') || '';
            vscode.window.showInformationMessage(`Line ending updated to: "${updatedLineEnding}"`);
        }
    });
    
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('advancedCopyPaste')) {
            settingsProvider.settings = [
                { label: 'Line Ending', value: vscode.workspace.getConfiguration('advancedCopyPaste').get('LineEnding') || 'Default' },
                { label: 'Max Clipboard Items', value: vscode.workspace.getConfiguration('advancedCopyPaste').get('maxClipboardItems') || 10 },
                { label: 'Auto Clear Clipboard', value: vscode.workspace.getConfiguration('advancedCopyPaste').get('autoClear') ? 'Enabled' : 'Disabled' },
            ];
            //settingsProvider.refresh();
        }
    });    

    clipboardProvider.addItem("Example text\nLine 2\nLine 3");
}


function deactivate() {}

module.exports = { activate, deactivate };