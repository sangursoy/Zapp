import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Validate required environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEWS_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!Deno.env.get(envVar)) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const newsApiKey = Deno.env.get('NEWS_API_KEY')!;
const openAiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface GeneratedContent {
  title: string;
  description: string;
  tags: string[];
  location: string;
  content: {
    title: string;
    description: string;
    type: 'text';
  };
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Accept': 'application/json',
          'User-Agent': 'Supabase Edge Function'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

function validateNewsArticles(articles: any[]): NewsArticle[] {
  return articles.map(article => {
    if (!article.title || !article.description || !article.url) {
      throw new Error('Invalid article format: missing required fields');
    }
    return {
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: {
        name: article.source?.name || 'Unknown'
      }
    };
  });
}

function validateGeneratedContent(content: any): GeneratedContent {
  if (!content.title || !content.description || !Array.isArray(content.tags) || 
      !content.location || !content.content?.title || !content.content?.description) {
    throw new Error('Invalid generated content format');
  }
  
  return {
    title: content.title,
    description: content.description,
    tags: content.tags.slice(0, 5), // Limit to 5 tags
    location: content.location,
    content: {
      title: content.content.title,
      description: content.content.description,
      type: 'text'
    }
  };
}

async function generateTopicContent(articles: NewsArticle[], category: string): Promise<GeneratedContent> {
  try {
    // Format articles for the prompt
    const articleSummaries = articles.map(article => ({
      title: article.title,
      description: article.description,
      source: article.source.name,
      date: article.publishedAt
    }));

    const prompt = `
      Based on these news articles about ${category}, create a comprehensive topic summary:
      ${JSON.stringify(articleSummaries)}
      
      Generate a response in the following JSON format:
      {
        "title": "Engaging title for the topic",
        "description": "Brief but informative description",
        "tags": ["relevant", "tags", "max 5"],
        "location": "Most relevant location from the articles or 'Global'",
        "content": {
          "title": "Detailed article title",
          "description": "Comprehensive article that synthesizes the information",
          "type": "text"
        }
      }
      
      Make sure the content is engaging, factual, and well-structured.
      The description should be at least 200 words and properly formatted.
    `;

    const response = await fetchWithRetry(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert content creator and journalist. Create engaging, accurate, and well-structured content based on news articles."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      }
    );

    const completion = await response.json();
    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('No content generated by OpenAI');
    }

    let generatedContent;
    try {
      generatedContent = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', completion.choices[0].message.content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    return validateGeneratedContent(generatedContent);
  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    // Process only two categories at a time to reduce concurrent requests
    const categoryEntries = Object.entries(categoryMapping);
    const results = [];
    
    for (let i = 0; i < categoryEntries.length; i += 2) {
      const batch = categoryEntries.slice(i, i + 2);
      
      const batchPromises = batch.map(async ([category, topic]) => {
        try {
          console.log(`Processing category: ${category}`);

          const url = 'https://newsapi.org/v2/everything';
          const params = new URLSearchParams({
            q: topic,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: '3',
            apiKey: newsApiKey
          });

          const response = await fetchWithRetry(
            `${url}?${params}`,
            {
              headers: {
                'User-Agent': 'Supabase Edge Function'
              }
            }
          );

          const data = await response.json();
          
          if (!data.articles || !Array.isArray(data.articles)) {
            throw new Error(`Invalid response from News API for ${category}`);
          }

          const validatedArticles = validateNewsArticles(data.articles);
          console.log(`Validated ${validatedArticles.length} articles for ${category}`);

          const generatedContent = await generateTopicContent(validatedArticles, category);
          console.log(`Generated content for ${category}:`, generatedContent.title);

          // Create topic in database
          const { data: topicData, error: topicError } = await supabase
            .from('topics')
            .insert({
              title: generatedContent.title,
              category: category,
              location: generatedContent.location,
              is_official: true,
              trending: false,
              image_url: validatedArticles[0]?.urlToImage || 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg'
            })
            .select()
            .single();

          if (topicError) {
            console.error(`Error creating topic for ${category}:`, topicError);
            throw topicError;
          }

          console.log(`Created topic: ${topicData.id}`);

          // Create content in database
          const { data: contentData, error: contentError } = await supabase
            .from('contents')
            .insert({
              topic_id: topicData.id,
              type: 'text',
              title: generatedContent.content.title,
              description: generatedContent.content.description,
              is_external: false,
              user_id: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single();

          if (contentError) {
            console.error(`Error creating content for ${category}:`, contentError);
            throw contentError;
          }

          console.log(`Created content: ${contentData.id}`);

          // Add tags
          const tagPromises = generatedContent.tags.map(async tag => {
            const { error: tagError } = await supabase
              .from('content_tags')
              .insert({
                content_id: contentData.id,
                tag: tag
              });

            if (tagError) {
              console.error(`Error creating tag ${tag}:`, tagError);
              throw tagError;
            }
          });

          await Promise.all(tagPromises);
          console.log(`Added ${generatedContent.tags.length} tags`);

          return {
            topic: topicData,
            content: contentData,
            tags: generatedContent.tags
          };
        } catch (error) {
          console.error(`Error processing ${category}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null));
      
      // Add a small delay between batches to avoid rate limits
      if (i + 2 < categoryEntries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (results.length === 0) {
      throw new Error('Failed to generate any content');
    }

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error',
        details: error.stack
      }),
      {
        status: error.message.includes('Missing authorization') ? 401 : 500,
        headers: corsHeaders
      }
    );
  }
});