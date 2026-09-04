import { useState, useEffect } from 'react';
import { Bookmark, FileText, Video, ClipboardList, HelpCircle, Trash2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { bookmarkService } from '@/services/bookmarkService';
import { studyMaterialService } from '@/services/studyMaterialService';
import { videoService } from '@/services/videoService';
import { testService } from '@/services/testService';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { Bookmark as BookmarkType } from '@/types';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils/formatters';

export const StudentBookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [bookmarkDetails, setBookmarkDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await bookmarkService.getAll(user.id);
      setBookmarks(data);

      // Fetch details for each bookmark
      const details: Record<string, any> = {};
      await Promise.all(
        data.map(async (bookmark) => {
          try {
            let itemDetails = null;
            switch (bookmark.content_type) {
              case 'material':
                itemDetails = await studyMaterialService.getById(bookmark.content_id);
                break;
              case 'video':
                itemDetails = await videoService.getById(bookmark.content_id);
                break;
              case 'test':
                itemDetails = await testService.getById(bookmark.content_id);
                break;
            }
            if (itemDetails) {
              details[bookmark.id] = { ...itemDetails, type: bookmark.content_type };
            }
          } catch (error) {
            console.error(`Failed to fetch details for ${bookmark.content_type}:`, error);
          }
        })
      );
      setBookmarkDetails(details);
    } catch (error) {
      toast.error('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string, contentId: string) => {
    if (!user) return;

    try {
      await bookmarkService.remove(user.id, contentId);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      toast.success('Bookmark removed');
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  const handleViewItem = (bookmark: BookmarkType) => {
    switch (bookmark.content_type) {
      case 'material':
        navigate('/student/materials');
        break;
      case 'video':
        navigate('/student/videos');
        break;
      case 'test':
        navigate('/student/tests');
        break;
      case 'quiz':
        navigate('/student/quiz');
        break;
    }
  };

  const getTypeIcon = (type: BookmarkType['content_type']) => {
    switch (type) {
      case 'material':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'test':
        return <ClipboardList className="w-5 h-5" />;
      case 'quiz':
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: BookmarkType['content_type']) => {
    switch (type) {
      case 'material':
        return 'bg-blue-500';
      case 'video':
        return 'bg-orange-500';
      case 'test':
        return 'bg-green-500';
      case 'quiz':
        return 'bg-purple-500';
    }
  };

  const filteredBookmarks = selectedType === 'all'
    ? bookmarks
    : bookmarks.filter((b) => b.content_type === selectedType);

  const stats = {
    total: bookmarks.length,
    materials: bookmarks.filter((b) => b.content_type === 'material').length,
    videos: bookmarks.filter((b) => b.content_type === 'video').length,
    tests: bookmarks.filter((b) => b.content_type === 'test').length,
    quiz: bookmarks.filter((b) => b.content_type === 'quiz').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookmarks</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access all your saved content in one place
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={selectedType === 'all' ? 'ring-2 ring-primary' : ''}>
          <button
            onClick={() => setSelectedType('all')}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary rounded-lg">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
            </div>
          </button>
        </Card>

        <Card className={selectedType === 'material' ? 'ring-2 ring-blue-500' : ''}>
          <button
            onClick={() => setSelectedType('material')}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Materials</p>
                <p className="text-2xl font-bold mt-1">{stats.materials}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </button>
        </Card>

        <Card className={selectedType === 'video' ? 'ring-2 ring-orange-500' : ''}>
          <button
            onClick={() => setSelectedType('video')}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
                <p className="text-2xl font-bold mt-1">{stats.videos}</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
            </div>
          </button>
        </Card>

        <Card className={selectedType === 'test' ? 'ring-2 ring-green-500' : ''}>
          <button
            onClick={() => setSelectedType('test')}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tests</p>
                <p className="text-2xl font-bold mt-1">{stats.tests}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
            </div>
          </button>
        </Card>

        <Card className={selectedType === 'quiz' ? 'ring-2 ring-purple-500' : ''}>
          <button
            onClick={() => setSelectedType('quiz')}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quiz</p>
                <p className="text-2xl font-bold mt-1">{stats.quiz}</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </button>
        </Card>
      </div>

      {/* Bookmarks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading bookmarks...</p>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No bookmarks found</p>
            <p className="text-sm text-gray-400 mt-2">
              Start bookmarking content to see it here
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((bookmark) => {
            const details = bookmarkDetails[bookmark.id];
            if (!details) return null;

            return (
              <Card key={bookmark.id} hoverable>
                <div className="flex items-start gap-4">
                  <div className={`${getTypeColor(bookmark.content_type)} p-3 rounded-lg flex-shrink-0`}>
                    {getTypeIcon(bookmark.content_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{details.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-gray-100 dark:bg-dark px-2 py-1 rounded capitalize">
                            {bookmark.content_type}
                          </span>
                          {details.category && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {details.category}
                            </span>
                          )}
                        </div>
                        {details.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {details.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Bookmarked on {formatDate(bookmark.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<ExternalLink className="w-4 h-4" />}
                          onClick={() => handleViewItem(bookmark)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleRemoveBookmark(bookmark.id, bookmark.content_id)}
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
