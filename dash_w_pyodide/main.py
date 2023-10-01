import inspect
import re
from pathlib import Path
from dash import Dash
from dash import callback, Input, State, Output, clientside_callback, dcc, html, ClientsideFunction
import dash_bootstrap_components as dbc


def relative_path(file_path):
    return str(Path(__file__).parent / file_path)


def read_template():
    path = relative_path('template.html')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    return content


app = Dash(__name__,
           index_string=read_template(),
           external_stylesheets=[dbc.themes.BOOTSTRAP])

label = html.Label(id='label', children='0')
add_button = dbc.Button(id='add', children='Add')
substract_button = dbc.Button(id='substract', children='Substract')
app.layout = html.Div(
    [
        html.H1('My pyodide app'),
        label,
        dbc.Row([dbc.Col(add_button), dbc.Col(substract_button)])
    ]
)


def python_callback(*args):
    def wrapper(func):
        function_code = inspect.getsource(func)
        match = re.match(r'(?:@.*\(.*?\)\n)(def.*)',
                         function_code, flags=re.DOTALL)
        function_code = f'`{match.group(1)}`'
        js_code = f"""function(...args){{
            console.log('python_callback');
            worker.postMessage(
                {{
                    type: 'code',
                    code: {function_code},
                    function_name: '{func.__name__}',
                    args: args
                }});
        }}"""
        clientside_callback(js_code, *args)

        return func
    return wrapper

# clientside_callback(
#     """
#     function(n_clicks, label) {
#         if (n_clicks) {
#             const newLabel = Number(label) + 1;
#             worker.postMessage(newLabel);
#             return newLabel;
#         }
#         return 0
#     }
#     """,
#     Output(label, 'children'),
#     Input(add_button, 'n_clicks'),
#     State(label, 'children')
# )


@python_callback(
    Output(label, 'children'),
    Input(add_button, 'n_clicks'),
    State(label, 'children')
)
def test_python_client_side(n_clicks, label):
    if n_clicks and label:
        return int(label) + 1
    return 0


DEBUG = True

if __name__ == '__main__':
    app.run(debug=DEBUG)
