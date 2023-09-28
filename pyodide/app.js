class App {
    constructor() {
        this.pyodide = null;
        this.loadingStatus = null;
    }

    async init() {
        this.setLoadingStatus('Loading pyodide');
        this.pyodide = await loadPyodide();
        this.setLoadingStatus('Loading pandas');
        await this.pyodide.loadPackage("pandas");
        this.setLoadingStatus('Load custom python');
        await this.pyodide.runPythonAsync(`
        from pyodide.http import pyfetch
        response = await pyfetch("main.py")
        with open("main.py", "wb") as f:
            f.write(await response.bytes())
      `)

        this.setLoadingStatus('Done');
        this.pkg = this.pyodide.pyimport("main");
    }

    setLoadingStatus(value) {
        this.loadingStatus = value;
        this.render();
    }

    view() {
        return (
            `<div id="message" class="container-fluid">
                <p class="text-center">${this.loadingStatus}</p>
            </div>`)
    }

    render() {
        let app = document.getElementById("app");
        app.innerHTML = this.view();
    }
}


let app = new App();
app.init();
app.render();