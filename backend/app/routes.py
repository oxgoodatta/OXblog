from flask import Blueprint, request, jsonify, current_app, send_from_directory  # Added send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Post, Like, User, Comment, PostMedia
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename
from mimetypes import guess_type


main_bp = Blueprint('main', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def get_file_type(filename):
    ext = filename.rsplit('.', 1)[1].lower()
    if ext in current_app.config['ALLOWED_IMAGE_EXTENSIONS']:
        return 'image' if ext != 'gif' else 'gif'
    elif ext in current_app.config['ALLOWED_VIDEO_EXTENSIONS']:
        return 'video'
    return 'unknown'

@main_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    try:
        user_id = get_jwt_identity()
        
        # Check if it's form data (with files) or JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            content = request.form.get('content', '')
            files = request.files.getlist('media')
        else:
            data = request.get_json()
            content = data.get('content', '')
            files = []
        
        if not content and not files:
            return jsonify({'error': 'Post must contain content or media'}), 400
        
        # Create post
        post = Post(content=content.strip() if content else '', user_id=user_id)
        db.session.add(post)
        db.session.flush()  # Get the post ID
        
        # Handle file uploads
        uploaded_media = []
        for file in files:
            if file and allowed_file(file.filename):
                # Generate unique filename
                file_ext = file.filename.rsplit('.', 1)[1].lower()
                unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
                filename = secure_filename(unique_filename)
                
                # Save file
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                
                # Create media record
                media = PostMedia(
                    filename=filename,
                    file_type=get_file_type(file.filename),
                    post_id=post.id
                )
                db.session.add(media)
                uploaded_media.append({
                    'id': media.id,
                    'filename': media.filename,
                    'file_type': media.file_type,
                    'url': f"/api/uploads/{media.filename}"
                })
        
        db.session.commit()

        author = post.author
        
        return jsonify({
            'message': 'Post created successfully',
            'post': {
                'id': post.id,
                'content': post.content,
                'created_at': post.created_at.isoformat(),
                'author': {
                    'id': author.id,
                    'username': author.username
                },
                'media': uploaded_media
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@main_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    try:
        user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        
        if post.user_id != int(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({'message': 'Post deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# Add route to serve uploaded files
@main_bp.route('/uploads/<filename>')
def get_uploaded_file(filename):
    try:
        # Get the correct MIME type for the file
        mimetype = guess_type(filename)[0]
        
        response = send_from_directory(
            current_app.config['UPLOAD_FOLDER'], 
            filename,
            mimetype=mimetype
        )
        
        # Add CORS headers for video files
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        
        return response
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

    

@main_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    try:
        user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        
        # Check if already liked
        existing_like = Like.query.filter_by(user_id=user_id, post_id=post_id).first()
        if existing_like:
            db.session.delete(existing_like)
            db.session.commit()
            return jsonify({'message': 'Post unliked', 'liked': False}), 200
        
        # Add new like
        like = Like(user_id=user_id, post_id=post_id)
        db.session.add(like)
        db.session.commit()
        
        return jsonify({'message': 'Post liked', 'liked': True}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/users/<username>', methods=['GET'])
def get_user_profile(username):
    try:
        user = User.query.filter_by(username=username).first_or_404()
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at.isoformat(),
            'total_posts': len(user.posts)
        }
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# Update the get_post_comments route to support threading
@main_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_post_comments(post_id):
    try:
        # Check if post exists
        post = Post.query.get_or_404(post_id)
        
        # Get ALL comments for this post
        all_comments = Comment.query.filter_by(post_id=post_id)\
            .order_by(Comment.created_at.asc())\
            .all()
        
        # Convert to dictionary - use simple to_dict without replies
        comments_data = []
        for comment in all_comments:
            try:
                comment_dict = comment.to_dict()
                comments_data.append(comment_dict)
            except Exception as e:
                print(f"Error converting comment {comment.id} to dict: {e}")
                # Add basic comment data even if conversion fails
                comments_data.append({
                    'id': comment.id,
                    'content': comment.content,
                    'created_at': comment.created_at.isoformat(),
                    'user_id': comment.user_id,
                    'post_id': comment.post_id,
                    'parent_id': comment.parent_id,
                    'author': {'username': 'Unknown'}
                })
        
        return jsonify({
            'comments': comments_data,
            'total_comments': len(all_comments),
            'total_top_level_comments': len([c for c in all_comments if c.parent_id is None])
        }), 200
        
    except Exception as e:
        print(f"Error in get_post_comments: {e}")
        return jsonify({'error': 'Failed to fetch comments'}), 500

# New route: Get replies for a specific comment
@main_bp.route('/comments/<int:comment_id>/replies', methods=['GET'])
def get_comment_replies(comment_id):
    try:
        comment = Comment.query.get_or_404(comment_id)
        
        replies = Comment.query.filter_by(parent_id=comment_id).order_by(Comment.created_at.asc()).all()
        replies_data = [reply.to_dict() for reply in replies]
        
        return jsonify({
            'replies': replies_data,
            'total_replies': len(replies_data),
            'parent_comment': {
                'id': comment.id,
                'content': comment.content,
                'author': comment.author.username
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update create_comment to support replies
@main_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        content = data.get('content')
        parent_id = data.get('parent_id')  # For replies to comments
        
        # Check if post exists
        post = Post.query.get_or_404(post_id)
        
        if not content or len(content.strip()) == 0:
            return jsonify({'error': 'Comment content cannot be empty'}), 400
        
        # If this is a reply, check if parent comment exists and belongs to same post
        if parent_id:
            parent_comment = Comment.query.get(parent_id)
            if not parent_comment or parent_comment.post_id != post_id:
                return jsonify({'error': 'Invalid parent comment'}), 400
        
        comment = Comment(
            content=content.strip(),
            user_id=user_id,
            post_id=post_id,
            parent_id=parent_id
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({
            'message': 'Comment created successfully',
            'comment': comment.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# New route: Get comment thread (comment + all its replies recursively)
@main_bp.route('/comments/<int:comment_id>/thread', methods=['GET'])
def get_comment_thread(comment_id):
    try:
        comment = Comment.query.get_or_404(comment_id)
        
        # Get the entire thread (this comment + all nested replies)
        thread_data = comment.to_dict(include_replies=True)
        
        return jsonify({
            'thread': thread_data,
            'total_messages': 1 + comment.get_reply_count()  # This comment + all replies
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update the get_posts route to include media
@main_bp.route('/posts', methods=['GET'])
@jwt_required(optional=True)
def get_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get current user ID if authenticated
        current_user_id = get_jwt_identity()
        
        posts = Post.query.order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        posts_data = []
        for post in posts.items:
            total_comments = Comment.query.filter_by(post_id=post.id).count()
            top_level_comments_count = Comment.query.filter_by(post_id=post.id, parent_id=None).count()
            
            # Check if current user has liked this post
            user_has_liked = False
            if current_user_id:
                user_has_liked = Like.query.filter_by(
                    user_id=current_user_id, 
                    post_id=post.id
                ).first() is not None
            
            # Get media for post
            media_data = []
            for media in post.media:
                media_data.append({
                    'id': media.id,
                    'filename': media.filename,
                    'file_type': media.file_type,
                    'url': f"/api/uploads/{media.filename}"
                })
            
            posts_data.append({
                'id': post.id,
                'content': post.content,
                'created_at': post.created_at.isoformat(),
                'author': {
                    'id': post.author.id,
                    'username': post.author.username
                },
                'likes_count': len(post.likes),
                'comments_count': total_comments,
                'top_level_comments_count': top_level_comments_count,
                'is_liked': user_has_liked,
                'media': media_data
            })
        
        return jsonify({
            'posts': posts_data,
            'total_pages': posts.pages,
            'current_page': page,
            'total_posts': posts.total
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# ==========================
# Update Comment
# ==========================
@main_bp.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    comment = Comment.query.get_or_404(comment_id)

    # Only the owner can update
    if comment.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    comment.content = data.get('content', comment.content)
    db.session.commit()

    return jsonify({"message": "Comment updated successfully"}), 200


# ==========================
# Delete Comment
# ==========================
@main_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = get_jwt_identity()
    comment = Comment.query.get_or_404(comment_id)

    # Only the owner can delete
    if comment.user_id != str(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": "Comment deleted successfully"}), 200

    