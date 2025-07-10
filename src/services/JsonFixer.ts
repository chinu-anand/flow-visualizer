// Utility class to fix and parse poorly formatted JSON from API responses
// Handles cases where JSON is embedded as a string in a property like _raw, with extra whitespace, tabs, or newlines

export class JsonFixer {
  /**
   * Attempts to extract and parse a valid JSON object from a string or object.
   * Handles cases where JSON is embedded as a string in a property like _raw.
   * @param input The input string or object
   * @returns The parsed JSON object, or null if parsing fails
   */
  static fix(input: any): any {
    if (!input) return null;
    // If input is already an object, return as is
    if (typeof input === 'object') return input;
    // If input is a string, try to parse
    if (typeof input === 'string') {
      // Clean control characters before parsing
      const cleanedInput = JsonFixer.cleanControlChars(input);
      try {
        return JSON.parse(cleanedInput);
      } catch (e) {
        // Try to extract JSON substring (e.g., from _raw)
        const match = cleanedInput.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            return JSON.parse(JsonFixer.cleanControlChars(match[0]));
          } catch (e2) {
            // Try to clean up tabs/newlines and parse again
            try {
              const cleaned = JsonFixer.cleanControlChars(match[0].replace(/\n|\t/g, ''));
              return JSON.parse(cleaned);
            } catch (e3) {
              return null;
            }
          }
        }
        return null;
      }
    }
    return null;
  }

  /**
   * Cleans control characters from a JSON string (except for valid escapes like \n, \t, etc.)
   * @param input The raw JSON string
   * @returns Cleaned JSON string
   */
  static cleanControlChars(input: string): string {
    // Remove unescaped control characters (0x00-0x1F except \n, \r, \t)
    // This regex replaces control chars not preceded by a backslash
    return input.replace(/([^\\])([\x00-\x09\x0B\x0C\x0E-\x1F])/g, '$1');
  }

  /**
   * Fixes an array of such objects (e.g., from a file with multiple lines)
   */
  static fixArray(input: string): any[] {
    const lines = input.split(/\r?\n/).filter(l => l.trim());
    const result: any[] = [];
    for (const line of lines) {
      const fixed = JsonFixer.fix(line);
      if (fixed) result.push(fixed);
    }
    return result;
  }
}
