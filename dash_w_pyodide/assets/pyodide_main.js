import { asyncRunFunction, asyncRunScript } from "./pyodide_consumer.js";

const script = `
    import statistics
    from js import A_rank
    statistics.stdev(A_rank)
`;

const context = {
    A_rank: [0.8, 0.4, 1.2, 3.7, 2.6, 5.8],
};

async function main() {
    try {
        const { results, error } = await asyncRunScript(script, context);
        if (results) {
            console.log("pyodideWorker return results: ", results);
        } else if (error) {
            console.log("pyodideWorker error: ", error);
        }
        else {
            console.log(results, error);
        }
    } catch (e) {
        console.log(
            `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`,
        );
    }
}

async function main2() {
    const { results, error } = await asyncRunFunction("test_python_client_side", [0, 1]);
    if (results) {
        console.log("pyodideWorker return results: ", results);
    } else if (error) {
        console.log("pyodideWorker error: ", error);
    }
    else {
        console.log(results, error);
    }
}

main();
// main2();