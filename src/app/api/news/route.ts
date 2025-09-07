import { NextRequest, NextResponse } from 'next/server';

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

// Mock news data for demonstration
function generateMockNews(): NewsArticle[] {
  const categories = ['Technology', 'Science', 'Business', 'Health', 'World'];
  const sources = ['Tech News', 'Science Daily', 'Business Wire', 'Health Today', 'Global Times'];
  
  const newsTemplates = [
    {
      title: 'Revolutionary AI System Shows Promise in Medical Diagnosis',
      summary: 'New artificial intelligence system demonstrates remarkable accuracy in early disease detection, potentially transforming healthcare delivery worldwide.'
    },
    {
      title: 'Breakthrough in Quantum Computing Achieved',
      summary: 'Scientists successfully demonstrate quantum advantage in practical applications, marking a significant milestone in computing technology.'
    },
    {
      title: 'Sustainable Energy Storage Solution Unveiled',
      summary: 'Innovative battery technology promises to revolutionize renewable energy storage with improved efficiency and reduced environmental impact.'
    },
    {
      title: 'Space Mission Discovers Potential Signs of Life',
      summary: 'Latest space exploration mission returns with compelling evidence that could reshape our understanding of life beyond Earth.'
    },
    {
      title: 'Cybersecurity Advances Combat Growing Digital Threats',
      summary: 'New security protocols and AI-driven defense systems provide enhanced protection against sophisticated cyber attacks.'
    },
    {
      title: 'Gene Therapy Shows Remarkable Results in Clinical Trials',
      summary: 'Groundbreaking gene editing technique demonstrates significant success in treating previously incurable genetic disorders.'
    },
    {
      title: 'Smart City Infrastructure Transforms Urban Living',
      summary: 'Innovative IoT integration and data analytics create more efficient, sustainable, and livable urban environments worldwide.'
    },
    {
      title: 'Climate Technology Breakthrough Offers Hope',
      summary: 'Revolutionary carbon capture technology demonstrates potential to significantly reduce atmospheric greenhouse gas levels.'
    }
  ];

  return newsTemplates.map((template, index) => ({
    id: `news-${index + 1}`,
    title: template.title,
    summary: template.summary,
    category: categories[Math.floor(Math.random() * categories.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    url: `https://example.com/news/article-${index + 1}`,
    imageUrl: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/82cda17e-6dee-4345-91e7-dc8b714d41b9.png + 1}+Image`
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const source = searchParams.get('source');

    let news = generateMockNews();

    // Filter by category if specified
    if (category && category !== 'all') {
      news = news.filter(article => 
        article.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by source if specified
    if (source) {
      news = news.filter(article => 
        article.source.toLowerCase().includes(source.toLowerCase())
      );
    }

    // Apply limit
    news = news.slice(0, limit);

    // Sort by published date (most recent first)
    news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({
      success: true,
      data: {
        articles: news,
        totalCount: news.length,
        categories: ['Technology', 'Science', 'Business', 'Health', 'World'],
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('News API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch news data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { preferences } = await request.json();
    
    // Save news preferences (in a real app, this would go to a database)
    const savedPreferences = {
      categories: preferences?.categories || ['Technology', 'Science'],
      sources: preferences?.sources || [],
      updateInterval: preferences?.updateInterval || 60, // minutes
      notifications: preferences?.notifications || false,
      maxArticles: preferences?.maxArticles || 20,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'News preferences updated successfully',
      preferences: savedPreferences
    });

  } catch (error) {
    console.error('News Preferences Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update news preferences' },
      { status: 500 }
    );
  }
}

// Helper function to get trending topics
export function getTrendingTopics(): string[] {
  return [
    'Artificial Intelligence',
    'Climate Change',
    'Space Exploration',
    'Quantum Computing',
    'Biotechnology',
    'Renewable Energy',
    'Cybersecurity',
    'Autonomous Vehicles'
  ];
}

// Helper function to get news summary
export function generateNewsSummary(articles: NewsArticle[]): string {
  if (articles.length === 0) return 'No news articles available.';

  const categories = [...new Set(articles.map(a => a.category))];
  const recentArticles = articles.slice(0, 3);

  let summary = `Latest news summary: ${articles.length} articles available across ${categories.length} categories. `;
  
  summary += 'Top stories include: ';
  summary += recentArticles.map(article => `"${article.title}"`).join(', ');
  
  return summary;
}