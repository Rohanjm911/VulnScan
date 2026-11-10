import os
import sys
import time
import socket
import subprocess
import webbrowser

CREATE_NO_WINDOW = 0x08000000

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_port_owners():
    """Ensure ports 8000 and 3000 are clean before launch"""
    try:
        subprocess.call(
            'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :8000 ^| findstr LISTENING\') do taskkill /F /PID %a',
            shell=True,
            creationflags=CREATE_NO_WINDOW,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        subprocess.call(
            'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :3000 ^| findstr LISTENING\') do taskkill /F /PID %a',
            shell=True,
            creationflags=CREATE_NO_WINDOW,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception:
        pass

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Clean existing rogue processes on ports if any
    kill_port_owners()
    time.sleep(0.5)

    # 1. Launch FastAPI Backend silently (No CMD window)
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=backend_dir,
        creationflags=CREATE_NO_WINDOW,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    # 2. Launch Vite Frontend silently (No CMD window)
    frontend_proc = subprocess.Popen(
        "cmd.exe /c npm run dev",
        cwd=frontend_dir,
        creationflags=CREATE_NO_WINDOW,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=True
    )

    # 3. Wait for services to respond (max 20 seconds)
    for _ in range(40):
        if is_port_in_use(3000) and is_port_in_use(8000):
            break
        time.sleep(0.5)

    # 4. Open website in default browser
    webbrowser.open("http://localhost:3000")

    # 5. Monitor backend process
    # When browser tab is closed, frontend sends shutdown beacon / heartbeat expires,
    # causing backend to exit.
    try:
        backend_proc.wait()
    except Exception:
        pass
    finally:
        # Kill frontend process tree & free ports
        try:
            frontend_proc.terminate()
            subprocess.call(f"taskkill /F /T /PID {frontend_proc.pid}", shell=True, creationflags=CREATE_NO_WINDOW, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
        kill_port_owners()

if __name__ == "__main__":
    main()

