# test_file_serving_simple.py
from app import create_app
import os

app = create_app()

with app.app_context():
    print("🔍 Testing file serving...")
    
    upload_folder = app.config['UPLOAD_FOLDER']
    print(f"📁 Upload folder: {upload_folder}")
    
    # Check what files are already in uploads folder
    if os.path.exists(upload_folder):
        files = os.listdir(upload_folder)
        print(f"📄 Files in uploads folder: {files}")
        
        if files:
            test_filename = files[0]  # Use first file found
            test_url = f"http://localhost:5000/api/uploads/{test_filename}"
            print(f"🌐 Test URL: {test_url}")
            print("💡 Open this URL in your browser to check if the file loads")
        else:
            print("❌ No files found in uploads folder")
            print("💡 Upload a file through your React app first")
    else:
        print("❌ Uploads folder doesn't exist")