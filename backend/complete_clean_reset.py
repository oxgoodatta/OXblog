# complete_clean_reset.py
import os
import shutil
from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("🧹 COMPLETE CLEAN RESET...")
    
    # Step 1: Remove migrations folder completely
    if os.path.exists('migrations'):
        shutil.rmtree('migrations')
        print("✅ Removed migrations folder")
    
    # Step 2: Clear alembic_version table if it exists
    try:
        db.session.execute(text("DROP TABLE IF EXISTS alembic_version"))
        db.session.commit()
        print("✅ Cleared alembic_version table")
    except:
        print("ℹ️ No alembic_version table to clear")
    
    # Step 3: Create Follow table manually (since we need it)
    try:
        create_sql = text("""
        CREATE TABLE IF NOT EXISTS follow (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (follower_id) REFERENCES user (id),
            FOREIGN KEY (following_id) REFERENCES user (id),
            UNIQUE (follower_id, following_id)
        )
        """)
        db.session.execute(create_sql)
        db.session.commit()
        print("✅ Follow table created")
    except Exception as e:
        print(f"ℹ️ Follow table may already exist: {e}")
    
    print("🎉 Clean reset complete!")
    print("💡 Now run: flask db init && flask db migrate && flask db upgrade")