import natural from 'natural';

export class TokenizerFactory {
  private vocabulary: Map<string, number>;
  private tokenizer: natural.WordTokenizer;
  
  constructor() {
    this.vocabulary = new Map();
    this.tokenizer = new natural.WordTokenizer();
  }
  
  get vocabularySize(): number {
    return this.vocabulary.size + 1; // +1 for OOV (out of vocabulary) tokens
  }
  
  fitOnTexts(texts: string[]) {
    const allWords = new Set<string>();
    
    texts.forEach(text => {
      const tokens = this.tokenizer.tokenize(text.toLowerCase());
      if (tokens) {
        tokens.forEach(token => allWords.add(token));
      }
    });
    
    Array.from(allWords).forEach((word, index) => {
      this.vocabulary.set(word, index + 1); // Reserve 0 for OOV
    });
  }
  
  textsToSequences(texts: string[]): number[][] {
    return texts.map(text => {
      const tokens = this.tokenizer.tokenize(text.toLowerCase());
      if (!tokens) return [];
      
      return tokens.map(token => this.vocabulary.get(token) || 0);
    });
  }
  
  padSequences(sequences: number[][], maxLen: number): number[][] {
    return sequences.map(seq => {
      if (seq.length > maxLen) {
        return seq.slice(0, maxLen);
      }
      if (seq.length < maxLen) {
        return [...seq, ...Array(maxLen - seq.length).fill(0)];
      }
      return seq;
    });
  }
}