import pymysql
import pymysql.cursors
import config

def get_db_connection():
  """
  Establishes and returns a connection to the configured MySQL database.
  Returns DictCursor so query results are returned as dictionaries.
  """
  return pymysql.connect(
      host=config.DB_HOST,
      user=config.DB_USER,
      password=config.DB_PASSWORD,
      database=config.DB_NAME,
      port=config.DB_PORT,
      cursorclass=pymysql.cursors.DictCursor,
      autocommit=True
  )

def init_db():
  """
  Initializes the MySQL database.
  1. Connects to MySQL server.
  2. Creates the database if it does not exist.
  3. Executes the schema.sql file to create the tables if they don't exist.
  """
  # Connect without specifying a database to ensure we can create it if it doesn't exist
  conn = pymysql.connect(
      host=config.DB_HOST,
      user=config.DB_USER,
      password=config.DB_PASSWORD,
      port=config.DB_PORT,
      autocommit=True
  )
  
  try:
    with conn.cursor() as cursor:
      # Create database if it doesn't exist
      cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{config.DB_NAME}`")
      print(f"Database `{config.DB_NAME}` verified/created.")
      
      # Select the database
      cursor.execute(f"USE `{config.DB_NAME}`")
      
      # Read and execute schema.sql
      import os
      current_dir = os.path.dirname(os.path.abspath(__file__))
      schema_path = os.path.join(current_dir, "schema.sql")
      with open(schema_path, "r") as f:
        schema_sql = f.read()
      
      # Split by semicolon to execute separate statements (simple parser)
      statements = schema_sql.split(";")
      for stmt in statements:
        stmt_cleaned = stmt.strip()
        if stmt_cleaned:
          cursor.execute(stmt_cleaned)
      
      # Migration: Check if 'type' column exists in categories, and add it if not
      try:
        cursor.execute("SHOW COLUMNS FROM categories LIKE 'type'")
        if not cursor.fetchone():
          cursor.execute("ALTER TABLE categories ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'both'")
          print("Migrated categories table: added 'type' column.")
      except Exception as migration_error:
        print(f"Migration check error: {migration_error}")

      # Migration: Check if recurrence columns exist in transactions, and add them if not
      try:
        cursor.execute("SHOW COLUMNS FROM transactions LIKE 'recurrence_interval'")
        if not cursor.fetchone():
          cursor.execute("ALTER TABLE transactions ADD COLUMN recurrence_interval VARCHAR(20) NULL")
          print("Migrated transactions table: added 'recurrence_interval' column.")
        
        cursor.execute("SHOW COLUMNS FROM transactions LIKE 'parent_recurring_id'")
        if not cursor.fetchone():
          cursor.execute("ALTER TABLE transactions ADD COLUMN parent_recurring_id INT NULL, ADD FOREIGN KEY (parent_recurring_id) REFERENCES transactions(id) ON DELETE SET NULL")
          print("Migrated transactions table: added 'parent_recurring_id' column.")
      except Exception as migration_error:
        print(f"Migration check error for transactions: {migration_error}")

      print("Database tables verified/created successfully.")
  except Exception as e:
    print(f"Error initializing MySQL Database: {e}")
  finally:
    conn.close()
