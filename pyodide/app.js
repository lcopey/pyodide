class App {
    constructor() {
        this.pyodide = null;
        this.loadingStatus = null;
    }

    async init() {
        this.setLoadingStatus('Loading pyodide');
        this.pyodide = await loadPyodide();

        // this.setLoadingStatus('Loading pandas');
        // await this.pyodide.loadPackage("pandas");

        this.setLoadingStatus('Load custom python');
    //     await this.pyodide.runPythonAsync(`
    //     from pyodide.http import pyfetch
    //     response = await pyfetch("main.py")
    //     with open("main.py", "wb") as f:
    //         f.write(await response.bytes())
    //   `)
        let response = await fetch('pkg.zip');
        let buffer = await response.arrayBuffer();
        await this.pyodide.unpackArchive(buffer, 'zip');
        this.pkg = this.pyodide.pyimport('pkg');
        this.setLoadingStatus('Done');
    }

    setLoadingStatus(value) {
        this.loadingStatus = value;
        this.render();
    }

    view() {
        const loading_div = (
            `<div id="message" class="container-fluid bg-primary">
                <span class="loader"></span>
                <p class="text-center">${this.loadingStatus}</p>
            </div>`
        )
        return this.loadingStatus === 'Done' ? this.pkg.render() : loading_div;
    }

    render() {
        let app = document.getElementById("app");
        app.innerHTML = this.view();
    }
}


let app = new App();
app.init();
app.render();