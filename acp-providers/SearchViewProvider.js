const vscode = require('vscode');

class SearchViewProvider {
    constructor(context, clipboardProvider) {
        this.context = context;
        this.clipboardProvider = clipboardProvider;
    }

    /**
     * Resolve the WebviewView for the Search Copied Items webview.
     * @param {WebviewView} webviewView The WebviewView to resolve.
     */
    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Search Copied Items</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 10px; }
                    input { width: 100%; padding: 8px; margin-bottom: 10px; color:black; }
                    ul { list-style: none; padding: 0; }
                    li { margin: 5px 0; padding: 5px; background: #f0f0f0; border-radius: 4px; color:black; }
                </style>
            </head>
            <body>
                <input id="searchBox" type="text" placeholder="Search copied items..." />
                <ul id="results"></ul>
                <script>
                    const vscode = acquireVsCodeApi();

                    document.getElementById('searchBox').addEventListener('input', (e) => {
                        vscode.postMessage({ command: 'search', query: e.target.value });
                    });

                    window.addEventListener('message', (event) => {
                        const items = event.data.items || [];
                        const results = document.getElementById('results');
                        results.innerHTML = '';
                        items.forEach(item => {
                            const li = document.createElement('li');
                            li.textContent = item;
                            results.appendChild(li);
                        });
                    });
                </script>
            </body>
            </html>
        `;

        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'search') {
                const filteredItems = this.clipboardProvider.items
                    .map(item => item.tooltip)
                    .filter(text => text.toLowerCase().includes(message.query.toLowerCase()));

                webviewView.webview.postMessage({ items: filteredItems });
            }
        });
    }
}

module.exports = SearchViewProvider;