import * as tf from '@tensorflow/tfjs';
import { TokenizerFactory } from './tokenizer';

export class ContentClassifier {
  private model: tf.LayersModel | null = null;
  private tokenizer: TokenizerFactory;
  private categories: string[];
  
  constructor(categories: string[]) {
    this.tokenizer = new TokenizerFactory();
    this.categories = categories;
  }
  
  async buildModel() {
    // Text classification model architecture
    const model = tf.sequential();
    
    model.add(tf.layers.embedding({
      inputDim: this.tokenizer.vocabularySize,
      outputDim: 32,
      inputLength: 100
    }));
    
    model.add(tf.layers.globalAveragePooling1d());
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(tf.layers.dense({ units: this.categories.length, activation: 'softmax' }));
    
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    this.model = model;
    return model;
  }
  
  async train(texts: string[], labels: number[][], epochs = 10) {
    if (!this.model) {
      await this.buildModel();
    }
    
    const sequences = this.tokenizer.textsToSequences(texts);
    const paddedSequences = this.tokenizer.padSequences(sequences, 100);
    
    const xs = tf.tensor2d(paddedSequences);
    const ys = tf.tensor2d(labels);
    
    await this.model!.fit(xs, ys, {
      epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.acc.toFixed(4)}`);
        }
      }
    });
    
    xs.dispose();
    ys.dispose();
  }
  
  async predict(text: string): Promise<{ category: string; confidence: number }> {
    if (!this.model) {
      throw new Error('Model not trained');
    }
    
    const sequence = this.tokenizer.textsToSequences([text]);
    const paddedSequence = this.tokenizer.padSequences(sequence, 100);
    const input = tf.tensor2d(paddedSequence);
    
    const prediction = this.model.predict(input) as tf.Tensor;
    const probabilities = await prediction.data();
    
    input.dispose();
    prediction.dispose();
    
    const maxProbIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
    
    return {
      category: this.categories[maxProbIndex],
      confidence: probabilities[maxProbIndex]
    };
  }
  
  async save(path: string) {
    if (!this.model) {
      throw new Error('No model to save');
    }
    await this.model.save(`indexeddb://${path}`);
  }
  
  async load(path: string) {
    this.model = await tf.loadLayersModel(`indexeddb://${path}`);
    return this.model;
  }
}

export class UserInterestPredictor {
  private model: tf.LayersModel | null = null;
  
  async buildModel(numFeatures: number, numCategories: number) {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [numFeatures]
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: numCategories, activation: 'sigmoid' }));
    
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    this.model = model;
    return model;
  }
  
  async train(features: number[][], labels: number[][], epochs = 10) {
    if (!this.model) {
      throw new Error('Model not built');
    }
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);
    
    await this.model.fit(xs, ys, {
      epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.acc.toFixed(4)}`);
        }
      }
    });
    
    xs.dispose();
    ys.dispose();
  }
  
  async predict(features: number[]): Promise<number[]> {
    if (!this.model) {
      throw new Error('Model not trained');
    }
    
    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const probabilities = await prediction.data();
    
    input.dispose();
    prediction.dispose();
    
    return Array.from(probabilities);
  }
  
  async save(path: string) {
    if (!this.model) {
      throw new Error('No model to save');
    }
    await this.model.save(`indexeddb://${path}`);
  }
  
  async load(path: string) {
    this.model = await tf.loadLayersModel(`indexeddb://${path}`);
    return this.model;
  }
}