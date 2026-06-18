import os
from dotenv import load_dotenv

# Load configuration variables from .env in the parent directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=dotenv_path)

# Database Connection Configuration for MySQL
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")  # Default to empty if not set
DB_NAME = os.environ.get("DB_NAME", "expense_tracker")
DB_PORT = int(os.environ.get("DB_PORT", 3306))

# Session and security configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "fallback_local_secret_session_key")

# Development/Production flags
DEBUG = True
