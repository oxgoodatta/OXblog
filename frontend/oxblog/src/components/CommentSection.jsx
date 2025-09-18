import React from 'react';
import CommentForm from './CommentForm';

const CommentSection = ({ comments, postId, onCommentAdded }) => {
  const renderComments = (comments, depth = 0) => {
    return comments.map(comment => (
      <div key={comment.id} className={`ml-${depth * 6} mt-4`}>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                {comment.author.username.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-800">
                  @{comment.author.username}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              
              <p className="text-gray-800 mt-1">{comment.content}</p>
              
              {depth < 3 && (
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  onCommentAdded={onCommentAdded}
                  placeholder="Write a reply..."
                  buttonText="Reply"
                />
              )}
            </div>
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {renderComments(comment.replies, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Comments</h3>
      
      <CommentForm
        postId={postId}
        onCommentAdded={onCommentAdded}
        placeholder="Write a comment..."
        buttonText="Comment"
      />

      <div className="mt-6">
        {comments && comments.length > 0 ? (
          renderComments(comments)
        ) : (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;