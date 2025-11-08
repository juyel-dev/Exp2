import { useState, useEffect } from 'react';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/Input/Input';
import { useAuth } from '../modules/auth/AuthContext';
import { graphService } from '../services/graphService';

export interface Comment {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  text: string;
  createdAt: Date;
  replies?: Comment[];
}

interface CommentsSystemProps {
  graphId: string;
}

export const CommentsSystem: React.FC<CommentsSystemProps> = ({ graphId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadComments();
  }, [graphId]);

  const loadComments = async () => {
    try {
      const commentsData = await graphService.getComments(graphId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      await graphService.addComment(
        graphId, 
        newComment, 
        user.uid, 
        user.displayName || 'Anonymous',
        user.photoURL
      );
      setNewComment('');
      loadComments(); // Refresh comments
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyText.trim() || !user) return;

    try {
      await graphService.addReply(
        graphId,
        parentCommentId,
        replyText,
        user.uid,
        user.displayName || 'Anonymous',
        user.photoURL
      );
      setReplyText('');
      setReplyingTo(null);
      loadComments();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
            <img
              src={user.photoURL || `/api/placeholder/40/40`}
              alt={user.displayName || 'User'}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                disabled={loading}
                className="w-full"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  type="submit" 
                  loading={loading}
                  disabled={!newComment.trim()}
                  size="sm"
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <i className="fas fa-comment text-2xl mb-2" />
          <p>Please log in to comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex gap-3">
              <img
                src={comment.userPhotoURL || `/api/placeholder/32/32`}
                alt={comment.userDisplayName}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.userDisplayName}</span>
                  <span className="text-gray-500 text-xs">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-800 text-sm mb-2">{comment.text}</p>
                
                {/* Reply Button */}
                {user && (
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                  >
                    Reply
                  </button>
                )}

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      size="sm"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyText.trim()}
                      size="sm"
                    >
                      Reply
                    </Button>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-3 ml-4 pl-4 border-l-2 border-gray-100">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="flex gap-2">
                        <img
                          src={reply.userPhotoURL || `/api/placeholder/28/28`}
                          alt={reply.userDisplayName}
                          className="w-7 h-7 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">{reply.userDisplayName}</span>
                            <span className="text-gray-500 text-xs">
                              {formatTimeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-800 text-xs">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-comments text-3xl mb-3 opacity-50" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};
