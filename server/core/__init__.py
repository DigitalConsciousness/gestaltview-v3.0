# server/core/__init__.py
# GestaltView core sub-package
# Exports: GestaltViewCore, WebSearchRouter, should_search, extract_query

from .brain import GestaltViewCore
from .web_search import WebSearchRouter, should_search, extract_query, ground_message, web_search_config

__all__ = [
    "GestaltViewCore",
    "WebSearchRouter",
    "should_search",
    "extract_query",
    "ground_message",
    "web_search_config",
]
