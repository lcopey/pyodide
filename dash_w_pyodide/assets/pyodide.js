function set_status_msg(msg) {
    let msg_status = document.getElementById('pyodide_status').getElementsByTagName('p')[0];
    msg_status.innerText = msg;
}

function remove_status_div() {
    const status_div = document.getElementById('pyodide_status');
    status_div.remove();
}

function add_status_div() {
    let status_div = document.createElement('div');
    status_div.setAttribute('id', 'pyodide_status');
    status_div.setAttribute('class', 'lds-ring');

    msg_p = document.createElement('p')
    status_div.append(msg_p);
    for (let i = 0; i < 4; i++) {
        status_div.append(document.createElement('div'));
    }

    document.body.append(status_div);
}

async function initPyodide() {
    add_status_div();
    set_status_msg('Loading pyodide');
    let pyodide = await loadPyodide();

    // set_status_msg('Loading packages')
    // await pyodide.loadPackage(["pandas"]);
    // window.pyodide = pyodide;

    // set_status_msg('Importing packages')
    // await pyodide.runPython('import pandas as pd')
    // window.pyodide_ready = true;
    // set_status_msg('All done')
    // remove_status_div();
    // add_status_div();
    // set_status_msg('Loading pyodide');
}
initPyodide();