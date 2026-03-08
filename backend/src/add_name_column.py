"""
Migration script to add the 'name' column to the candidates table
Run this once to fix the schema mismatch
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/karmafit_db")

def add_name_column():
    """Add name column to candidates table if it doesn't exist"""
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='candidates' AND column_name='name'
            """))
            
            if result.fetchone():
                print("✅ Column 'name' already exists in candidates table")
                return
            
            # Add the column
            print("Adding 'name' column to candidates table...")
            conn.execute(text("ALTER TABLE candidates ADD COLUMN name VARCHAR"))
            conn.commit()
            
            # Create index
            print("Creating index on 'name' column...")
            conn.execute(text("CREATE INDEX ix_candidates_name ON candidates(name)"))
            conn.commit()
            
            # Populate existing rows with name from analysis JSON
            print("Populating existing rows with names from analysis JSON...")
            conn.execute(text("""
                UPDATE candidates 
                SET name = analysis->>'name' 
                WHERE analysis IS NOT NULL AND analysis->>'name' IS NOT NULL
            """))
            conn.commit()
            
            print("✅ Migration completed successfully!")
            print("   - Added 'name' column")
            print("   - Created index on 'name'")
            print("   - Populated existing rows from analysis JSON")
            
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    add_name_column()
