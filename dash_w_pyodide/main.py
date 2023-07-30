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


TEMPLATE = read_template()
app = Dash(__name__, index_string=TEMPLATE)
app.layout = html.Div()

DEBUG = False

if __name__ == '__main__':
    app.run(debug=DEBUG)
