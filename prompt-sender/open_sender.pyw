from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name("weplus_prompt_sender.py")), run_name="__main__")
