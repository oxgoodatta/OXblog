import React, { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostForm = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]); // New state for previews
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      const response = await postsAPI.createPost(content.trim(), mediaFiles);
      onPostCreated(response.data.post);
      setContent('');
      setMediaFiles([]);
      setMediaPreviews([]); // Clear previews
    } catch (error) {
      console.error('Post creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Filter for allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      alert('Some files were not accepted. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, MOV, AVI, WebM).');
    }
    
    setMediaFiles(prev => [...prev, ...validFiles].slice(0, 4)); // Limit to 4 files
    
    // Generate previews for all files
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setMediaPreviews(prev => [...prev, { type: 'image', url: previewUrl }]);
      } else if (file.type.startsWith('video/')) {
        generateVideoThumbnail(file);
      }
    });
  };

  const generateVideoThumbnail = (videoFile) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    video.src = URL.createObjectURL(videoFile);
    video.currentTime = 1; // Capture at 1 second
    
    video.addEventListener('loadeddata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const thumbnailUrl = URL.createObjectURL(blob);
        setMediaPreviews(prev => [...prev, { type: 'video', url: thumbnailUrl }]);
        
        // Clean up
        URL.revokeObjectURL(video.src);
      }, 'image/jpeg');
    });
    
    video.load();
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => {
      const newPreviews = [...prev];
      // Revoke the object URL to prevent memory leaks
      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index].url);
      }
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  const onEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    const textarea = textareaRef.current;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      
      setContent(newContent);
      
      // Set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent(prev => prev + emoji);
    }
    
    setShowEmojiPicker(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="3"
        />
        
        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  {mediaPreviews[index] ? (
                    <img
                      src={mediaPreviews[index].url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                
                {/* Video indicator */}
                {file.type.startsWith('video/') && (
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                  </div>
                )}
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeMediaFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-500 transition-colors border border-gray-300 rounded-lg hover:border-blue-500"
            >
              <span>📷</span>
              <span>Media</span>
            </button>
            
            {/* Emoji Picker Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-500 transition-colors border border-gray-300 rounded-lg hover:border-blue-500"
              >
                <span>😊</span>
                <span>Emoji</span>
              </button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 z-10">
                  <EmojiPicker 
                    onEmojiClick={onEmojiClick}
                    width={350}
                    height={400}
                    searchDisabled={false}
                  />
                </div>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,video/*"
          className="hidden"
        />
      </form>

      {/* Close emoji picker when clicking outside */}
      {showEmojiPicker && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

export default PostForm;