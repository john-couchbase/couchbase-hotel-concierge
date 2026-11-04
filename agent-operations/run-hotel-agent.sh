#!/bin/sh
set -eu
cd YOUR_PROJECT_DIRECTORY
export UV_SYSTEM_CERTS=true
export UV_CACHE_DIR="$PWD/work/uv-cache"
export UV_PYTHON_INSTALL_DIR="$PWD/work/python"
export HF_HOME="$PWD/work/huggingface"
export HF_HUB_DISABLE_XET=1
export HF_HUB_DISABLE_TELEMETRY=1
exec ./work/uv-aarch64-apple-darwin/uv run --offline --python 3.12 --with couchbase --with fastembed --with truststore --with "mcp<2" python work/hotel_agent.py "$@"
