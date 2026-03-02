## How to run
uv sync  
uv pip uninstall torch  
uv pip install torch --index-url https://download.pytorch.org/whl/cu121  
uv pip install torchvision --index-url https://download.pytorch.org/whl/cu121  
uv run --no-sync python main.py  

## Troubleshooting
change poppler path in helper_funcs.py line 28