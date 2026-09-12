"""Quick-start: python start.py"""
import subprocess, sys, os

if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8001"])
