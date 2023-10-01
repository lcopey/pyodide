if (typeof importScripts === 'function') {
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js");

  function compile() {
    console.log('compile');
    let code = self.callbacks_code.join('\n');
    self.pyodide.FS.writeFile('./script.py', code, { encoding: "utf-8" });
    self.pkg = self.pyodide.pyimport('script');
  }

  function setLoadingStatus(content) {
    self.postMessage({ type: 'loading', content: content });
  }

  async function initialize() {
    self.callbacks_code = [];
    self.pkg = null;
    setLoadingStatus('Loading pyodide');
    self.pyodide = await loadPyodide();
    setLoadingStatus('Loading pandas');
    await self.pyodide.loadPackage("pandas");
    setLoadingStatus('done');
    compile();
  }

  initialize();

  self.onmessage = (event) => {

    if (event.data.type == 'code') {
      const function_name = event.data.function_name;
      if (!self.pyodide || !(function_name in self.callbacks_code)) {
        self.callbacks_code.push(event.data.code);
      }
      if (self.pyodide && self.pkg) {
        const result = self.pkg[function_name](...event.data.args);
        self.postMessage({ type: 'result', content: result });
      }
    }
  }
}