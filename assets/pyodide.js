window.dash_clientside = Object.assign({}, window.dash_clientside,
    {
        clientside: {
            pyodide_callback: function (click) {
                if (window.pyodide) {
                    console.log(window.pyodide);
                    let output = pyodide.runPython(
                        `pd.DataFrame([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).to_json()`);
                    return output
                }
            }
        }
    }
)