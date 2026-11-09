import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'lib'))
from cloud_handler import handler as CloudHandler
class handler(CloudHandler):
 pass
