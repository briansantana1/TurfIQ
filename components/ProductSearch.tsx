import Colors from '@/constants/Colors';
import { SPREADER_SETTINGS, SpreaderSettingEntry } from '@/data/spreaderDatabase';
import { fuzzySearchProducts, getAutocompleteSuggestions, highlightMatch } from '@/utils/fuzzyMatch';
import { Search, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface ProductSearchProps {
    onProductSelect?: (product: SpreaderSettingEntry) => void;
}

export default function ProductSearch({ onProductSelect }: ProductSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Get unique products from settings
    const uniqueProducts = useMemo(() => {
        const productMap = new Map<string, SpreaderSettingEntry>();
        SPREADER_SETTINGS.forEach(setting => {
            if (!productMap.has(setting.productName)) {
                productMap.set(setting.productName, setting);
            }
        });
        return Array.from(productMap.values());
    }, []);

    // Search results with fuzzy matching
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) {
            return [];
        }
        return fuzzySearchProducts(searchQuery, uniqueProducts, 0.3);
    }, [searchQuery, uniqueProducts]);

    // Autocomplete suggestions
    const suggestions = useMemo(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            return [];
        }
        return getAutocompleteSuggestions(searchQuery, uniqueProducts, 5);
    }, [searchQuery, uniqueProducts]);

    const handleClearSearch = () => {
        setSearchQuery('');
        setShowSuggestions(false);
    };

    const handleSuggestionPress = (suggestion: string) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
    };

    const handleProductPress = (product: SpreaderSettingEntry) => {
        onProductSelect?.(product);
    };

    const renderHighlightedText = (text: string, query: string) => {
        const parts = highlightMatch(text, query);
        return (
            <Text style={styles.productName}>
                {parts.map((part, index) => (
                    <Text
                        key={index}
                        style={part.isMatch ? styles.highlightedText : undefined}
                    >
                        {part.text}
                    </Text>
                ))}
            </Text>
        );
    };

    const renderProduct = ({ item }: { item: SpreaderSettingEntry }) => (
        <Pressable
            style={({ pressed }) => [
                styles.productItem,
                pressed && styles.productItemPressed,
            ]}
            onPress={() => handleProductPress(item)}
        >
            <View style={styles.productInfo}>
                {renderHighlightedText(item.productName, searchQuery)}
                <Text style={styles.productRate}>
                    Application Rate: {item.applicationRateLbsPer1K} lbs/1000 sq ft
                </Text>
                {item.notes && (
                    <Text style={styles.productNotes}>{item.notes}</Text>
                )}
            </View>
        </Pressable>
    );

    const renderSuggestion = ({ item }: { item: string }) => (
        <Pressable
            style={({ pressed }) => [
                styles.suggestionItem,
                pressed && styles.suggestionItemPressed,
            ]}
            onPress={() => handleSuggestionPress(item)}
        >
            <Search size={16} color={Colors.light.textSecondary} />
            <Text style={styles.suggestionText}>{item}</Text>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Search size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products (e.g., Milorganite, weed killer, lime)"
                    placeholderTextColor={Colors.light.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setShowSuggestions(true)}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={handleClearSearch} style={styles.clearButton}>
                        <X size={20} color={Colors.light.textSecondary} />
                    </Pressable>
                )}
            </View>

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <FlatList
                        data={suggestions}
                        renderItem={renderSuggestion}
                        keyExtractor={(item, index) => `suggestion-${index}`}
                        scrollEnabled={false}
                    />
                </View>
            )}

            {/* Search Results */}
            {searchQuery.trim().length > 0 && !showSuggestions && (
                <View style={styles.resultsContainer}>
                    {searchResults.length > 0 ? (
                        <>
                            <Text style={styles.resultsHeader}>
                                Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                            </Text>
                            <FlatList
                                data={searchResults}
                                renderItem={renderProduct}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                            />
                        </>
                    ) : (
                        <View style={styles.noResults}>
                            <Text style={styles.noResultsText}>No products found</Text>
                            <Text style={styles.noResultsSubtext}>
                                Try searching for:
                            </Text>
                            <Text style={styles.noResultsSubtext}>
                                • Fertilizer brands (Scotts, Milorganite, Pennington)
                            </Text>
                            <Text style={styles.noResultsSubtext}>
                                • Product types (weed killer, fungicide, lime)
                            </Text>
                            <Text style={styles.noResultsSubtext}>
                                • NPK ratios (32-0-4, 16-4-8)
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Empty State */}
            {searchQuery.trim().length === 0 && (
                <View style={styles.emptyState}>
                    <Search size={48} color={Colors.light.textSecondary} />
                    <Text style={styles.emptyStateText}>
                        Search 240+ lawn care products
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                        Find spreader settings for fertilizers, weed killers, fungicides, and more
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.light.text,
    },
    clearButton: {
        padding: 4,
    },
    suggestionsContainer: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: 16,
        overflow: 'hidden',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    suggestionItemPressed: {
        backgroundColor: Colors.light.background,
    },
    suggestionText: {
        marginLeft: 12,
        fontSize: 15,
        color: Colors.light.text,
    },
    resultsContainer: {
        flex: 1,
    },
    resultsHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        marginBottom: 12,
    },
    productItem: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    productItemPressed: {
        backgroundColor: Colors.light.background,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 4,
    },
    highlightedText: {
        backgroundColor: Colors.light.secondary + '30',
        color: Colors.light.secondary,
    },
    productRate: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 4,
    },
    productNotes: {
        fontSize: 13,
        color: Colors.light.textSecondary,
        fontStyle: 'italic',
    },
    noResults: {
        padding: 24,
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 12,
    },
    noResultsSubtext: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 4,
    },
    emptyState: {
        padding: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
});
