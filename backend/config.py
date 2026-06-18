import os

# Database Connection Configuration for MySQL
# You can customize these credentials to match your local MySQL Server settings.
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "Varun_0801")  # Change to your MySQL password
DB_NAME = os.environ.get("DB_NAME", "expense_tracker")
DB_PORT = int(os.environ.get("DB_PORT", 3306))

# Session and security configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "super_secret_amazon_expense_tracker_key")

# Development/Production flags
DEBUG = True
