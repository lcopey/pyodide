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
        const loading_div = (
            `<div id="message" class="container-fluid bg-primary">
                <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                <p class="text-center">${this.loadingStatus}</p>
            </div>`);

        const app_div = (`<div></div>`);

        return this.loadingStatus === 'Done' ? app_div : loading_div;
        // return loading_div;
    }

    render() {
        let app = document.getElementById("app");
        app.innerHTML = this.view();
    }
}


let app = new App();
app.init();
app.render();