'use client';

import { IconThumbUp, IconThumbDown, IconSend, IconMessageReply, IconX } from "@tabler/icons-react";
import React, { useState, useEffect, useRef } from 'react';

interface SeriesMessage {
  id: string;
  content: string;
  username: string;
  likes: number;
  dislikes: number;
  parentId: string | null;
  createdAt: string;
  replies?: SeriesMessage[];
}

const MAX_MESSAGE_LENGTH = 500; // Set the maximum character limit

const SeriesChat: React.FC<{ seriesId: string }> = ({ seriesId }) => {
  const [messages, setMessages] = useState<SeriesMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
    checkAuthStatus();
  }, [seriesId]);

  const checkAuthStatus = async () => {
    const res = await fetch('/api/auth/getCurrentUser');
    const data = await res.json();
    if (data && data.name) {
      setUser(data);
    }
  };

  const fetchMessages = async () => {
    const res = await fetch(`/api/auth/seriesMessages?seriesId=${seriesId}`);
    if (res.ok) {
      const data: SeriesMessage[] = await res.json();
      const messageTree = buildMessageTree(data);
      setMessages(messageTree);
    }
  };
  

  const buildMessageTree = (messages: SeriesMessage[]): SeriesMessage[] => {
    const messageMap = new Map<string, SeriesMessage>();
    const rootMessages: SeriesMessage[] = [];

    messages.forEach(message => {
      messageMap.set(message.id, { ...message, replies: [] });
    });

    messages.forEach(message => {
      const currentMessage = messageMap.get(message.id)!;
      if (message.parentId) {
        const parentMessage = messageMap.get(message.parentId);
        if (parentMessage) {
          parentMessage.replies!.push(currentMessage);
        }
      } else {
        rootMessages.push(currentMessage);
      }
    });

    return rootMessages;
  };

  const sendMessage = async (content: string, parentId: string | null = null) => {
    if (!user || !content.trim() || content.length > MAX_MESSAGE_LENGTH) return;
    const res = await fetch('/api/auth/seriesMessages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesId,
        content,
        parentId,
      }),
    });
    if (res.ok) {
      setReplyingTo(null);
      setNewMessage('');
      fetchMessages();
    }
  };

  const handleLikeDislike = async (messageId: string, action: 'likes' | 'dislikes') => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/seriesMessages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action }),
      });
      if (res.ok) {
        const updatedMessage = await res.json();
        setMessages(prevMessages => 
          updateMessageRecursively(prevMessages, messageId, updatedMessage)
        );
      } else {
        console.error('Failed to update like/dislike');
      }
    } catch (error) {
      console.error('Error updating like/dislike:', error);
    }
  };

  const updateMessageRecursively = (messages: SeriesMessage[], targetId: string, updatedData: Partial<SeriesMessage>): SeriesMessage[] => {
    return messages.map(message => {
      if (message.id === targetId) {
        return { ...message, ...updatedData };
      }
      if (message.replies && message.replies.length > 0) {
        return {
          ...message,
          replies: updateMessageRecursively(message.replies, targetId, updatedData)
        };
      }
      return message;
    });
  };

  const MessageComponent: React.FC<{ message: SeriesMessage, depth: number }> = React.memo(({ message, depth }) => {
    const [replyContent, setReplyContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isReplying = replyingTo === message.id;

    useEffect(() => {
      if (isReplying && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [isReplying]);

    const handleReply = () => {
      if (replyContent.trim() && replyContent.length <= MAX_MESSAGE_LENGTH) {
        sendMessage(replyContent, message.id);
        setReplyContent('');
        setReplyingTo(null);
      }
    };

    return (
      <div className={`bg-background-100 p-4 rounded-lg shadow-sm border border-background-300 ${depth > 0 ? 'ml-4 mt-2' : 'mb-4'}`}>
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-text-800">{message.username}</p>
          <p className="text-sm text-text-500">{new Date(message.createdAt).toLocaleDateString()}</p>
        </div>
        <p className="text-text-700 mb-3">{message.content}</p>
        <div className="flex space-x-4">
          <button 
            onClick={() => handleLikeDislike(message.id, 'likes')}
            className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 transition-colors"
          >
            <IconThumbUp size={18} />
            <span>{message.likes}</span>
          </button>
          <button 
            onClick={() => handleLikeDislike(message.id, 'dislikes')}
            className="flex items-center space-x-1 text-secondary-600 hover:text-secondary-800 transition-colors"
          >
            <IconThumbDown size={18} />
            <span>{message.dislikes}</span>
          </button>
          {user && (
            <button 
              onClick={() => setReplyingTo(message.id)}
              className="flex items-center space-x-1 text-accent-600 hover:text-accent-800 transition-colors"
            >
              <IconMessageReply size={18} />
              <span>Reply</span>
            </button>
          )}
        </div>
        {isReplying && user.name ? (
          <div className="mt-4">
            <textarea
              ref={textareaRef}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              className="w-full p-2 border border-background-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-background-50 text-text-800"
              placeholder="Write a reply..."
              rows={3}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-text-500">
                {replyContent.length}/{MAX_MESSAGE_LENGTH} characters
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 text-text-600 hover:text-text-800 transition-colors"
                >
                  <IconX size={18} />
                </button>
                <button
                  onClick={handleReply}
                  className="bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <IconSend size={18} />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {message.replies && message.replies.map(reply => (
          <MessageComponent key={reply.id} message={reply} depth={depth + 1} />
        ))}
      </div>
    );
  });

  MessageComponent.displayName = 'MessageComponent';

  return (
    <div className="mt-8 bg-background-50 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-text-900">Series Discussion</h2>
      <div className="space-y-6">
        {messages.map((message) => (
          <MessageComponent key={message.id} message={message} depth={0} />
        ))}
      </div>
      {user && user.name ? (
        <div className="mt-6">
          <textarea
            onClick={() => setReplyingTo(null)}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            className="w-full p-3 border border-background-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-background-50 text-text-800"
            placeholder="Write a comment..."
            rows={4}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-text-500">
              {newMessage.length}/{MAX_MESSAGE_LENGTH} characters
            </span>
            <button
              onClick={() => {
                if (newMessage.trim() && newMessage.length <= MAX_MESSAGE_LENGTH) {
                  sendMessage(newMessage);
                  setNewMessage('');
                }
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <IconSend size={18} />
              <span>Send</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-text-700">
          Please <a href="/signin" className="text-primary-600 hover:text-primary-800 underline">log in</a> to join the discussion.
        </p>
      )}
    </div>
  );
};

export default SeriesChat;