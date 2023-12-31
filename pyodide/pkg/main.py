import math
from functools import partial

import js
import js.MaterialUI as mui

import pyodide

# e = js.React.createElement

# helper function


def jsobj(**kwargs):
    return js.Object.fromEntries(pyodide.to_js(kwargs))


def __to_camel_case(snake_str):
    components = snake_str.split("_")
    # We capitalize the first letter of each component except the first one
    # with the 'title' method and join them together.
    return components[0] + "".join(x.title() for x in components[1:])


def pythonify(component):
    """
    Makes a react component feel like you are calling a function
    """

    def aux(self, old_args, old_kwargs, *args, **kwargs):
        kwargs = {__to_camel_case(k): v for k, v in kwargs.items()}
        if old_args is None:
            old_args = []
        if old_kwargs is None:
            old_kwargs = {}

        old_args.extend(args)
        old_kwargs.update(kwargs)

        args = old_args
        kwargs = old_kwargs

        rc = js.React.createElement(component, jsobj(**kwargs), *args)
        rc.update = partial(aux.__get__(rc, rc.__class__), args, kwargs)

        return rc

    return partial(aux, component, None, None)


div = pythonify("div")
p = pythonify("p")
Button = pythonify(mui.Button)


@pythonify
def App(props, children):
    k, set_k = js.React.useState(1)
    n, set_n = js.React.useState(1)
    disabled, set_disabled = js.React.useState(True)

    def handle_disable(n, k):
        set_disabled(k >= n)

    def increase_k(event):
        set_k(k + 1)
        set_disabled(k + 1 >= n)

    def increase_n(event):
        set_n(n + 1)
        set_disabled(k >= n + 1)

    return div(
        p(f"{n} choose {k} = {math.comb(n, k)}"),
        Button("Increase n").update(
            on_click=increase_n, variant="contained", color="secondary"
        ),
        Button(
            on_click=increase_k, variant="contained", disabled=disabled, color="primary"
        ).update("Increase k"),
    )


def render():
    # Create a div to contain our component
    dom_container = js.document.createElement("div")
    js.document.body.appendChild(dom_container)

    js.ReactDOM.render(App(), dom_container)
