to run  
uv pip install torch --index-url https://download.pytorch.org/whl/cu121  
uv run main.py

or  
uv sync  
uv pip uninstall torch  
uv pip install torch --index-url https://download.pytorch.org/whl/cu121  
uv run main.py