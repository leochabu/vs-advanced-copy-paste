const vscode = require('vscode');

class ClipboardProvider {
    constructor() {
        this.items = [];
        this.searchTerm = '';
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    /**
     * Adds a new item to the top of the list. If the item already exists, it is moved to the top.
     * @param {string} text - The text of the item to add.
     */
    addItem(text) {
        const existingIndex = this.items.findIndex(item => item.tooltip === text);
    
        /*Prevent duplicates*/
        if (existingIndex > -1) {
            this.items.splice(existingIndex, 1);
        }
    
        /*Create new item*/
        const newItem = new vscode.TreeItem(
            text.split('\n')[0],
            vscode.TreeItemCollapsibleState.None
        );
    
        /*Set tooltip*/
        newItem.tooltip = text;
    
        /*Set icon before the text*/
        //newItem.iconPath = new vscode.ThemeIcon('arrow-right');
    
        /*Set command*/
        newItem.command = {
            command: 'acp-view.pasteItem',
            title: 'Paste Item',
            arguments: [newItem]
        };
    
        /*Set context value*/
        newItem.contextValue = 'clipboardItem';
    
        /*Add item to the top of the list*/
        this.items.unshift(newItem);
        this.refresh();
    }
    

    
    /**
     * Sets the search term to filter the list of clipboard items.
     * @param {string} term The search term to filter the list with.
     * @fires ClipboardProvider#onDidChangeTreeData
     */
    setSearchTerm(term) {
        this.searchTerm = term.toLowerCase();
        this.refresh();
    }

    /**
     * Fires the onDidChangeTreeData event to let the tree view know that the
     * data has changed and needs to be refreshed.
     */
    refresh() {
        this._onDidChangeTreeData.fire();
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
     * Retrieves the child elements to be displayed in the TreeView.
     * If no parent element is provided, it returns a filtered list of clipboard items
     * based on the current search term.
     * 
     * @param {TreeItem|null} element The parent element for which to retrieve children.
     * @returns {TreeItem[]} An array of TreeItems to display as children.
     */

    getChildren(element) {
        if (!element) {
            return this.items.filter(item => 
                item.tooltip.toLowerCase().includes(this.searchTerm)
            );
        }
        return [];
    }

    /**
     * Retrieves all the items in the clipboard as a plain text array.
     * The text is retrieved from the tooltips of the items in the clipboard.
     * @returns {string[]} An array of plain text strings representing the items in the clipboard.
     */
    getItemsAsText() {
        return this.items.map(item => item.tooltip);
    }
}

module.exports = ClipboardProvider;