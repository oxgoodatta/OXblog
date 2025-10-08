from . import db
from datetime import datetime
import bcrypt
import os
from typing import List, Dict, Any, Optional

class Follow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    following_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('follower_id', 'following_id', name='unique_follow'),)
    
    # Relationships
    follower = db.relationship('User', foreign_keys=[follower_id], backref='following')
    following = db.relationship('User', foreign_keys=[following_id], backref='followers')

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    posts = db.relationship('Post', backref='author', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='author', lazy=True, cascade='all, delete-orphan')
    
    # Add follow methods
    def is_following(self, user):
        return Follow.query.filter_by(follower_id=self.id, following_id=user.id).first() is not None
    
    def follow(self, user):
        if not self.is_following(user):
            follow = Follow(follower_id=self.id, following_id=user.id)
            db.session.add(follow)
            return True
        return False
    
    def unfollow(self, user):
        follow = Follow.query.filter_by(follower_id=self.id, following_id=user.id).first()
        if follow:
            db.session.delete(follow)
            return True
        return False
    
    def get_followers_count(self):
        return Follow.query.filter_by(following_id=self.id).count()
    
    def get_following_count(self):
        return Follow.query.filter_by(follower_id=self.id).count()
    
    def set_password(self, password: str) -> None:
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

# ... rest of your existing models (PostMedia, Post, Like, Comment) remain the same ...
class PostMedia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)  # 'image', 'video', 'gif'
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    likes = db.relationship('Like', backref='post', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='post', lazy=True, cascade='all, delete-orphan')
    media = db.relationship('PostMedia', backref='post', lazy=True, cascade='all, delete-orphan')

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='unique_like'),)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=True)
    
    # Relationship for replies
    replies = db.relationship(
        'Comment', 
        backref=db.backref('parent', remote_side=[id]), 
        lazy=True, 
        cascade='all, delete-orphan'
    )
    
    def to_dict(self, include_replies: bool = False) -> Dict[str, Any]:
        """
        Convert comment to dictionary
        
        Args:
            include_replies: Whether to include nested replies
            
        Returns:
            Dictionary representation of the comment
        """
        data = {
            'id': self.id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'user_id': self.user_id,
            'post_id': self.post_id,
            'parent_id': self.parent_id,
            'author': {
                'id': self.author.id,
                'username': self.author.username
            }
        }
        
        # Add parent author info for replies
        if self.parent_id and self.parent:
            data['parent_author'] = self.parent.author.username
        
        # Include replies if requested
        if include_replies:
            data['replies'] = [reply.to_dict(include_replies=True) for reply in self.replies]
        
        return data
    
    def get_reply_count(self) -> int:
        """
        Get total number of replies (including nested ones)
        
        Returns:
            Total number of replies
        """
        count = len(self.replies)
        for reply in self.replies:
            count += reply.get_reply_count()
        return count