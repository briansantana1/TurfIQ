import ProductSearch from '@/components/ProductSearch';
import Colors from '@/constants/Colors';
import {
    SPREADER_BRANDS as DB_BRANDS,
    getSettingsForModel,
    getTotalBrands,
    getTotalModels,
    getTotalSettings,
    SPREADER_SETTINGS,
    SpreaderBrand,
    SpreaderModel
} from '@/data/spreaderDatabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ChevronLeft,
    ChevronRight,
    DollarSign,
    FlaskConical,
    Info,
    Search,
    Shield,
    Target
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FREE_BRAND_IDS = ['scotts', 'earthway', 'lesco'];

type ToolTab = 'search' | 'spreader' | 'npk' | 'cost';

export default function ToolsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ tab?: string }>();
    const [activeTab, setActiveTab] = useState<ToolTab>('search');

    useEffect(() => {
        if (params.tab === 'search' || params.tab === 'spreader' || params.tab === 'npk' || params.tab === 'cost') {
            setActiveTab(params.tab as ToolTab);
        }
    }, [params.tab]);
    const [searchQuery, setSearchQuery] = useState('');
    const [npkInput, setNpkInput] = useState({ n: '', p: '', k: '' });

    // Drill-down state
    const [selectedBrand, setSelectedBrand] = useState<SpreaderBrand | null>(null);
    const [selectedModel, setSelectedModel] = useState<SpreaderModel | null>(null);

    const brandsWithMeta = useMemo(() => {
        return DB_BRANDS.map((brand) => {
            const settingsCount = brand.models.reduce(
                (sum, m) => sum + getSettingsForModel(m.id).length,
                0
            );
            return {
                ...brand,
                settingsCount,
                free: FREE_BRAND_IDS.includes(brand.id),
            };
        });
    }, []);

    const filteredBrands = brandsWithMeta.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBack = () => {
        if (selectedModel) {
            setSelectedModel(null);
        } else if (selectedBrand) {
            setSelectedBrand(null);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.headerTitleRow}>
                        {activeTab === 'spreader' && (selectedBrand || selectedModel) ? (
                            <Pressable onPress={handleBack} style={styles.backButton}>
                                <ChevronLeft size={24} color={Colors.light.text} />
                            </Pressable>
                        ) : (
                            router.canGoBack() && (
                                <Pressable onPress={() => router.back()} style={styles.backButton}>
                                    <ChevronLeft size={24} color={Colors.light.text} />
                                </Pressable>
                            )
                        )}
                        <View>
                            <Text style={styles.title}>
                                {selectedModel ? selectedModel.name : selectedBrand ? selectedBrand.name : 'Tools'}
                            </Text>
                            <Text style={styles.subtitle}>
                                {selectedModel ? 'Spreader Settings' : selectedBrand ? 'Select Spreader Model' : 'Spreader settings, NPK decoder & more'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tool Tabs - Only show when at root */}
                {!selectedBrand && !selectedModel && (
                    <View style={styles.tabRow}>
                        <Pressable
                            style={[styles.tab, activeTab === 'search' && styles.tabActive]}
                            onPress={() => setActiveTab('search')}
                        >
                            <Search size={16} color={activeTab === 'search' ? '#FFF' : Colors.light.textMuted} />
                            <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>Search</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tab, activeTab === 'spreader' && styles.tabActive]}
                            onPress={() => setActiveTab('spreader')}
                        >
                            <Target size={16} color={activeTab === 'spreader' ? '#FFF' : Colors.light.textMuted} />
                            <Text style={[styles.tabText, activeTab === 'spreader' && styles.tabTextActive]}>Spreader</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tab, activeTab === 'npk' && styles.tabActive]}
                            onPress={() => setActiveTab('npk')}
                        >
                            <FlaskConical size={16} color={activeTab === 'npk' ? '#FFF' : Colors.light.textMuted} />
                            <Text style={[styles.tabText, activeTab === 'npk' && styles.tabTextActive]}>NPK</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tab, activeTab === 'cost' && styles.tabActive]}
                            onPress={() => setActiveTab('cost')}
                        >
                            <DollarSign size={16} color={activeTab === 'cost' ? '#FFF' : Colors.light.textMuted} />
                            <Text style={[styles.tabText, activeTab === 'cost' && styles.tabTextActive]}>Cost</Text>
                        </Pressable>
                    </View>
                )}

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Product Search */}
                    {activeTab === 'search' && (
                        <View>
                            <View style={styles.infoBanner}>
                                <Search size={18} color={Colors.light.primary} />
                                <View style={styles.infoBannerText}>
                                    <Text style={styles.infoBannerTitle}>
                                        Search 240+ Lawn Care Products
                                    </Text>
                                    <Text style={styles.infoBannerSubtitle}>
                                        Find spreader settings for any fertilizer, weed killer, or specialty product
                                    </Text>
                                </View>
                            </View>
                            <ProductSearch />
                        </View>
                    )}

                    {/* Spreader Database */}
                    {activeTab === 'spreader' && (
                        <View>
                            {!selectedBrand && !selectedModel && (
                                <>
                                    {/* Info Banner */}
                                    <View style={styles.infoBanner}>
                                        <Shield size={18} color={Colors.light.primary} />
                                        <View style={styles.infoBannerText}>
                                            <Text style={styles.infoBannerTitle}>
                                                {getTotalBrands()} brands · {getTotalModels()} models · {getTotalSettings()} settings
                                            </Text>
                                            <Text style={styles.infoBannerSubtitle}>
                                                The most comprehensive database in any app
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Search */}
                                    <View style={styles.searchContainer}>
                                        <Search size={18} color={Colors.light.textMuted} />
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholder="Search spreader brands..."
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                            placeholderTextColor={Colors.light.textMuted}
                                        />
                                    </View>

                                    {/* Brand List */}
                                    {filteredBrands.map((brand) => (
                                        <Pressable
                                            key={brand.id}
                                            style={({ pressed }) => [
                                                styles.brandCard,
                                                pressed && { opacity: 0.85 },
                                            ]}
                                            onPress={() => setSelectedBrand(brand)}
                                        >
                                            <View style={styles.brandLeft}>
                                                <View
                                                    style={[
                                                        styles.brandIcon,
                                                        {
                                                            backgroundColor: brand.free
                                                                ? Colors.light.safeBg
                                                                : Colors.light.highBg,
                                                        },
                                                    ]}
                                                >
                                                    <Text style={styles.brandInitial}>
                                                        {brand.name.charAt(0)}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text style={styles.brandName}>{brand.name}</Text>
                                                    <Text style={styles.brandModels}>
                                                        {brand.models.length} models · {brand.settingsCount} settings
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.brandRight}>
                                                {brand.free ? (
                                                    <View style={styles.freeBadge}>
                                                        <Text style={styles.freeBadgeText}>FREE</Text>
                                                    </View>
                                                ) : (
                                                    <View style={styles.proBadge}>
                                                        <Text style={styles.proBadgeText}>PRO</Text>
                                                    </View>
                                                )}
                                                <ChevronRight size={16} color={Colors.light.textMuted} />
                                            </View>
                                        </Pressable>
                                    ))}
                                </>
                            )}

                            {/* Model List View */}
                            {selectedBrand && !selectedModel && (
                                <View style={styles.detailContainer}>
                                    {selectedBrand.models.map((model) => (
                                        <Pressable
                                            key={model.id}
                                            style={styles.modelCard}
                                            onPress={() => setSelectedModel(model)}
                                        >
                                            <View>
                                                <Text style={styles.modelName}>{model.name}</Text>
                                                <Text style={styles.modelMeta}>{getSettingsForModel(model.id).length} settings available</Text>
                                            </View>
                                            <ChevronRight size={18} color={Colors.light.textMuted} />
                                        </Pressable>
                                    ))}
                                </View>
                            )}

                            {/* Settings List View */}
                            {selectedModel && (
                                <View style={styles.detailContainer}>
                                    {getSettingsForModel(selectedModel.id).map((setting) => (
                                        <View key={setting.id} style={styles.settingCard}>
                                            <View style={styles.settingInfo}>
                                                <Text style={styles.productName}>{setting.productName}</Text>
                                                <View style={styles.settingMetaRow}>
                                                    <View style={[styles.confidenceBadge, { backgroundColor: setting.confidence === 'official' ? Colors.light.safeBg : Colors.light.highBg }]}>
                                                        <Text style={[styles.confidenceText, { color: setting.confidence === 'official' ? Colors.light.primary : Colors.light.info }]}>
                                                            {setting.confidence.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <Text style={styles.rateText}>{setting.applicationRateLbsPer1K} lbs/1K</Text>
                                                </View>
                                            </View>
                                            <View style={styles.settingValueContainer}>
                                                <Text style={styles.settingLabel}>SETTING</Text>
                                                <Text style={styles.settingValue}>{setting.settingValue}</Text>
                                            </View>
                                        </View>
                                    ))}
                                    {getSettingsForModel(selectedModel.id).length === 0 && (
                                        <View style={styles.emptyState}>
                                            <Info size={40} color={Colors.light.textMuted} />
                                            <Text style={styles.emptyText}>No specific settings found for this model yet. Try searching for a different model.</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    )}

                    {/* NPK Decoder */}
                    {activeTab === 'npk' && (
                        <View>
                            <View style={styles.npkHeader}>
                                <Text style={styles.npkTitle}>NPK Decoder</Text>
                                <Text style={styles.npkSubtitle}>
                                    Enter the three numbers from your fertilizer bag
                                </Text>
                            </View>

                            <View style={styles.npkInputRow}>
                                <View style={styles.npkInputGroup}>
                                    <Text style={[styles.npkLabel, { color: Colors.light.primary }]}>N</Text>
                                    <TextInput
                                        style={[styles.npkInput, { borderColor: Colors.light.primary }]}
                                        value={npkInput.n}
                                        onChangeText={(v) => setNpkInput({ ...npkInput, n: v })}
                                        keyboardType="numeric"
                                        placeholder="32"
                                        placeholderTextColor={Colors.light.textMuted}
                                    />
                                    <Text style={styles.npkDesc}>Nitrogen</Text>
                                </View>
                                <Text style={styles.npkDash}>—</Text>
                                <View style={styles.npkInputGroup}>
                                    <Text style={[styles.npkLabel, { color: Colors.light.info }]}>P</Text>
                                    <TextInput
                                        style={[styles.npkInput, { borderColor: Colors.light.info }]}
                                        value={npkInput.p}
                                        onChangeText={(v) => setNpkInput({ ...npkInput, p: v })}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={Colors.light.textMuted}
                                    />
                                    <Text style={styles.npkDesc}>Phosphorus</Text>
                                </View>
                                <Text style={styles.npkDash}>—</Text>
                                <View style={styles.npkInputGroup}>
                                    <Text style={[styles.npkLabel, { color: Colors.light.accent }]}>K</Text>
                                    <TextInput
                                        style={[styles.npkInput, { borderColor: Colors.light.accent }]}
                                        value={npkInput.k}
                                        onChangeText={(v) => setNpkInput({ ...npkInput, k: v })}
                                        keyboardType="numeric"
                                        placeholder="4"
                                        placeholderTextColor={Colors.light.textMuted}
                                    />
                                    <Text style={styles.npkDesc}>Potassium</Text>
                                </View>
                            </View>

                            {parseFloat(npkInput.n) > 0 && (() => {
                                const n = parseFloat(npkInput.n) || 0;
                                const p = parseFloat(npkInput.p) || 0;
                                const k = parseFloat(npkInput.k) || 0;

                                // Determine fertilizer type and recommendations
                                let fertilizerType = '';
                                let recommendation = '';
                                let seasonalUse = '';
                                let applicationTip = '';

                                if (n >= 25) {
                                    fertilizerType = 'High Nitrogen';
                                    recommendation = 'Excellent for spring green-up and promoting lush, green growth';
                                    seasonalUse = 'Best for: Spring & Early Summer';
                                    applicationTip = 'Apply when grass is actively growing';
                                } else if (n >= 15 && k >= 10) {
                                    fertilizerType = 'Balanced Fertilizer';
                                    recommendation = 'All-purpose fertilizer for general lawn maintenance';
                                    seasonalUse = 'Best for: Any Season';
                                    applicationTip = 'Great for regular feeding throughout the year';
                                } else if (k > n && k >= 10) {
                                    fertilizerType = 'Fall Winterizer';
                                    recommendation = 'High potassium helps prepare lawn for winter stress';
                                    seasonalUse = 'Best for: Late Fall';
                                    applicationTip = 'Apply 4-6 weeks before first frost';
                                } else if (p >= 10) {
                                    fertilizerType = 'Starter Fertilizer';
                                    recommendation = 'High phosphorus promotes root development for new lawns';
                                    seasonalUse = 'Best for: New Lawn Establishment';
                                    applicationTip = 'Apply when seeding or sodding';
                                } else if (n >= 10) {
                                    fertilizerType = 'Moderate Nitrogen';
                                    recommendation = 'Good for steady growth without excessive top growth';
                                    seasonalUse = 'Best for: Summer Maintenance';
                                    applicationTip = 'Apply during active growing season';
                                } else {
                                    fertilizerType = 'Low Nitrogen';
                                    recommendation = 'Gentle feeding for established lawns';
                                    seasonalUse = 'Best for: Maintenance Feeding';
                                    applicationTip = 'Safe for frequent applications';
                                }

                                // Calculate application rate for 1 lb N per 1000 sq ft
                                const lbsPerThousand = n > 0 ? (1 / (n / 100)).toFixed(1) : '0';

                                // Find matching products
                                const matchingProducts = SPREADER_SETTINGS.filter(setting => {
                                    const productName = setting.productName.toLowerCase();
                                    const npkPattern = `${Math.round(n)}-${Math.round(p)}-${Math.round(k)}`;
                                    return productName.includes(npkPattern);
                                });

                                const uniqueProducts = Array.from(new Set(matchingProducts.map(s => s.productName)));

                                return (
                                    <View style={styles.npkResult}>
                                        {/* Analysis Bar */}
                                        <Text style={styles.npkResultTitle}>Analysis</Text>
                                        <View style={styles.npkBar}>
                                            <View style={[styles.npkBarSegment, { flex: n || 1, backgroundColor: Colors.light.primary }]} />
                                            <View style={[styles.npkBarSegment, { flex: p || 0.1, backgroundColor: Colors.light.info }]} />
                                            <View style={[styles.npkBarSegment, { flex: k || 0.1, backgroundColor: Colors.light.accent }]} />
                                        </View>
                                        <View style={styles.npkExplain}>
                                            <View style={styles.npkExplainRow}>
                                                <View style={[styles.npkDot, { backgroundColor: Colors.light.primary }]} />
                                                <Text style={styles.npkExplainText}>
                                                    <Text style={{ fontWeight: '700' }}>Nitrogen ({npkInput.n}%)</Text>
                                                    {' — Promotes leaf growth and green color'}
                                                </Text>
                                            </View>
                                            <View style={styles.npkExplainRow}>
                                                <View style={[styles.npkDot, { backgroundColor: Colors.light.info }]} />
                                                <Text style={styles.npkExplainText}>
                                                    <Text style={{ fontWeight: '700' }}>Phosphorus ({npkInput.p || '0'}%)</Text>
                                                    {' — Root development and flowering'}
                                                </Text>
                                            </View>
                                            <View style={styles.npkExplainRow}>
                                                <View style={[styles.npkDot, { backgroundColor: Colors.light.accent }]} />
                                                <Text style={styles.npkExplainText}>
                                                    <Text style={{ fontWeight: '700' }}>Potassium ({npkInput.k || '0'}%)</Text>
                                                    {' — Stress tolerance and disease resistance'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Recommendation Card */}
                                        <View style={styles.npkRecommendation}>
                                            <View style={styles.npkRecommendationHeader}>
                                                <Text style={styles.npkRecommendationType}>{fertilizerType}</Text>
                                                <View style={styles.npkSeasonBadge}>
                                                    <Text style={styles.npkSeasonText}>{seasonalUse.replace('Best for: ', '')}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.npkRecommendationText}>{recommendation}</Text>
                                            <Text style={styles.npkApplicationTip}>💡 {applicationTip}</Text>
                                        </View>

                                        {/* Application Calculator */}
                                        <View style={styles.npkCalculator}>
                                            <Text style={styles.npkCalculatorTitle}>Application Calculator</Text>
                                            <View style={styles.npkCalculatorRow}>
                                                <Text style={styles.npkCalculatorLabel}>To apply 1 lb of nitrogen per 1,000 sq ft:</Text>
                                                <Text style={styles.npkCalculatorValue}>{lbsPerThousand} lbs of product</Text>
                                            </View>
                                            <Text style={styles.npkCalculatorNote}>
                                                For a {5000} sq ft lawn, you'd need {(parseFloat(lbsPerThousand) * 5).toFixed(1)} lbs total
                                            </Text>
                                        </View>

                                        {/* Matching Products */}
                                        {uniqueProducts.length > 0 && (
                                            <View style={styles.npkProducts}>
                                                <Text style={styles.npkProductsTitle}>
                                                    Products with this ratio ({uniqueProducts.length})
                                                </Text>
                                                {uniqueProducts.slice(0, 3).map((productName, index) => (
                                                    <View key={index} style={styles.npkProductItem}>
                                                        <Text style={styles.npkProductName}>{productName}</Text>
                                                        <ChevronRight size={16} color={Colors.light.textSecondary} />
                                                    </View>
                                                ))}
                                                {uniqueProducts.length > 3 && (
                                                    <Pressable
                                                        style={styles.npkViewAllButton}
                                                        onPress={() => setActiveTab('search')}
                                                    >
                                                        <Text style={styles.npkViewAllText}>
                                                            View all {uniqueProducts.length} products
                                                        </Text>
                                                    </Pressable>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                );
                            })()}
                        </View>
                    )}

                    {/* Cost Calculator */}
                    {activeTab === 'cost' && (
                        <View style={styles.costContainer}>
                            <DollarSign size={40} color={Colors.light.textMuted} />
                            <Text style={styles.costTitle}>Cost Intelligence</Text>
                            <Text style={styles.costSubtitle}>
                                Compare cost per 1,000 sq ft across products.{'\n'}
                                Enter calculations first to see cost analysis.
                            </Text>
                        </View>
                    )}

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.light.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.light.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.textMuted,
        marginTop: 2,
    },
    tabRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: Colors.light.primary,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.light.textMuted,
    },
    tabTextActive: {
        color: '#FFF',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 20,
        backgroundColor: Colors.light.safeBg,
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.light.safe,
    },
    infoBannerText: {
        flex: 1,
    },
    infoBannerTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.light.primaryDark,
    },
    infoBannerSubtitle: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 20,
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: 14,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.light.text,
    },
    brandCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        backgroundColor: Colors.light.surface,
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.light.borderLight,
    },
    brandLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    brandIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandInitial: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.light.primary,
    },
    brandName: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.light.text,
    },
    brandModels: {
        fontSize: 12,
        color: Colors.light.textMuted,
        marginTop: 1,
    },
    brandRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    freeBadge: {
        backgroundColor: Colors.light.safeBg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    freeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.light.primary,
    },
    proBadge: {
        backgroundColor: Colors.light.highBg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    proBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.light.info,
    },
    // Drill down styles
    detailContainer: {
        paddingHorizontal: 20,
        gap: 8,
    },
    modelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.light.surface,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.light.borderLight,
    },
    modelName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.text,
    },
    modelMeta: {
        fontSize: 12,
        color: Colors.light.textMuted,
        marginTop: 4,
    },
    settingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.light.surface,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.light.borderLight,
    },
    settingInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
    },
    settingMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    confidenceBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    confidenceText: {
        fontSize: 9,
        fontWeight: '800',
    },
    rateText: {
        fontSize: 12,
        color: Colors.light.textMuted,
    },
    settingValueContainer: {
        alignItems: 'center',
        backgroundColor: Colors.light.surfaceAlt,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 70,
    },
    settingLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: Colors.light.textMuted,
        marginBottom: 2,
    },
    settingValue: {
        fontSize: 20,
        fontWeight: '900',
        color: Colors.light.primary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.light.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    // NPK
    npkHeader: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    npkTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    npkSubtitle: {
        fontSize: 13,
        color: Colors.light.textMuted,
    },
    npkInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    npkInputGroup: {
        alignItems: 'center',
        flex: 1,
    },
    npkLabel: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 6,
    },
    npkInput: {
        width: 72,
        height: 56,
        borderRadius: 14,
        borderWidth: 2,
        backgroundColor: Colors.light.surface,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '800',
        color: Colors.light.text,
    },
    npkDesc: {
        fontSize: 10,
        color: Colors.light.textMuted,
        marginTop: 6,
        fontWeight: '600',
    },
    npkDash: {
        fontSize: 20,
        color: Colors.light.textMuted,
        marginTop: 14,
    },
    npkResult: {
        marginHorizontal: 20,
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    npkResultTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 12,
    },
    npkBar: {
        flexDirection: 'row',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 16,
    },
    npkBarSegment: {
        minWidth: 4,
    },
    npkExplain: {
        gap: 10,
    },
    npkExplainRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    npkDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 4,
    },
    npkExplainText: {
        flex: 1,
        fontSize: 13,
        color: Colors.light.textSecondary,
        lineHeight: 18,
    },
    // Cost
    costContainer: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 40,
    },
    costTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginTop: 16,
        marginBottom: 8,
    },
    costSubtitle: {
        fontSize: 14,
        color: Colors.light.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    bottomSpacer: {
        height: 20,
    },
    // Enhanced NPK Decoder Styles
    npkRecommendation: {
        backgroundColor: Colors.light.primaryLight + '15',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: Colors.light.primary + '30',
    },
    npkRecommendationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    npkRecommendationType: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    npkSeasonBadge: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    npkSeasonText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.surface,
    },
    npkRecommendationText: {
        fontSize: 15,
        color: Colors.light.text,
        lineHeight: 22,
        marginBottom: 8,
    },
    npkApplicationTip: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontStyle: 'italic',
    },
    npkCalculator: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    npkCalculatorTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 12,
    },
    npkCalculatorRow: {
        marginBottom: 8,
    },
    npkCalculatorLabel: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 4,
    },
    npkCalculatorValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    npkCalculatorNote: {
        fontSize: 13,
        color: Colors.light.textMuted,
        marginTop: 8,
        fontStyle: 'italic',
    },
    npkProducts: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    npkProductsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 12,
    },
    npkProductItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    npkProductName: {
        fontSize: 14,
        color: Colors.light.text,
        flex: 1,
    },
    npkViewAllButton: {
        marginTop: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    npkViewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.primary,
    },
});
