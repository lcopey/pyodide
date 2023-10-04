import dash_bootstrap_components as dbc
from dash import (
    Input,
    Output,
    State,
    html,
)
from app import Pyodide, clientside_python_callback


app = Pyodide(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
)

label = html.Label(id="label", children="0")
add_button = dbc.Button(id="add", children="Add")
substract_button = dbc.Button(id="substract", children="Substract")
app.layout = html.Div(
    [
        html.H1("My pyodide app"),
        label,
        dbc.Row([dbc.Col(add_button), dbc.Col(substract_button)]),
    ]
)


@clientside_python_callback(
    Output(label, "children", allow_duplicate=True),
    Input(add_button, "n_clicks"),
    State(label, "children"),
    prevent_initial_call="initial_duplicate",
)
def python_add(n_clicks, label):
    if not n_clicks:
        return 1
    return int(label) + 1


@clientside_python_callback(
    Output(label, "children"),
    Input(substract_button, "n_clicks"),
    State(label, "children"),
)
def python_substract(n_clicks, label):
    if not n_clicks:
        return 1
    return int(label) - 1


DEBUG = False

if __name__ == "__main__":
    app.run(debug=DEBUG)
