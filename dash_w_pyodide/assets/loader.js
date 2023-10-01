function getLoadingStatus(status) {
    if (status !== 'done') {
        return (
            `<div id="message" class="container-fluid">
            <span class="loader"></span>
            <p class="text-center">${status}</p>
        </div>`
        )
    }
}

const worker = new Worker("./assets/pyodide.js");
worker.onmessage = (event) => {
    if (event.data.type == 'loading') {
        let element = document.getElementById("pyodide_status");
        const value = getLoadingStatus(event.data.content);
        if (value) {
            element.innerHTML = value
        }
        else {
            element.remove();
        }
    }
    else if (event.data.type == 'result') {
        console.log(event.data.content);
    }
};