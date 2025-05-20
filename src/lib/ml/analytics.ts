import { Content, User, Category } from '../../types';

export interface UserFeatures {
  viewCounts: Record<Category, number>;
  likeCounts: Record<Category, number>;
  shareCounts: Record<Category, number>;
  commentCounts: Record<Category, number>;
  saveCounts: Record<Category, number>;
  timeSpent: Record<Category, number>;
  recentInteractions: Record<Category, number>;
}

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private interactionBuffer: Map<string, Set<string>> = new Map();
  private sessionStartTime: number = Date.now();
  
  private constructor() {
    // Initialize interaction tracking
    window.addEventListener('beforeunload', () => {
      this.saveAnalytics();
    });
  }
  
  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }
  
  trackView(contentId: string, userId: string) {
    const key = `view_${contentId}`;
    if (!this.interactionBuffer.has(key)) {
      this.interactionBuffer.set(key, new Set());
    }
    this.interactionBuffer.get(key)!.add(userId);
  }
  
  trackEngagement(contentId: string, type: 'like' | 'share' | 'comment' | 'save') {
    const key = `${type}_${contentId}`;
    if (!this.interactionBuffer.has(key)) {
      this.interactionBuffer.set(key, new Set());
    }
    this.interactionBuffer.get(key)!.add(Date.now().toString());
  }
  
  async extractUserFeatures(user: User, contents: Content[]): Promise<UserFeatures> {
    const features: UserFeatures = {
      viewCounts: {} as Record<Category, number>,
      likeCounts: {} as Record<Category, number>,
      shareCounts: {} as Record<Category, number>,
      commentCounts: {} as Record<Category, number>,
      saveCounts: {} as Record<Category, number>,
      timeSpent: {} as Record<Category, number>,
      recentInteractions: {} as Record<Category, number>
    };
    
    // Initialize counters for each category
    Object.values(Category).forEach(category => {
      features.viewCounts[category] = 0;
      features.likeCounts[category] = 0;
      features.shareCounts[category] = 0;
      features.commentCounts[category] = 0;
      features.saveCounts[category] = 0;
      features.timeSpent[category] = 0;
      features.recentInteractions[category] = 0;
    });
    
    // Aggregate interactions
    contents.forEach(content => {
      const category = content.category as Category;
      
      // Count views
      const viewKey = `view_${content.id}`;
      if (this.interactionBuffer.has(viewKey) && 
          this.interactionBuffer.get(viewKey)!.has(user.id)) {
        features.viewCounts[category]++;
      }
      
      // Count other interactions
      ['like', 'share', 'comment', 'save'].forEach(type => {
        const key = `${type}_${content.id}`;
        if (this.interactionBuffer.has(key)) {
          const count = this.interactionBuffer.get(key)!.size;
          switch (type) {
            case 'like':
              features.likeCounts[category] += count;
              break;
            case 'share':
              features.shareCounts[category] += count;
              break;
            case 'comment':
              features.commentCounts[category] += count;
              break;
            case 'save':
              features.saveCounts[category] += count;
              break;
          }
        }
      });
    });
    
    return features;
  }
  
  private async saveAnalytics() {
    // Convert buffer to array format for storage
    const analyticsData = Array.from(this.interactionBuffer.entries()).map(([key, value]) => ({
      key,
      interactions: Array.from(value)
    }));
    
    // Store in IndexedDB for persistence
    try {
      const db = await this.openDB();
      const tx = db.transaction('analytics', 'readwrite');
      const store = tx.objectStore('analytics');
      
      await store.put({
        timestamp: Date.now(),
        sessionDuration: Date.now() - this.sessionStartTime,
        interactions: analyticsData
      });
      
      await tx.complete;
      db.close();
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }
  
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('analytics', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore('analytics', { keyPath: 'timestamp' });
      };
    });
  }
}