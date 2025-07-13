import axios from 'axios';

interface SplunkSearchOptions {
  earliest_time?: string;
  latest_time?: string;
  search_mode?: 'normal' | 'realtime' | 'fast';
  output_mode?: 'json' | 'xml' | 'csv';
  count?: number;
  offset?: number;
  max_count?: number;
}

interface SplunkAuthConfig {
  baseUrl: string;
  username: string;
  password: string;
  app?: string;
  owner?: string;
}

class SplunkService {
  private baseUrl: string;
  private authConfig: SplunkAuthConfig;
  private sessionKey: string = '';

  constructor(config: SplunkAuthConfig) {
    this.baseUrl = config.baseUrl;
    this.authConfig = config;
  }

  /**
   * Authenticate with Splunk and get session key
   */
  async authenticate(): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/services/auth/login`,
        new URLSearchParams({
          username: this.authConfig.username,
          password: this.authConfig.password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Parse XML response to get session key
      const xmlData = response.data;
      const sessionKeyMatch = xmlData.match(/<sessionKey>([^<]+)<\/sessionKey>/);
      if (sessionKeyMatch && sessionKeyMatch[1]) {
        this.sessionKey = sessionKeyMatch[1];
        return this.sessionKey;
      }
      throw new Error('Failed to extract session key from response');
    } catch (error) {
      console.error('Splunk authentication error:', error);
      throw new Error('Failed to authenticate with Splunk');
    }
  }

  /**
   * Get authenticated headers
   */
  private async getAuthHeaders() {
    if (!this.sessionKey) {
      await this.authenticate();
    }
    return {
      'Authorization': `Splunk ${this.sessionKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Run a search query and return results
   */
  async search(query: string, options: SplunkSearchOptions = {}): Promise<any[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      // Create search job
      const searchJobResponse = await axios.post(
        `${this.baseUrl}/services/search/jobs`,
        new URLSearchParams({
          search: query,
          earliest_time: options.earliest_time || '-24h',
          latest_time: options.latest_time || 'now',
          output_mode: 'json',
        }),
        { headers }
      );
      
      const jobId = searchJobResponse.data.sid;
      
      // Wait for search to complete
      let isDone = false;
      while (!isDone) {
        const statusResponse = await axios.get(
          `${this.baseUrl}/services/search/jobs/${jobId}`,
          { 
            headers,
            params: { output_mode: 'json' }
          }
        );
        
        isDone = statusResponse.data.entry[0].content.isDone;
        if (!isDone) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before checking again
        }
      }
      
      // Get results
      const resultsResponse = await axios.get(
        `${this.baseUrl}/services/search/jobs/${jobId}/results`,
        {
          headers,
          params: {
            output_mode: 'json',
            count: options.count || 10000,
          },
        }
      );
      
      return resultsResponse.data.results;
    } catch (error) {
      console.error('Splunk search error:', error);
      throw new Error('Failed to execute Splunk search');
    }
  }

  /**
   * Get trace data for visualization
   */
  async getTraceData(searchValue: string, searchType: string = 'accountId', timeRange: string = '24h'): Promise<any[]> {
    let query = '';
    
    // Build query based on search type
    if (searchType === 'traceId') {
      query = `search index=* "fields.x-b3-traceid"="${searchValue}" | sort _time`;
    } else if (searchType === 'accountId') {
      query = `search index=* "fields.accountId"="${searchValue}" earliest=-${timeRange} | sort _time`;
    } else if (searchType === 'userId') {
      query = `search index=* "fields.userId"="${searchValue}" earliest=-${timeRange} | sort _time`;
    } else {
      query = `search index=* ${searchValue} earliest=-${timeRange} | sort _time`;
    }
    
    return this.search(query);
  }
}

// Create a singleton instance with default config
// In a real app, these values would come from environment variables
const defaultConfig: SplunkAuthConfig = {
  baseUrl: process.env.REACT_APP_SPLUNK_URL || 'https://your-splunk-instance.com',
  username: process.env.REACT_APP_SPLUNK_USERNAME || 'admin',
  password: process.env.REACT_APP_SPLUNK_PASSWORD || 'changeme',
  app: process.env.REACT_APP_SPLUNK_APP || 'search',
};

const splunkService = new SplunkService(defaultConfig);

export default splunkService;
export type { SplunkSearchOptions, SplunkAuthConfig };
export { SplunkService };
