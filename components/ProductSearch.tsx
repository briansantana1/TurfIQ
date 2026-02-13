import Colors from '@/constants/Colors';
import { getAllBrands, SPREADER_SETTINGS, SpreaderBrand, SpreaderSettingEntry } from '@/data/spreaderDatabase';
import { fuzzySearchProducts, getAutocompleteSuggestions, highlightMatch } from '@/utils/fuzzyMatch';
import { AlertCircle, ChevronRight, Search, Send, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
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
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({
        productName: '',
        whereToBuy: '',
        spreaderModel: '',
    });
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

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

    // Get all settings for selected product
    const selectedProductSettings = useMemo(() => {
        if (!selectedProduct) return [];
        return SPREADER_SETTINGS.filter(s => s.productName === selectedProduct);
    }, [selectedProduct]);

    // Group settings by brand
    const settingsByBrand = useMemo(() => {
        const brands = getAllBrands();
        const grouped = new Map<string, { brand: SpreaderBrand; settings: SpreaderSettingEntry[] }>();

        selectedProductSettings.forEach(setting => {
            const brand = brands.find(b => b.models.some(m => m.id === setting.spreaderModelId));
            if (brand) {
                if (!grouped.has(brand.id)) {
                    grouped.set(brand.id, { brand, settings: [] });
                }
                grouped.get(brand.id)!.settings.push(setting);
            }
        });

        return Array.from(grouped.values());
    }, [selectedProductSettings]);

    const handleClearSearch = () => {
        setSearchQuery('');
        setShowSuggestions(false);
    };

    const handleSuggestionPress = (suggestion: string) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
    };

    const handleProductPress = (productName: string) => {
        setSelectedProduct(productName);
    };

    const handleCloseModal = () => {
        setSelectedProduct(null);
    };

    const handleOpenRequestModal = () => {
        setShowRequestModal(true);
        // Pre-fill with search query if available
        if (searchQuery.trim()) {
            setRequestForm(prev => ({ ...prev, productName: searchQuery.trim() }));
        }
    };

    const handleCloseRequestModal = () => {
        setShowRequestModal(false);
        setRequestForm({ productName: '', whereToBuy: '', spreaderModel: '' });
    };

    const handleSubmitRequest = () => {
        if (!requestForm.productName.trim()) {
            Alert.alert('Missing Information', 'Please enter a product or spreader name.');
            return;
        }

        // TODO: Send to backend/email
        // For now, just show success message
        Alert.alert(
            'Request Submitted!',
            `Thanks for your request! We'll add "${requestForm.productName}" to our database soon.`,
            [
                {
                    text: 'OK',
                    onPress: handleCloseRequestModal,
                },
            ]
        );
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

    const renderProduct = ({ item }: { item: SpreaderSettingEntry }) => {
        const settingsCount = SPREADER_SETTINGS.filter(s => s.productName === item.productName).length;

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.productItem,
                    pressed && styles.productItemPressed,
                ]}
                onPress={() => handleProductPress(item.productName)}
            >
                <View style={styles.productInfo}>
                    {renderHighlightedText(item.productName, searchQuery)}
                    <Text style={styles.productRate}>
                        Application Rate: {item.applicationRateLbsPer1K} lbs/1000 sq ft
                    </Text>
                    {item.notes && (
                        <Text style={styles.productNotes}>{item.notes}</Text>
                    )}
                    <Text style={styles.settingsCount}>
                        {settingsCount} spreader setting{settingsCount !== 1 ? 's' : ''} available
                    </Text>
                </View>
                <ChevronRight size={20} color={Colors.light.textSecondary} />
            </Pressable>
        );
    };

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
                    placeholder="Search products (e.g., Headway G, Milorganite, Tenacity)"
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
                            <AlertCircle size={48} color={Colors.light.textSecondary} />
                            <Text style={styles.noResultsText}>No products found</Text>
                            <Text style={styles.noResultsSubtext}>
                                Can't find what you're looking for?
                            </Text>
                            <Pressable
                                style={styles.requestButton}
                                onPress={handleOpenRequestModal}
                            >
                                <Send size={18} color={Colors.light.surface} />
                                <Text style={styles.requestButtonText}>Request This Product</Text>
                            </Pressable>
                            <Text style={styles.noResultsHelp}>
                                Or try searching for:
                            </Text>
                            <Text style={styles.noResultsSubtext}>
                                • Professional products (Headway G, Tenacity, Acelepryn)
                            </Text>
                            <Text style={styles.noResultsSubtext}>
                                • Fertilizer brands (Scotts, Milorganite, Pennington)
                            </Text>
                            <Text style={styles.noResultsSubtext}>
                                • Product types (weed killer, fungicide, lime)
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
                        Search 280+ lawn care products
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                        Professional & consumer products from SiteOne, DoMyOwn, and major retailers
                    </Text>
                    <Pressable
                        style={styles.requestLinkButton}
                        onPress={handleOpenRequestModal}
                    >
                        <Text style={styles.requestLinkText}>Missing a product? Request it here</Text>
                    </Pressable>
                </View>
            )}

            {/* Product Details Modal */}
            <Modal
                visible={selectedProduct !== null}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderContent}>
                            <Text style={styles.modalTitle}>{selectedProduct}</Text>
                            <Text style={styles.modalSubtitle}>
                                {settingsByBrand.length} brand{settingsByBrand.length !== 1 ? 's' : ''} • {selectedProductSettings.length} setting{selectedProductSettings.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                        <Pressable onPress={handleCloseModal} style={styles.closeButton}>
                            <X size={24} color={Colors.light.text} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {settingsByBrand.map(({ brand, settings }) => (
                            <View key={brand.id} style={styles.brandSection}>
                                <Text style={styles.brandName}>{brand.name}</Text>
                                {settings.map(setting => {
                                    const model = brand.models.find(m => m.id === setting.spreaderModelId);
                                    return (
                                        <View key={setting.id} style={styles.settingCard}>
                                            <View style={styles.settingHeader}>
                                                <Text style={styles.modelName}>{model?.name}</Text>
                                                <Text style={styles.settingValue}>{setting.settingValue}</Text>
                                            </View>
                                            <Text style={styles.settingDetail}>
                                                Application Rate: {setting.applicationRateLbsPer1K} lbs/1000 sq ft
                                            </Text>
                                            {setting.notes && (
                                                <Text style={styles.settingNotes}>{setting.notes}</Text>
                                            )}
                                            <Text style={styles.settingSource}>
                                                Source: {setting.source} • {setting.confidence} confidence
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Modal>

            {/* Request Product Modal */}
            <Modal
                visible={showRequestModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCloseRequestModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderContent}>
                            <Text style={styles.modalTitle}>Request Product or Spreader</Text>
                            <Text style={styles.modalSubtitle}>
                                We'll add it to our database
                            </Text>
                        </View>
                        <Pressable onPress={handleCloseRequestModal} style={styles.closeButton}>
                            <X size={24} color={Colors.light.text} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.requestFormContainer}>
                            <Text style={styles.formLabel}>Product or Spreader Name *</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="e.g., Headway G, Scotts EdgeGuard Mini"
                                placeholderTextColor={Colors.light.textSecondary}
                                value={requestForm.productName}
                                onChangeText={(text) => setRequestForm(prev => ({ ...prev, productName: text }))}
                                autoFocus
                            />

                            <Text style={styles.formLabel}>Where to Buy (Optional)</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="e.g., SiteOne, DoMyOwn, Home Depot"
                                placeholderTextColor={Colors.light.textSecondary}
                                value={requestForm.whereToBuy}
                                onChangeText={(text) => setRequestForm(prev => ({ ...prev, whereToBuy: text }))}
                            />

                            <Text style={styles.formLabel}>Your Spreader Model (Optional)</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="e.g., Scotts EdgeGuard DLX"
                                placeholderTextColor={Colors.light.textSecondary}
                                value={requestForm.spreaderModel}
                                onChangeText={(text) => setRequestForm(prev => ({ ...prev, spreaderModel: text }))}
                            />

                            <View style={styles.formInfo}>
                                <AlertCircle size={16} color={Colors.light.primary} />
                                <Text style={styles.formInfoText}>
                                    We'll research and add this to our database. You'll see it in a future update!
                                </Text>
                            </View>

                            <Pressable
                                style={styles.submitButton}
                                onPress={handleSubmitRequest}
                            >
                                <Send size={20} color={Colors.light.surface} />
                                <Text style={styles.submitButtonText}>Submit Request</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
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
        flexDirection: 'row',
        alignItems: 'center',
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
        marginBottom: 4,
    },
    settingsCount: {
        fontSize: 13,
        color: Colors.light.primary,
        fontWeight: '600',
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
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        backgroundColor: Colors.light.surface,
    },
    modalHeaderContent: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    closeButton: {
        padding: 8,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    brandSection: {
        marginBottom: 24,
    },
    brandName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 12,
    },
    settingCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    settingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modelName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
        flex: 1,
    },
    settingValue: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    settingDetail: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 4,
    },
    settingNotes: {
        fontSize: 13,
        color: Colors.light.textSecondary,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    settingSource: {
        fontSize: 12,
        color: Colors.light.textMuted,
        marginTop: 4,
    },
    // Request Modal Styles
    requestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginVertical: 16,
        gap: 8,
    },
    requestButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.surface,
    },
    noResultsHelp: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginTop: 16,
        marginBottom: 8,
    },
    requestLinkButton: {
        marginTop: 16,
        padding: 8,
    },
    requestLinkText: {
        fontSize: 14,
        color: Colors.light.primary,
        textDecorationLine: 'underline',
    },
    requestFormContainer: {
        gap: 16,
    },
    formLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.light.text,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    formInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.light.primaryLight + '20',
        padding: 12,
        borderRadius: 8,
        gap: 8,
        marginTop: 8,
    },
    formInfoText: {
        flex: 1,
        fontSize: 13,
        color: Colors.light.text,
        lineHeight: 18,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.surface,
    },
});
