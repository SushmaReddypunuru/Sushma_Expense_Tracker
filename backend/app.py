from flask import Flask, request, jsonify, session
from flask_cors import CORS
from decimal import Decimal
import config
from db import init_db, get_db_connection
from helpers import hash_password, login_required, get_filtered_transactions_sql, process_recurring_transactions

app = Flask(__name__)
app.secret_key = config.SECRET_KEY

# Configure session cookies to support cross-site local requests (React at 5173, Flask at 5000)
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=False, # Set to True in HTTPS production environments
    SESSION_COOKIE_HTTPONLY=True
)

# Enable CORS allowing React client with session credentials (cookies)
CORS(
    app,
    supports_credentials=True,
    resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}
)

# Initialize MySQL tables on startup
init_db()

# --- AUTHENTICATION ROUTES ---

@app.route('/api/auth/signup', methods=['POST'])
def signup():
  """
  Registers a new user, hashes password using SHA-256 + unique salt,
  initializes standard categories for the user, and initiates session.
  """
  data = request.get_json() or {}
  username = data.get('username', '').strip()
  password = data.get('password', '')
  
  if not username or not password:
    return jsonify({"error": "Username and password are required."}), 400
  if len(password) < 6:
    return jsonify({"error": "Password must be at least 6 characters long."}), 400

  conn = get_db_connection()
  try:
    with conn.cursor() as cursor:
      # Check if username exists
      cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
      if cursor.fetchone():
        return jsonify({"error": "Username is already taken."}), 400
      
      # Hash password using SHA-256 with a unique salt
      pwd_hash, pwd_salt = hash_password(password)
      
      # Insert new user record
      cursor.execute(
          "INSERT INTO users (username, password_hash, password_salt) VALUES (%s, %s, %s)",
          (username, pwd_hash, pwd_salt)
      )
      user_id = cursor.lastrowid
      
      # Insert default starter categories with their color-coding and types
      default_categories = [
          ('Salary', 0.00, '#4cafaa', 'income'),
          ('Food', 8000.00, '#febd69', 'expense'),
          ('Utilities', 4000.00, '#146eb4', 'expense'),
          ('Entertainment', 2000.00, '#ff9900', 'expense')
      ]
      
      cursor.executemany(
          "INSERT INTO categories (user_id, name, budget, color, type) VALUES (%s, %s, %s, %s, %s)",
          [(user_id, name, budget, color, cat_type) for name, budget, color, cat_type in default_categories]
      )
      
      # Log user in by setting the session variable
      session['user_id'] = user_id
      session['username'] = username
      
      return jsonify({
          "message": "Registration successful.",
          "user": {"id": user_id, "username": username}
      }), 201
  finally:
    conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
  """
  Authenticates user credentials against SHA-256 hash and initiates session.
  """
  data = request.get_json() or {}
  username = data.get('username', '').strip()
  password = data.get('password', '')
  
  if not username or not password:
    return jsonify({"error": "Username and password are required."}), 400
    
  conn = get_db_connection()
  try:
    with conn.cursor() as cursor:
      # Retrieve user details by username
      cursor.execute("SELECT id, username, password_hash, password_salt FROM users WHERE username = %s", (username,))
      user = cursor.fetchone()
      
      if not user:
        return jsonify({"error": "Invalid username or password."}), 401
      
      # Verify password using stored user salt
      computed_hash, _ = hash_password(password, salt=user['password_salt'])
      if computed_hash != user['password_hash']:
        return jsonify({"error": "Invalid username or password."}), 401
        
      # Set session values
      session['user_id'] = user['id']
      session['username'] = user['username']
      
      return jsonify({
          "message": "Login successful.",
          "user": {"id": user['id'], "username": user['username']}
      }), 200
  finally:
    conn.close()

@app.route('/api/auth/logout', methods=['POST'])
def logout():
  """
  Clears session variables.
  """
  session.clear()
  return jsonify({"message": "Logged out successfully."}), 200

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
  """
  Retrieves profile information for the currently logged-in session.
  """
  if 'user_id' in session:
    return jsonify({
        "user": {"id": session['user_id'], "username": session['username']}
    }), 200
  return jsonify({"user": None}), 200


# --- TRANSACTIONS RESOURCE ROUTES ---

