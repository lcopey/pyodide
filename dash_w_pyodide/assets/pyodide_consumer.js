const worker = new Worker("./assets/pyodide_worker.js");

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


const callbacks = {};

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
    else if (event.data.type == 'code') {
        const { id, ...data } = event.data.content;
        const onSuccess = callbacks[id];
        delete callbacks[id];
        onSuccess(data);
    }
};

const asyncRunScript = (() => {
    let id = 0; // identify a Promise
    return (script, context) => {
        // the id could be generated more carefully
        id = (id + 1) % Number.MAX_SAFE_INTEGER;
        return new Promise((onSuccess) => {
            callbacks[id] = onSuccess;
            const message = {
                type: 'code',
                content: {
                    ...context,
                    python: script,
                    id,
                }
            };
            worker.postMessage(message);
        });
    };
})();



export { asyncRunScript as asyncRun };