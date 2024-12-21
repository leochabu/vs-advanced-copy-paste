const vscode = require('vscode');

class SettingsTreeDataProvider {
    constructor(settings) {
        this.settings = settings;
    }


    /**
     * Given an element, returns the TreeItem to display in the TreeView.
     * @param {TreeItem} element The element to get the TreeItem for.
     * @returns {TreeItem} The TreeItem to display in the TreeView.
     */
    getTreeItem(element) {
        return element;
    }


    /**
     * Returns an array of TreeItems representing the settings available in the settings.json
     * @returns {TreeItem[]} The array of TreeItems to display in the TreeView
     */
    getChildren() {
        return [
            //this.createTreeItem('Auto Clear', 'autoClear'),
            //this.createTreeItem('Max Clipboard Items', 'maxClipboardItems'),
            this.createTreeItem('Line Ending', 'LineEnding'),
        ];
    }


    /**
     * Creates a TreeItem with the given label and key.
     * @param {string} label - The label for the TreeItem.
     * @param {string} key - The key to retrieve the value from settings.
     * @returns {TreeItem} A TreeItem representing the setting with its current value.
     */

    createTreeItem(label, key) {
        const value = this.settings.get(key) ?? 'Not Set';
        const item = new vscode.TreeItem(`${label}: ${value}`, vscode.TreeItemCollapsibleState.None);

        item.tooltip = `Current value of ${label}: ${value}`;

        return item;
    }
}

module.exports = SettingsTreeDataProvider;