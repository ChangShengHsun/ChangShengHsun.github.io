"""Run the site's unit tests: python run_tests.py"""
import glob
import subprocess
import sys

# Node 22+ no longer accepts a bare directory after --test, so pass the files.
sys.exit(subprocess.call(["node", "--test", *sorted(glob.glob("tests/*.test.js"))]))
