// if (typeof importScripts === 'function') {
importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js");

function setLoadingStatus(content) {
	self.postMessage({ type: 'loading', content: content });
}

async function loadPyodideAndPackages() {
	setLoadingStatus('Loading pyodide');
	self.pyodide = await loadPyodide();

	setLoadingStatus('Loading dependencies');
	await self.pyodide.loadPackage(["pandas"]);

	setLoadingStatus('Loading application');
	// load application, probably in script.py
	let response = await fetch('./script.py');
	let code = await response.text();
	self.pyodide.FS.writeFile('./script.py', code, { encoding: "utf-8" });
	self.pkg = self.pyodide.pyimport('script');
	
	setLoadingStatus("done");
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
	if (event.data.type === 'code') {
		// make sure loading is done
		await pyodideReadyPromise;
		const { id, python, ...context } = event.data.content;
		// The worker copies the context in its own "memory" (an object mapping name to values)
		// why ???
		for (const key of Object.keys(context)) {
			self[key] = context[key];
		}
		// Now is the easy part, the one that is similar to working in the main thread:
		try {
			await self.pyodide.loadPackagesFromImports(python);
			let results = await self.pyodide.runPythonAsync(python);
			self.postMessage({ type: 'code', content: { results, id } });

		} catch (error) {
			self.postMessage({ type: 'code', content: { error: error.message, id } });
		}
	}
	else if (event.data.type === 'function') {
		await pyodideReadyPromise;
		const { id, function_name, ...context } = event.data.content;
		try {
			let results = self.pkg[function_name](...context)
			self.postMessage({ type: 'code', content: { results, id } });
		} catch (error) {
			self.postMessage({ type: 'code', content: { error: error.message, id } });
		}
	}
};
// function compile() {
//   console.log('compile');
//   let code = self.callbacks_code.join('\n');
//   self.pyodide.FS.writeFile('./script.py', code, { encoding: "utf-8" });
//   self.pkg = self.pyodide.pyimport('script');
// }

// self.onmessage = (event) => {

//   if (event.data.type == 'code') {
//     const function_name = event.data.function_name;
//     if (!self.pyodide || !(function_name in self.callbacks_code)) {
//       self.callbacks_code.push(event.data.code);
//     }
//     if (self.pyodide && self.pkg) {
//       const result = self.pkg[function_name](...event.data.args);
//       self.postMessage({ type: 'result', function_name: function_name, content: result });
//     }
//   }
// }
// }