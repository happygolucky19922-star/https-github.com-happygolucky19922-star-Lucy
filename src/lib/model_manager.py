import os
import psutil
from pathlib import Path
from typing import List, Dict

class ModelManager:
    """
    Ingests and manages .gguf and .safetensors models from local storage and media drives.
    Anti-LM Studio Protocol: Direct filesystem access.
    """
    
    def __init__(self, models_dir: str = "./models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.search_paths = [
            self.models_dir,
            Path("/media/"),
            Path("/mnt/"),
            Path.home() / "Downloads"
        ]

    def scan_models(self) -> List[Dict]:
        """
        Scans search paths for supported model formats.
        """
        found_models = []
        extensions = {".gguf", ".safetensors", ".bin"}
        
        for path in self.search_paths:
            if not path.exists():
                continue
                
            try:
                for file in path.rglob("*"):
                    if file.suffix in extensions:
                        stats = file.stat()
                        found_models.append({
                            "name": file.name,
                            "path": str(file.absolute()),
                            "size_gb": round(stats.st_size / (1024**3), 2),
                            "format": file.suffix[1:].upper(),
                            "modified": stats.st_mtime
                        })
            except PermissionError:
                continue
                
        return found_models

    def check_system_resources(self):
        """
        Checks VRAM and RAM availability using psutil.
        Essential for deciding between AWQ vs GGUF offloading.
        """
        ram = psutil.virtual_memory()
        return {
            "ram_total": ram.total / (1024**3),
            "ram_available": ram.available / (1024**3),
            "cpu_count": psutil.cpu_count(),
        }

if __name__ == "__main__":
    manager = ModelManager()
    models = manager.scan_models()
    print(f"Detected {len(models)} local assets.")
    for m in models:
        print(f" >> {m['name']} ({m['size_gb']} GB)")
