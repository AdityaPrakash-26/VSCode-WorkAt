// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
const fs = require('fs');
// const workAtChannel = require('src/workAtChannel.js');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// new command to get problems from workat
	let getProblems = vscode.commands.registerCommand('vscode-workat.getProblems', function () {
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
									.then(async function(response){
										var language;
										// choose language before showing the problem
										await vscode.window.showQuickPick(['C++', 'Java', 'Python'], {
											placeHolder: 'Choose a language'
										}).then(function(languageSelection){
											if(languageSelection == 'C++'){
												language = 'cpp';
												// if practice folder does not exist
												if(!fs.existsSync(vscode.workspace.rootPath + '/practice')){
													// create practice folder
													fs.mkdirSync(vscode.workspace.rootPath + '/practice');
												}

												// create and save the file
												fs.writeFile(vscode.workspace.rootPath + '/practice/' + problemSelection + '.cpp', response.data.languages[1235].defaultCode, function(err){
													if(err){
														console.log(err);
													}
												});
												// open the file in view column one
												vscode.workspace.openTextDocument(vscode.Uri.file(vscode.workspace.rootPath + '/practice/' + problemSelection + '.cpp')).then(doc => {
													vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
												});
											}
											else if(languageSelection == 'Java'){
												language = 'java';
												if(!fs.existsSync(vscode.workspace.rootPath + '/practice')){
													// create practice folder
													fs.mkdirSync(vscode.workspace.rootPath + '/practice');
												}

												// create and save the file
												fs.writeFile(vscode.workspace.rootPath + '/practice/' + problemSelection + '.java', response.data.languages[1311].defaultCode, function(err){
													if(err){
														console.log(err);
													}
												});
												// open the file in view column one
												vscode.workspace.openTextDocument(vscode.Uri.file(vscode.workspace.rootPath + '/practice/' + problemSelection + '.java')).then(doc => {
													vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
												});
											}
											else if(languageSelection == 'Python'){
												language = 'python';
												if(!fs.existsSync(vscode.workspace.rootPath + '/practice')){
													// create practice folder
													fs.mkdirSync(vscode.workspace.rootPath + '/practice');
												}

												// create and save the file
												fs.writeFile(vscode.workspace.rootPath + '/practice/' + problemSelection + '.py', response.data.languages[1421].defaultCode, function(err){
													if(err){
														console.log(err);
													}
												});
												// open the file in view column one
												vscode.workspace.openTextDocument(vscode.Uri.file(vscode.workspace.rootPath + '/practice/' + problemSelection + '.py')).then(doc => {
													vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
												});
											}
										});

										// create a webview with response.content
										const problemView = vscode.window.createWebviewPanel('workat', response.data.name, vscode.ViewColumn.Two, {
											enableScripts: true,
											retainContextWhenHidden: true
										});

										problemView.webview.html = response.data.content;

										// button code

										problemView.webview.html += `
											<div style="text-align: left;">
												<a href='https://workat.tech/problem-solving/practice/${problemSelection}' id="submit">
													<button style="width: 100px; padding: 10px; font-size: 20px;" onclick="copy()">Submit</button>
												</a>
											</div>
											<p> 
												<b>Note:</b> Submitting via VS Code is currently not possible due to security concerns. After clicking the button, 
												you will be redirected to the problem page, and the code you have written will be copied to your clipboard 
												automatically. You can paste it into the editor and submit it.
											</p>
											<script>
											(function() {
												const vscode = acquireVsCodeApi();
												const button = document.getElementById('submit');
												button.addEventListener('click', function() {
													vscode.postMessage({
														command: 'copy',
														text: 'HELLO WORLD'
													});
												});
											})();
											</script>
										`;

										// add onclick event to copy button
										problemView.webview.onDidReceiveMessage(async message => {
											if(message.command === 'copy'){
												if(language === 'cpp'){
													await fs.readFile(vscode.workspace.rootPath + '/practice/' + problemSelection + '.cpp', 'utf8', function(err, contents){
														if(err){
															console.log(err);
														}
														else{
															vscode.env.clipboard.writeText(contents);
														}
													});
												}
												else if(language === 'java'){
													await fs.readFile(vscode.workspace.rootPath + '/practice/' + problemSelection + '.java', 'utf8', function(err, contents){
														if(err){
															console.log(err);
														}
														else{
															vscode.env.clipboard.writeText(contents);
														}
													});
												}
												else if(language === 'python'){
													await fs.readFile(vscode.workspace.rootPath + '/practice/' + problemSelection + '.py', 'utf8', function(err, contents){
														if(err){
															console.log(err);
														}
														else{
															vscode.env.clipboard.writeText(contents);
														}
													});
												}
											}
										});
										
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

	context.subscriptions.push(getProblems);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
