export * from './models';
export * from './tokenizer';
export * from './analytics';

// Initialize ML system
import { ContentClassifier, UserInterestPredictor } from './models';
import { AnalyticsManager } from './analytics';
import { Category } from '../../types';

export const initializeMLSystem = async () => {
  try {
    // Initialize content classifier
    const contentClassifier = new ContentClassifier(Object.values(Category));
    await contentClassifier.buildModel();
    
    // Try to load existing model
    try {
      await contentClassifier.load('content-classifier');
    } catch {
      console.log('No existing content classifier model found, will train new one');
    }
    
    // Initialize user interest predictor
    const userInterestPredictor = new UserInterestPredictor();
    const numFeatures = Object.keys(Category).length * 7; // 7 feature types per category
    await userInterestPredictor.buildModel(numFeatures, Object.keys(Category).length);
    
    try {
      await userInterestPredictor.load('user-interest-predictor');
    } catch {
      console.log('No existing user interest predictor model found, will train new one');
    }
    
    // Initialize analytics manager
    const analyticsManager = AnalyticsManager.getInstance();
    
    return {
      contentClassifier,
      userInterestPredictor,
      analyticsManager
    };
  } catch (error) {
    console.error('Failed to initialize ML system:', error);
    throw error;
  }
};