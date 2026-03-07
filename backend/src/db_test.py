"""
Database introspection utility - lists all tables, fields, and values
"""
import os
import json
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect
from sqlalchemy.sql import text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/karmafit_db")

def truncate_text(text, max_length=50):
    """Truncate long text for display"""
    if text is None:
        return "NULL"
    text_str = str(text)
    if len(text_str) > max_length:
        return text_str[:max_length] + "..."
    return text_str

def format_value(value, col_name):
    """Format value for display, handling JSON and long text"""
    if value is None:
        return "NULL"
    
    # Handle JSON columns
    if isinstance(value, dict):
        return json.dumps(value, indent=2)[:200] + "..." if len(json.dumps(value)) > 200 else json.dumps(value, indent=2)
    
    # Truncate very long text fields
    if col_name in ['resume_text'] and isinstance(value, str):
        return truncate_text(value, 100)
    
    return truncate_text(str(value), 80)

try:
    engine = create_engine(DATABASE_URL)
    
    # Test connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
    
    print("✅ Database connection successful!\n")
    
    # Get inspector
    inspector = inspect(engine)
    
    # Get all table names
    table_names = inspector.get_table_names()
    
    if not table_names:
        print("⚠️  No tables found in the database.")
    else:
        print(f"📊 Database Tables ({len(table_names)}):\n")
        print("=" * 80)
        
        for table_name in sorted(table_names):
            print(f"\n📋 Table: {table_name}")
            print("-" * 80)
            
            # Get columns for this table
            columns = inspector.get_columns(table_name)
            
            if columns:
                print(f"{'Column Name':<25} {'Type':<20} {'Nullable':<10} {'Default':<15}")
                print("-" * 80)
                
                for col in columns:
                    col_name = col['name']
                    col_type = str(col['type'])
                    col_nullable = "YES" if col['nullable'] else "NO"
                    col_default = str(col['default']) if col['default'] is not None else "-"
                    
                    print(f"{col_name:<25} {col_type:<20} {col_nullable:<10} {col_default:<15}")
            
            # Get primary keys
            pk_constraint = inspector.get_pk_constraint(table_name)
            if pk_constraint and pk_constraint['constrained_columns']:
                print(f"\n🔑 Primary Keys: {', '.join(pk_constraint['constrained_columns'])}")
            
            # Get indexes
            indexes = inspector.get_indexes(table_name)
            if indexes:
                print(f"📑 Indexes:")
                for idx in indexes:
                    print(f"   - {idx['name']}: {', '.join(idx['column_names'])}")
            
            # Query actual data from the table
            print(f"\n📊 Data (showing all rows):")
            print("-" * 80)
            
            try:
                with engine.connect() as conn:
                    result = conn.execute(text(f"SELECT * FROM {table_name}"))
                    rows = result.fetchall()
                    
                    if not rows:
                        print("   (No data)")
                    else:
                        col_names = [col['name'] for col in columns]
                        
                        # Print row count
                        print(f"   Total rows: {len(rows)}\n")
                        
                        # Print each row
                        for idx, row in enumerate(rows, 1):
                            print(f"   Row {idx}:")
                            for col_name, value in zip(col_names, row):
                                formatted_value = format_value(value, col_name)
                                print(f"      {col_name}: {formatted_value}")
                            print()
            except Exception as e:
                print(f"   ⚠️  Error reading data: {e}")
            
            print()
        
        print("=" * 80)
        print(f"\n✅ Total tables: {len(table_names)}")

except Exception as e:
    print(f"❌ Database connection failed:")
    print(f"   Error: {e}")
    print(f"\n💡 Ensure:")
    print(f"   1. PostgreSQL is running (docker-compose up -d)")
    print(f"   2. DATABASE_URL is set in .env")
    print(f"   3. Database exists: {DATABASE_URL}")