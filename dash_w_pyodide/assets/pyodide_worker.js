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
	const callback_type = event.data.type;
	if (callback_type === 'code') {
		// make sure loading is done
		await pyodideReadyPromise;
		const { id, python, ...context } = event.data.content;
		// The worker copies the context in its own "memory" (an object mapping name to values)
		for (const key of Object.keys(context)) {
			self[key] = context[key];
		}
		// Now is the easy part, the one that is similar to working in the main thread:
		try {
			await self.pyodide.loadPackagesFromImports(python);
			let results = await self.pyodide.runPythonAsync(python);
			self.postMessage({ type: callback_type, content: { results, id } });

		} catch (error) {
			self.postMessage({ type: callback_type, content: { error: error.message, id } });
		}
	}
	else if (callback_type === 'function') {
		await pyodideReadyPromise;
		const { id, function_name, args } = event.data.content;
		try {
			let results = self.pkg[function_name](...args);
			self.postMessage({ type: callback_type, content: { results, id } });
		} catch (error) {
			self.postMessage({ type: callback_type, content: { error: error.message, id } });
		}
	}
};
