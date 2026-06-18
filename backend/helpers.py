import hashlib
import uuid
from functools import wraps
from flask import session, jsonify, request
from db import get_db_connection

def hash_password(password, salt=None):
  """
  Hashes a password with SHA-256 and an optional salt.
  If salt is None, generates a new random 32-character hexadecimal salt.
  Returns a tuple: (password_hash, salt)
  """
  if not salt:
    salt = uuid.uuid4().hex # Generates a random 32-character hex salt
  
  # Concatenate password and salt, then hash using SHA-256
  sha256 = hashlib.sha256()
  sha256.update((password + salt).encode('utf-8'))
  password_hash = sha256.hexdigest()
  
  return password_hash, salt

def login_required(f):
  """
  Decorator to protect API endpoints.
  Ensures the request has a valid active session.
  """
  @wraps(f)
  def decorated_function(*args, **kwargs):
    if 'user_id' not in session:
      return jsonify({"error": "Unauthorized. Please log in."}), 401
    return f(*args, **kwargs)
  return decorated_function

def get_filtered_transactions_sql(user_id, search=None, tx_type=None, category=None, start_date=None, end_date=None, sort_by=None):
  """
  Constructs and executes a raw SQL query to retrieve filtered and sorted transactions for a user.
  Binds parameters safely to prevent SQL injection.
  """
  query = "SELECT id, amount, DATE_FORMAT(date, '%%Y-%%m-%%d') as date, category, description, type, recurring, tags FROM transactions WHERE user_id = %s"
  params = [user_id]
  
  # 1. Filter by keyword search (matching description, tags, or category name)
  if search:
    query += " AND (LOWER(description) LIKE %s OR LOWER(tags) LIKE %s OR LOWER(category) LIKE %s)"
    search_pattern = f"%{search.lower()}%"
    params.extend([search_pattern, search_pattern, search_pattern])
    
  # 2. Filter by Transaction Type (income / expense)
  if tx_type and tx_type != 'all':
    query += " AND type = %s"
    params.append(tx_type)
    
  # 3. Filter by Category Name
  if category and category != 'all':
    query += " AND category = %s"
    params.append(category)
    
  # 4. Filter by Date range
  if start_date:
    query += " AND date >= %s"
    params.append(start_date)
  if end_date:
    query += " AND date <= %s"
    params.append(end_date)
    
  # 5. Apply Sorting
  if sort_by == 'date-desc':
    query += " ORDER BY date DESC, id DESC"
  elif sort_by == 'date-asc':
    query += " ORDER BY date ASC, id ASC"
  elif sort_by == 'amount-desc':
    query += " ORDER BY amount DESC, id DESC"
  elif sort_by == 'amount-asc':
    query += " ORDER BY amount ASC, id ASC"
  else:
    query += " ORDER BY date DESC, id DESC" # Default ordering
    
  # Execute the compiled SQL query
  conn = get_db_connection()
  try:
    with conn.cursor() as cursor:
      cursor.execute(query, params)
      transactions = cursor.fetchall()
      
      # Convert Decimal amounts to float for JSON compatibility
      for t in transactions:
        t['amount'] = float(t['amount'])
        t['recurring'] = bool(t['recurring'])
      return transactions
  finally:
    conn.close()
