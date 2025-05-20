import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const categoryMapping = {
  'Sports': 'sports',
  'Finance': 'business',
  'Health': 'health',
  'Culture': 'entertainment',
  'Technology': 'technology',
  'Education': 'education',
  'Entertainment': 'entertainment',
  'Politics': 'politics',
  'Science': 'science'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = '5d0778fb9aad4e8cbc19b47446c276b4';
    
    if (!apiKey) {
      throw new Error('NEWS_API_KEY is not set');
    }

    const newsPromises = Object.entries(categoryMapping).map(async ([category, topic]) => {
      const url = 'https://newsapi.org/v2/everything';
      const params = new URLSearchParams({
        q: topic,
        language: 'tr',
        sortBy: 'publishedAt',
        pageSize: '10',
        apiKey: apiKey
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`NewsAPI error: ${error.message}`);
      }
      
      const data = await response.json();
      return {
        category,
        articles: data.articles.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.urlToImage,
          publishedAt: article.publishedAt,
          sourceName: article.source.name,
          author: article.author
        }))
      };
    });

    const results = await Promise.all(newsPromises);

    return new Response(
      JSON.stringify(results),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});