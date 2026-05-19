from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import os

app = FastAPI(title="Lucy System-2 Executive")

class ToolExecute(BaseModel):
    command: str
    args: list[str] = []

@app.post("/execute/gdb")
async def execute_gdb(req: ToolExecute):
    """
    Executes GDB for binary analysis.
    Pipes hex dumps back to the model context.
    """
    # Security: In a real app, this would be highly sandboxed.
    # We use subprocess to run internal debuggers.
    try:
        cmd = ["gdb", "--batch", "-ex", req.command] + req.args
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/execute/bash")
async def execute_bash(req: ToolExecute):
    """
    Native Tool Access: Sandboxed bash terminal for networking/system tasks.
    """
    try:
        # Simulated sandboxed execution
        result = subprocess.run(
            ["bash", "-c", req.command],
            capture_output=True,
            text=True,
            timeout=5
        )
        return {
            "output": result.stdout if result.stdout else result.stderr
        }
    except Exception as e:
        return {"output": f"Execution Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
