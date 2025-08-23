import { OpenAIProvider } from '../providers/openai.provider.js';
import { AnalyticsService } from './analytics.service.js';
import chalk from "chalk";

export class AIService {
  constructor() {
    this.provider = new OpenAIProvider();
    this.analytics = new AnalyticsService();
  }

  /**
   * Generate commit messages using AI
   * @param {string} diff - Git diff to analyze
   * @param {number} count - Number of messages to generate
   * @returns {Promise<string[]>} Array of commit messages
   */
  async generateMessages(diff, count = 3) {
    try {
      const messages = await this.provider.generateCommitMessages(diff, count);
      
      // Track successful generation
      this.analytics.trackEvent('ai_generation_successful', {
        messageCount: messages.length,
        model: this.provider.getModel(),
        diffLength: diff.length
      });
      
      return messages;
    } catch (error) {
      // Track failure
      this.analytics.trackEvent('ai_generation_failed', {
        error: error.message,
        model: this.provider.getModel()
      });
      
      throw error;
    }
  }

  /**
   * Generate a single commit message
   * @param {string} diff - Git diff to analyze
   * @param {number} variation - Variation index for diversity
   * @returns {Promise<string>} Commit message
   */
  async generateSingleMessage(diff, variation = 0) {
    const messages = await this.generateMessages(diff, 3);
    return messages[variation % messages.length];
  }

  /**
   * Detect languages from diff
   * @param {string} diff - Git diff
   * @returns {string[]} Detected languages
   */
  detectLanguages(diff) {
    const extensions = {
      '.js': 'JavaScript',
      '.jsx': 'React',
      '.ts': 'TypeScript',
      '.tsx': 'React TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.cs': 'C#',
      '.cpp': 'C++',
      '.html': 'HTML',
      '.css': 'CSS',
      '.json': 'JSON',
      '.md': 'Markdown'
    };

    const languages = new Set();
    const fileRegex = /(?:\+\+\+|---) [ab]\/(.+)/g;
    let match;

    while ((match = fileRegex.exec(diff)) !== null) {
      const filename = match[1];
      const ext = filename.substring(filename.lastIndexOf('.'));
      if (extensions[ext]) {
        languages.add(extensions[ext]);
      }
    }

    return Array.from(languages);
  }
}