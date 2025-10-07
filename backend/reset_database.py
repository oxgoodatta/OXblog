# reset_database.py
from app import create_app, db
import os

app = create_app()

with app.app_context():
    print("🔄 Resetting database...")
    
    # Drop all tables
    db.drop_all()
    print("✅ All tables dropped")
    
    # Create all tables with new schema
    db.create_all()
    print("✅ All tables created (including PostMedia)")
    
    # Verify tables
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"📊 Tables created: {tables}")
    
    if 'post_media' in tables:
        print("✅ PostMedia table ready for file uploads!")
    else:
        print("❌ PostMedia table missing!")