@app.route('/api/transactions', methods=['GET'])
@login_required
def get_transactions():
  """
  Retrieves transactions using raw SQL filtering logic processed in helpers.py.
  Parameters: search, type, category, start_date, end_date, sort_by.
  """
  user_id = session['user_id']
  
  # Process recurring items before loading
  process_recurring_transactions(user_id)

  search = request.args.get('search', '').strip()
  tx_type = request.args.get('type', 'all')
  category = request.args.get('category', 'all')
  start_date = request.args.get('start_date', '')
  end_date = request.args.get('end_date', '')
  sort_by = request.args.get('sort_by', 'date-desc')
  
  tx_list = get_filtered_transactions_sql(user_id, search, tx_type, category, start_date, end_date, sort_by)
  return jsonify(tx_list), 200

@app.route('/api/transactions', methods=['POST'])
@login_required
def add_transaction():
  """
  Adds a new transaction record for the active session.
  """
  user_id = session['user_id']
  data = request.get_json() or {}
  
  amount = data.get('amount')
  tx_date = data.get('date')
  category = data.get('category', '').strip()
  description = data.get('description', '').strip()
  tx_type = data.get('type', 'expense')
  recurring = bool(data.get('recurring', False))
  recurrence_interval = data.get('recurrence_interval', '').strip().lower() if data.get('recurrence_interval') else None
  tags = data.get('tags', '').strip() # comma-separated string
  
  if amount is None or not tx_date or not category:
    return jsonify({"error": "Amount, date, and category are required fields."}), 400
    
  if recurring:
    if recurrence_interval not in ['daily', 'weekly', 'monthly']:
      recurrence_interval = 'monthly'
  else:
    recurrence_interval = None

  try:
    amount = float(amount)
    if amount <= 0:
      return jsonify({"error": "Amount must be greater than 0."}), 400
  except ValueError:
    return jsonify({"error": "Amount must be a numeric value."}), 400

  conn = get_db_connection()
  try:
    with conn.cursor() as cursor:
      # Write raw INSERT statement
      cursor.execute(
          "INSERT INTO transactions (user_id, amount, date, category, description, type, recurring, recurrence_interval, tags) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
          (user_id, amount, tx_date, category, description, tx_type, recurring, recurrence_interval, tags)
      )
      tx_id = cursor.lastrowid
      
      return jsonify({
          "message": "Transaction added successfully.",
          "transaction": {
              "id": tx_id,
              "amount": amount,
              "date": tx_date,
              "category": category,
              "description": description,
              "type": tx_type,
              "recurring": recurring,
              "recurrence_interval": recurrence_interval,
              "tags": tags
          }
      }), 201
  finally:
    conn.close()

@app.route('/api/transactions/<int:tx_id>', methods=['PUT'])
@login_required
def edit_transaction(tx_id):
  """
  Updates an existing transaction record matching the current user session.
  """
  user_id = session['user_id']
  data = request.get_json() or {}
  
  amount = data.get('amount')
  tx_date = data.get('date')
  category = data.get('category', '').strip()
  description = data.get('description', '').strip()
  tx_type = data.get('type', 'expense')
  recurring = bool(data.get('recurring', False))
  tags = data.get('tags', '').strip()
  
  if amount is None or not tx_date or not category:
    return jsonify({"error": "Amount, date, and category are required fields."}), 400
    
  try:
    amount = float(amount)
    if amount <= 0:
      return jsonify({"error": "Amount must be greater than 0."}), 400
  except ValueError:
    return jsonify({"error": "Amount must be a numeric value."}), 400

  conn = get_db_connection()
  try:
    with conn.cursor() as cursor:
      cursor.execute(
          "UPDATE transactions SET amount = %s, date = %s, category = %s, description = %s, type = %s, recurring = %s, tags = %s WHERE id = %s AND user_id = %s",
          (amount, tx_date, category, description, tx_type, recurring, tags, tx_id, user_id)
      )
      if cursor.rowcount == 0:
        return jsonify({"error": "Transaction not found or unauthorized."}), 404
      return jsonify({"message": "Transaction updated successfully."}), 200
  finally:
    conn.close()

