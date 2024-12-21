const vscode = require('vscode');

class SettingsManager {
    constructor(namespace) {
        this.namespace = namespace;
    }

    /**
     * Get the value of a configuration property.
     * @param {string} key - The key of the property.
     * @returns {*} - The value of the property.
     */
    get(key) {
        const configuration = vscode.workspace.getConfiguration(this.namespace);
        return configuration.get(key);
    }

    /**
     * Update the value of a configuration property.
     * @param {string} key - The key of the property.
     * @param {*} value - The new value.
     * @param {boolean} global - Whether to set the configuration globally or per workspace.
     */
    async update(key, value, global = true) {
        const configuration = vscode.workspace.getConfiguration(this.namespace);
        await configuration.update(key, value, global ? vscode.ConfigurationTarget.Global : vscode.ConfigurationTarget.Workspace);
    }

    /**
     * Toggle a boolean configuration property.
     * @param {string} key - The key of the property.
     */
    async toggle(key) {
        const currentValue = this.get(key);
        await this.update(key, !currentValue);
        return !currentValue;
    }

}

module.exports = SettingsManager;
