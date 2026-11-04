#!/usr/bin/env python3
"""Reuse the shared Studio + main-app workspace."""
import runpy
from pathlib import Path

runpy.run_path(str(Path(__file__).resolve().parent.parent / "Wave_Breathing_Assets/launch.py"), run_name="__main__")
