"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
}

interface NewsData {
  articles: NewsArticle[];
  totalCount: number;
  categories: string[];
  lastUpdated: string;
}

interface NewsWidgetProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function NewsWidget({ isVisible, onToggle }: NewsWidgetProps) {
  const [news, setNews] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchNews = async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('category', category);
      }
      params.append('limit', '10');
      
      const response = await fetch(`/api/news?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news data');
      }
      
      const data = await response.json();
      setNews(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchNews(selectedCategory);
      
      // Update every 15 minutes
      const interval = setInterval(() => fetchNews(selectedCategory), 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isVisible, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const articleDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      'Technology': 'text-blue-400 bg-blue-400/20',
      'Science': 'text-green-400 bg-green-400/20',
      'Business': 'text-yellow-400 bg-yellow-400/20',
      'Health': 'text-red-400 bg-red-400/20',
      'World': 'text-purple-400 bg-purple-400/20'
    };
    return colors[category as keyof typeof colors] || 'text-gray-400 bg-gray-400/20';
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-orange-400 rounded-full pulse-animation" />
          <h2 className="text-2xl font-semibold text-yellow-400 jarvis-font">NEWS FEED</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => fetchNews(selectedCategory)}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
            className="border-red-400/50 text-red-400 hover:bg-red-400/20"
          >
            Hide
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      {news && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleCategoryChange('all')}
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            className={`${
              selectedCategory === 'all'
                ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400'
                : 'border-yellow-400/50 text-yellow-400/80 hover:bg-yellow-400/10'
            }`}
          >
            All ({news.totalCount})
          </Button>
          {news.categories.map((category) => (
            <Button
              key={category}
              onClick={() => handleCategoryChange(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              className={`${
                selectedCategory === category
                  ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400'
                  : 'border-yellow-400/50 text-yellow-400/80 hover:bg-yellow-400/10'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-400/30 p-4 rounded-lg">
          <div className="text-red-400">Error: {error}</div>
        </div>
      )}

      {loading && !news && (
        <div className="flex items-center justify-center h-40">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce delay-150" />
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce delay-300" />
          </div>
        </div>
      )}

      {news && (
        <Card className="bg-black/40 border-yellow-400/30 hologram-effect">
          <div className="p-4 border-b border-yellow-400/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-yellow-400">
                Latest Headlines
              </h3>
              <div className="text-sm text-yellow-400/80">
                Updated: {formatTimeAgo(news.lastUpdated)}
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {news.articles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 bg-black/30 rounded border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300 hover:bg-black/50 slide-in"
                >
                  <div className="flex items-start space-x-4">
                    {/* Article Image Placeholder */}
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded flex items-center justify-center flex-shrink-0">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="text-yellow-400 text-2xl">📰</div>
                    </div>
                    
                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${getCategoryColor(article.category)}`}>
                          {article.category}
                        </span>
                        <span className="text-xs text-yellow-400/60">
                          {article.source}
                        </span>
                        <span className="text-xs text-yellow-400/60">
                          •
                        </span>
                        <span className="text-xs text-yellow-400/60">
                          {formatTimeAgo(article.publishedAt)}
                        </span>
                      </div>
                      
                      <h4 className="text-yellow-100 font-semibold mb-2 line-clamp-2 leading-tight">
                        {article.title}
                      </h4>
                      
                      <p className="text-yellow-400/80 text-sm line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                      
                      <div className="mt-3">
                        <Button
                          onClick={() => window.open(article.url, '_blank')}
                          variant="outline"
                          size="sm"
                          className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20 text-xs"
                        >
                          Read More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* News Summary */}
      {news && (
        <Card className="bg-black/40 border-yellow-400/30 p-4 hologram-effect">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">News Summary</h3>
          <p className="text-yellow-400/80 text-sm">
            {news.articles.length} articles available across {news.categories.length} categories. 
            Stay informed with the latest developments in technology, science, business, health, and world news.
            Last updated {formatTimeAgo(news.lastUpdated)}.
          </p>
        </Card>
      )}
    </div>
  );
}