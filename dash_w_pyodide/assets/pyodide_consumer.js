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


const callbacks = { code: {}, function: {} }

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
        const onSuccess = callbacks.code[id];
        delete callbacks.code[id];
        onSuccess(data);
    }
    else if (event.data.type == 'function') {
        const { id, ...data } = event.data.content;
        const onSuccess = callbacks.function[id];
        delete callbacks.function[id];
        onSuccess(data)
    }
};

const asyncRunCode = (() => {
    let id = 0; // identify a Promise
    return (python, context) => {
        // the id could be generated more carefully
        id = (id + 1) % Number.MAX_SAFE_INTEGER;
        return new Promise((onSuccess) => {
            callbacks.code[id] = onSuccess;
            const message = {
                type: 'code',
                content: {
                    ...context,
                    python: python,
                    id,
                }
            };
            worker.postMessage(message);
        });
    };
})();


const asyncRunFunction = (() => {
    let id = 0; // identify a Promise
    return (function_name, context) => {
        // the id could be generated more carefully
        id = (id + 1) % Number.MAX_SAFE_INTEGER;
        return new Promise((onSuccess) => {
            callbacks.function[id] = onSuccess;
            const message = {
                type: 'function',
                content: {
                    args: context,
                    function_name: function_name,
                    id: id,
                }
            };
            worker.postMessage(message);
        });
    };
})();

