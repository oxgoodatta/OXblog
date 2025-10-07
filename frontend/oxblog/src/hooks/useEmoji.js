import { useState, useRef } from 'react';

export const useEmoji = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  const insertEmoji = (emoji, content, setContent) => {
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

  return {
    showEmojiPicker,
    setShowEmojiPicker,
    textareaRef,
    insertEmoji
  };
};