# clear_alembic.py
from app import create_app, db

app = create_app()

with app.app_context():
    print("🔄 Clearing alembic version...")
    
    try:
        # Drop the alembic_version table
        db.session.execute("DROP TABLE IF EXISTS alembic_version")
        db.session.commit()
        print("✅ Cleared alembic_version table")
    except Exception as e:
        print(f"Error: {e}")
        db.session.rollback()

    print("✅ Now run: flask db migrate -m 'Add Follow model'")