@app.route('/api/transactions/<int:tx_id>', methods=['DELETE'])
@login_required
def delete_transaction(tx_id):
  """
  Deletes an existing transaction record.
  """
  user_id = session['user_id']
  conn = get_db_connection()
  try:
    with conn.cursor() as cursor:
      cursor.execute("DELETE FROM transactions WHERE id = %s AND user_id = %s", (tx_id, user_id))
      if cursor.rowcount == 0:
        return jsonify({"error": "Transaction not found or unauthorized."}), 404
      return jsonify({"message": "Transaction deleted successfully."}), 200
  finally:
    conn.close()


# --- CATEGORIES RESOURCE ROUTES ---

@app.route('/api/categories', methods=['GET'])
@login_required
def get_categories():
  """
  Retrieves all budget categories and color properties for the logged-in session.
  """
  user_id = session['user_id']
  conn = get_db_connection()
  try:
    with conn.cursor() as cursor:
      cursor.execute("SELECT id, name, budget, color, type FROM categories WHERE user_id = %s", (user_id,))
      cats = cursor.fetchall()
      for c in cats:
        c['budget'] = float(c['budget'])
      return jsonify(cats), 200
  finally:
    conn.close()

@app.route('/api/categories', methods=['POST'])
@login_required
def add_category():
  """
  Adds a new category name with optional budget, hex color, and type properties.
  """
  user_id = session['user_id']
  data = request.get_json() or {}
  name = data.get('name', '').strip()
  budget = data.get('budget', 0.00)
  color = data.get('color', '#febd69').strip()
  cat_type = data.get('type', 'expense').strip().lower()
  
  if not name:
    return jsonify({"error": "Category name is required."}), 400
  if cat_type not in ['income', 'expense', 'both']:
    cat_type = 'expense'
    
  try:
    budget = float(budget)
  except ValueError:
    return jsonify({"error": "Budget must be a number."}), 400

  conn = get_db_connection()
  try:
    with conn.cursor() as cursor:
      # Avoid duplicates
      cursor.execute("SELECT id FROM categories WHERE user_id = %s AND name = %s", (user_id, name))
      if cursor.fetchone():
        return jsonify({"error": "Category already exists."}), 400
        
      cursor.execute(
          "INSERT INTO categories (user_id, name, budget, color, type) VALUES (%s, %s, %s, %s, %s)",
          (user_id, name, budget, color, cat_type)
      )
      return jsonify({"message": "Category added successfully."}), 201
  finally:
    conn.close()

@app.route('/api/categories', methods=['PUT'])
@login_required
def update_category():
  """
  Updates budget limit, color formatting, or type of a category.
  """
  user_id = session['user_id']
  data = request.get_json() or {}
  name = data.get('name', '').strip()
  budget = data.get('budget')
  color = data.get('color', '').strip()
  cat_type = data.get('type', '').strip().lower()
  
  if not name:
    return jsonify({"error": "Category name is required."}), 400
    
  conn = get_db_connection()
  try:
    with conn.cursor() as cursor:
      # Fetch existing record
      cursor.execute("SELECT budget, color, type FROM categories WHERE user_id = %s AND name = %s", (user_id, name))
      cat = cursor.fetchone()
      if not cat:
        return jsonify({"error": "Category not found."}), 404
        
      new_budget = float(budget) if budget is not None else float(cat['budget'])
      new_color = color if color else cat['color']
      new_type = cat_type if cat_type in ['income', 'expense', 'both'] else cat['type']
      
      cursor.execute(
          "UPDATE categories SET budget = %s, color = %s, type = %s WHERE user_id = %s AND name = %s",
          (new_budget, new_color, new_type, user_id, name)
      )
      return jsonify({"message": "Category updated successfully."}), 200
  finally:
    conn.close()

@app.route('/api/categories/<string:name>', methods=['DELETE'])
@login_required
def delete_category(name):
  """
  Deletes an existing category.
  """
  user_id = session['user_id']
  conn = get_db_connection()
  try:
    with conn.cursor() as cursor:
      cursor.execute("DELETE FROM categories WHERE user_id = %s AND name = %s", (user_id, name))
      if cursor.rowcount == 0:
        return jsonify({"error": "Category not found or unauthorized."}), 404
      return jsonify({"message": "Category deleted successfully."}), 200
  finally:
    conn.close()

# Run the Flask app on localhost, port 5000
if __name__ == '__main__':
  app.run(host='127.0.0.1', port=5000, debug=config.DEBUG)
