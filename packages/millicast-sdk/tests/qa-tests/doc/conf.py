# -*- coding: utf-8 -*-
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath("../src"))


def setup(app):
    os.system(
        "sphinx-apidoc --force --no-toc  --implicit-namespaces "
        "--output-dir doc/autogen src/dlbio_commsqa_tests"
    )


# ------------------------------------------------------------------------------
# General Configuration
# ------------------------------------------------------------------------------

# If your documentation needs a minimal Sphinx version, state it here.
needs_sphinx = "1.8"

# Add any Sphinx extension module names here, as strings. They can be extensions
# coming with Sphinx (named 'sphinx.ext.*') or your custom ones.
my_sphinx_ext = [
    "sphinx.ext.autodoc",
    "sphinx.ext.intersphinx",
    "sphinx.ext.coverage",
    "sphinx.ext.ifconfig",
    "sphinx.ext.viewcode",
    # inheritance diagram
    "sphinx.ext.inheritance_diagram",
    "sphinx.ext.graphviz",
    "sphinx.ext.extlinks",
]


extensions = []
extensions.extend(my_sphinx_ext)


# ------------------------------------------------------------------------------
# sphinx.ext.intersphinx
# ------------------------------------------------------------------------------
intersphinx_mapping = {
    "http://docs.python.org/": None,
}

# ------------------------------------------------------------------------------
# sphinx.ext.autodoc
# ------------------------------------------------------------------------------
autodoc_member_order = "groupwise"
autodoc_default_options = {
    "members": None,
    "undoc-members": None,
    "inherited-members": None,
    "show-inheritance": None,
}
autoclass_content = "init"

add_module_names = True

# ------------------------------------------------------------------------------
# 'sphinx.ext.inheritance_diagram',
# ------------------------------------------------------------------------------
inheritance_graph_attrs = dict(rankdir="LR", size='""', fontsize=12, ratio="compress")
inheritance_node_attrs = dict(fontsize=12, style="filled")

# ------------------------------------------------------------------------------
# General information about the project.
# ------------------------------------------------------------------------------

project = os.path.basename(os.path.dirname(os.path.dirname(__file__)))
copyright = f"{datetime.now().year}, Dolby Laboratories Inc."

# There are two options for replacing |today|: either, you set today to some
# non-false value, then it is used:
today_fmt = "%Y-%m-%dT%H:%M %Z"

# ------------------------------------------------------------------------------
# Custom Theme Options
# ------------------------------------------------------------------------------
# The frontpage document.
index_doc = "index"
# The master toctree document.
master_doc = "index"

modindex_common_prefix = ["dlbio_commsqa_tests."]

todo_include_todos = True
include_todos = True
keep_warnings = True

extlinks = {"jira": ("https://jira.dolby.net/jira/browse/%s", "%s")}

# -- Options for HTML output ---------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
html_logo = os.path.join("images", "dolby_logo.png")
html_theme = "alabaster"
html_last_updated_fmt = today_fmt

html_style = "style.css"

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ["_static"]

# Output file base name for HTML help builder.
htmlhelp_basename = project + "_doc"
