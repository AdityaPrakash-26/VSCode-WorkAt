// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
// const workAtChannel = require('src/workAtChannel.js');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-workat" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-workat.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from VSCode-Workat!');
	});

	// new command to get problems from workat
	let disposable2 = vscode.commands.registerCommand('vscode-workat.getProblems', function () {
		try{
			// show quickpick
			vscode.window.showQuickPick(['Topics', 'Companies', 'Lists'], {
				placeHolder: 'Select a list to get problems from workat'
			}).then(function(selection){
				// make a get request to https://workat.tech/api/ps/{selection}
				axios.get('https://workat.tech/api/ps/' + selection)
					.then(function(response){
						// add all response.title to quickpick
						let topics = response.data.map(function(topic){
							return topic.title;
						}
						);
						vscode.window.showQuickPick(topics, {
							placeHolder: 'Select a topic to get problems'
						}).then(function(selection){
							console.log(selection);
						});
					})
					.catch(function (error) {
						console.log(error);
					});
			});
		} catch (e) {
			// create a new output channel
			const workAtChannel = vscode.window.createOutputChannel('workAt');
			// log the error into the output channel
			workAtChannel.appendLine(e.message);
			// prompt to open the output channel
			vscode.window.showInformationMessage('Initialization failed. Please open the output channel for more details.');
		}
	})

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
