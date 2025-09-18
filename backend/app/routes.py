from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Post, Like, User, Comment
from datetime import datetime

main_bp = Blueprint('main', __name__)

# ... [keep all existing routes] ...
@main_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        content = data.get('content')
        
        if not content or len(content.strip()) == 0:
            return jsonify({'error': 'Content cannot be empty'}), 400
        
        post = Post(content=content.strip(), user_id=user_id)
        db.session.add(post)
        db.session.commit()
        
        return jsonify({
            'message': 'Post created successfully',
            'post': {
                'id': post.id,
                'content': post.content,
                'created_at': post.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@main_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    try:
        user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        
        if post.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({'message': 'Post deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

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
        post = Post.query.get_or_404(post_id)
        
        # Get top-level comments (no parent)
        top_level_comments = Comment.query.filter_by(
            post_id=post_id, 
            parent_id=None
        ).order_by(Comment.created_at.asc()).all()
        
        # Include nested replies
        include_replies = request.args.get('include_replies', 'true').lower() == 'true'
        comments_data = [comment.to_dict(include_replies=include_replies) for comment in top_level_comments]
        
        return jsonify({
            'comments': comments_data,
            'total_comments': Comment.query.filter_by(post_id=post_id).count(),
            'total_top_level_comments': len(top_level_comments)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

# Update the get_posts route to include comment count
@main_bp.route('/posts', methods=['GET'])
def get_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        posts = Post.query.order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        posts_data = []
        for post in posts.items:
            # Calculate total comments including replies
            total_comments = Comment.query.filter_by(post_id=post.id).count()
            
            posts_data.append({
                'id': post.id,
                'content': post.content,
                'created_at': post.created_at.isoformat(),
                'author': {
                    'id': post.author.id,
                    'username': post.author.username
                },
                'likes_count': len(post.likes),
                'comments_count': total_comments,  # Total comments including replies
                'top_level_comments_count': len(post.comments.filter_by(parent_id=None).all()),
                'user_has_liked': False
            })
        
        return jsonify({
            'posts': posts_data,
            'total_pages': posts.pages,
            'current_page': page,
            'total_posts': posts.total
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    