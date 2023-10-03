const worker = new Worker("./assets/pyodide_worker.js");

// worker.onmessage = (event) => {
//     if (event.data.type == 'loading') {
//         let element = document.getElementById("pyodide_status");
//         const value = getLoadingStatus(event.data.content);
//         if (value) {
//             element.innerHTML = value
//         }
//         else {
//             element.remove();
//         }
//     }
//     else if (event.data.type == 'result') {
//         results[event.data.function_name] = event.data.content;
//     }
// };

const callbacks = {};

worker.onmessage = (event) => {
    console.log(event);
    const { id, ...data } = event.data;
    const onSuccess = callbacks[id];
    delete callbacks[id];
    onSuccess(data);
};

const asyncRun = (() => {
    let id = 0; // identify a Promise
    return (script, context) => {
        // the id could be generated more carefully
        id = (id + 1) % Number.MAX_SAFE_INTEGER;
        return new Promise((onSuccess) => {
            callbacks[id] = onSuccess;
            worker.postMessage({
                ...context,
                python: script,
                id,
            });
        });
    };
})();

export { asyncRun };