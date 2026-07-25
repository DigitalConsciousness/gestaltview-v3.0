#!/usr/bin/env python3
"""Compatibility wrapper for the GestaltView runtime crawler."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name("gestaltview_crawler.py")), run_name="__main__")
