from pathlib import Path
from dash import Dash
from dash import callback, Input, State, Output, clientside_callback, dcc, html, ClientsideFunction

def relative_path(file_path):
    return str(Path(__file__).parent / file_path)

def read_template():
    path = relative_path('template.html')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    return content

DEBUG = False

TEMPLATE = read_template()
app = Dash(__name__, index_string=TEMPLATE)

button = html.Button(id='button', n_clicks=0, children='Click')
label = html.Label(id='label', children='')
store = dcc.Store(id='store', data=None)
app.layout = html.Div([button, label, store])


clientside_callback(
    ClientsideFunction(namespace='clientside',
                       function_name='pyodide_callback'),
    Output(store, 'data'),
    Input(button, 'n_clicks'))

clientside_callback(
    """
    function sync(input) {
        console.log(input);
        if (input) {
            return input
        }
    }""",
    Output(label, 'children'),
    Input(store, 'data')
)

if __name__ == '__main__':
    app.run(debug=DEBUG)
