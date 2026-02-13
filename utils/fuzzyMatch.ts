// Fuzzy string matching utilities for product search
// Handles typos, partial matches, and autocomplete suggestions

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of edits needed to transform one string into another
 */
function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is perfect match)
 */
export function fuzzyMatch(query: string, target: string): number {
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase().trim();

    // Exact match
    if (q === t) return 1.0;

    // Contains query
    if (t.includes(q)) return 0.9;

    // Calculate similarity based on Levenshtein distance
    const distance = levenshteinDistance(q, t);
    const maxLength = Math.max(q.length, t.length);
    const similarity = 1 - (distance / maxLength);

    return similarity;
}

/**
 * Search products by name with fuzzy matching
 * Returns products sorted by relevance
 */
export interface SearchableProduct {
    productName: string;
    [key: string]: any;
}

export function fuzzySearchProducts<T extends SearchableProduct>(
    query: string,
    products: T[],
    threshold: number = 0.3
): T[] {
    if (!query || query.trim().length === 0) {
        return products;
    }

    const scoredProducts = products.map(product => ({
        product,
        score: fuzzyMatch(query, product.productName)
    }));

    // Filter by threshold and sort by score
    return scoredProducts
        .filter(item => item.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
}

/**
 * Get autocomplete suggestions based on partial query
 */
export function getAutocompleteSuggestions(
    query: string,
    products: SearchableProduct[],
    maxSuggestions: number = 5
): string[] {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const uniqueNames = new Set<string>();
    products.forEach(p => uniqueNames.add(p.productName));

    const suggestions = fuzzySearchProducts(
        query,
        Array.from(uniqueNames).map(name => ({ productName: name })),
        0.4
    );

    return suggestions
        .slice(0, maxSuggestions)
        .map(s => s.productName);
}

/**
 * Highlight matching text in a string
 */
export function highlightMatch(text: string, query: string): { text: string; isMatch: boolean }[] {
    if (!query || query.trim().length === 0) {
        return [{ text, isMatch: false }];
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase().trim();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
        return [{ text, isMatch: false }];
    }

    const parts: { text: string; isMatch: boolean }[] = [];

    if (index > 0) {
        parts.push({ text: text.substring(0, index), isMatch: false });
    }

    parts.push({
        text: text.substring(index, index + lowerQuery.length),
        isMatch: true
    });

    if (index + lowerQuery.length < text.length) {
        parts.push({
            text: text.substring(index + lowerQuery.length),
            isMatch: false
        });
    }

    return parts;
}
