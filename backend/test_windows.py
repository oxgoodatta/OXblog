# test_windows.py
from app import create_app, db
import os

def test_windows_setup():
    app = create_app()
    
    with app.app_context():
        print("Testing Windows setup...")
        
        # Check uploads folder
        upload_folder = app.config['UPLOAD_FOLDER']
        print(f"Upload folder: {upload_folder}")
        print(f"Folder exists: {os.path.exists(upload_folder)}")
        
        # Check tables
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Database tables: {tables}")
        
        if 'post_media' in tables:
            print("✅ PostMedia table created successfully!")
        else:
            print("❌ PostMedia table not found!")

if __name__ == '__main__':
    test_windows_setup()