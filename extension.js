// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
const { workerData } = require('worker_threads');
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
							// get the index of selection
							let index = response.data.findIndex(function(topic){
								return topic.title === selection;
							});
							// get problems of the index
							let problems = response.data[index].problems;
							// show quickpick of problems
							vscode.window.showQuickPick(problems, {
								placeHolder: 'Select a problem'
							}).then(function(problemSelection){
								// make get request to the problem
								axios.get('https://workat.tech/api/ps/' + problemSelection)
									.then(function(response){
										// create a webview with response.content
										const problemView = vscode.window.createWebviewPanel('workat', response.data.name, vscode.ViewColumn.One, {
											enableScripts: true,
											retainContextWhenHidden: true
										});

										problemView.webview.html = response.data.content;

										problemView.webview.html += `
											<div style="text-align: left;">
												<button style="width: 100px; padding: 10px; font-size: 20px;">Code Now</button>
											</div>
										`;


									})
									.catch(function(error){
										console.log(error);
										// show error message
										vscode.window.showErrorMessage('Error fetching the question');
									});
							});
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
