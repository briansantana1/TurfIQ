import Colors from '@/constants/Colors';
import { useZones, Zone } from '@/context/ZoneContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ChevronLeft,
    History as HistoryIcon,
    MapPin,
    Package,
    Trash2
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HistoryItem {
    id: string;
    date: string;
    productType: 'granular' | 'liquid';
    sqft: number;
    rate: number;
    result: string;
    zoneName?: string;
}

export default function CalculateScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ tab?: string }>();
    const { zones } = useZones();

    useEffect(() => {
        // Param handling logic
    }, [params]);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [sqft, setSqft] = useState('');
    const [coverageRate, setCoverageRate] = useState(''); // For granular: sq ft / bag, For liquid: fl oz / 1K
    const [bagWeight, setBagWeight] = useState(''); // For granular: lbs/bag
    const [price, setPrice] = useState('');
    const [productType, setProductType] = useState<'granular' | 'liquid'>('granular');
    const [showResult, setShowResult] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Liquid specific
    const [tankSize, setTankSize] = useState('4'); // gallons
    const [sprayVolume, setSprayVolume] = useState('1'); // gal / 1K

    // Load history
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const savedHistory = await AsyncStorage.getItem('calc_history');
                if (savedHistory) {
                    setHistory(JSON.parse(savedHistory));
                }
            } catch (e) {
                console.error('Failed to load history', e);
            }
        };
        loadHistory();
    }, []);

    // Save history
    useEffect(() => {
        const saveHistory = async () => {
            try {
                await AsyncStorage.setItem('calc_history', JSON.stringify(history));
            } catch (e) {
                console.error('Failed to save history', e);
            }
        };
        if (history.length > 0) saveHistory();
    }, [history]);

    // Update sqft when a zone is selected
    useEffect(() => {
        if (selectedZone) {
            setSqft(selectedZone.areaSqFt.toString());
        }
    }, [selectedZone]);

    const calculate = () => {
        if (!sqft || !coverageRate) return;
        setShowResult(true);

        const newItem: HistoryItem = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            productType,
            sqft: parseFloat(sqft),
            rate: parseFloat(coverageRate),
            result: productType === 'granular'
                ? `${(parseFloat(sqft) / parseFloat(coverageRate)).toFixed(1)} Bags`
                : `${((parseFloat(sqft) / 1000) * parseFloat(coverageRate)).toFixed(1)} fl oz`,
            zoneName: selectedZone?.name
        };

        setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
    };

    const clearHistory = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all calculation history?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setHistory([]);
                        await AsyncStorage.removeItem('calc_history');
                    }
                }
            ]
        );
    };

    const sqftNum = parseFloat(sqft) || 0;
    const rateNum = parseFloat(coverageRate) || 0;
    const bagWeightNum = parseFloat(bagWeight) || 0;
    const priceNum = parseFloat(price) || 0;
    const tankSizeNum = parseFloat(tankSize) || 0;
    const sprayVolNum = parseFloat(sprayVolume) || 1;

    // Granular Logic
    const bagsNeeded = rateNum > 0 ? sqftNum / rateNum : 0;
    const fullBags = Math.floor(bagsNeeded);
    const partialBag = bagsNeeded - fullBags;
    const totalWeight = bagWeightNum * bagsNeeded;
    const appRateLbs = bagWeightNum > 0 ? (totalWeight / sqftNum) * 1000 : 0;
    const costPer1K = priceNum > 0 ? (priceNum * (productType === 'granular' ? Math.ceil(bagsNeeded) : bagsNeeded) / sqftNum) * 1000 : 0;
    const totalCost = priceNum * (productType === 'granular' ? Math.ceil(bagsNeeded) : 1); // Simplified for liquid (assuming 1 bottle)

    // Liquid Logic
    const totalOzNeeded = (sqftNum / 1000) * rateNum;
    const totalSprayVolume = (sqftNum / 1000) * sprayVolNum;
    const tankFills = tankSizeNum > 0 ? totalSprayVolume / tankSizeNum : 0;

    const getWarning = () => {
        if (productType === 'granular') {
            if (appRateLbs > 6) return { level: 'danger', text: '⚠️ High application rate — risk of burning lawn', color: Colors.light.danger };
            if (appRateLbs > 4.5) return { level: 'caution', text: '⚡ Slightly above typical rate — apply carefully', color: Colors.light.caution };
            if (appRateLbs > 0) return { level: 'safe', text: '✅ Application rate looks good', color: Colors.light.safe };
        } else {
            if (rateNum > 15) return { level: 'danger', text: '⚠️ Heavy application rate — ensure product is safe', color: Colors.light.danger };
            if (rateNum > 0) return { level: 'safe', text: '✅ Liquid application rate looks reasonable', color: Colors.light.safe };
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <Pressable onPress={() => {
                                if (router.canGoBack()) {
                                    router.back();
                                } else {
                                    router.navigate('/');
                                }
                            }} style={styles.backButton}>
                                <ChevronLeft size={24} color={Colors.light.text} />
                            </Pressable>
                            <View>
                                <Text style={styles.title}>Calculate</Text>
                                <Text style={styles.subtitle}>How much product do you need?</Text>
                            </View>
                        </View>
                    </View>

                    {/* Zone Selector */}
                    {zones.length > 0 && (
                        <View style={styles.zoneSelector}>
                            <Text style={styles.sectionLabel}>SELECT SAVED ZONE</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zoneScroll}>
                                {zones.map((zone) => (
                                    <Pressable
                                        key={zone.id}
                                        style={[
                                            styles.zoneButton,
                                            selectedZone?.id === zone.id && styles.zoneButtonActive,
                                            { borderColor: zone.color + '40' }
                                        ]}
                                        onPress={() => setSelectedZone(zone)}
                                    >
                                        <MapPin size={14} color={selectedZone?.id === zone.id ? '#FFF' : zone.color} />
                                        <Text style={[
                                            styles.zoneButtonText,
                                            selectedZone?.id === zone.id && styles.zoneButtonTextActive
                                        ]}>
                                            {zone.name}
                                        </Text>
                                    </Pressable>
                                ))}
                                <Pressable
                                    style={[styles.zoneButton, !selectedZone && styles.zoneButtonActive]}
                                    onPress={() => setSelectedZone(null)}
                                >
                                    <Text style={[styles.zoneButtonText, !selectedZone && styles.zoneButtonTextActive]}>
                                        Custom
                                    </Text>
                                </Pressable>
                            </ScrollView>
                        </View>
                    )}

                    {/* Product Type Toggle */}
                    <View style={styles.toggleContainer}>
                        <Pressable
                            style={[
                                styles.toggleButton,
                                productType === 'granular' && styles.toggleActive,
                            ]}
                            onPress={() => { setProductType('granular'); setShowResult(false); }}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    productType === 'granular' && styles.toggleTextActive,
                                ]}
                            >
                                Granular
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.toggleButton,
                                productType === 'liquid' && styles.toggleActive,
                            ]}
                            onPress={() => { setProductType('liquid'); setShowResult(false); }}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    productType === 'liquid' && styles.toggleTextActive,
                                ]}
                            >
                                Liquid
                            </Text>
                        </Pressable>
                    </View>

                    {/* Input Card */}
                    <View style={styles.inputCard}>
                        <Text style={styles.inputCardTitle}>Lawn Area</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 5000"
                                value={sqft}
                                onChangeText={(v) => { setSqft(v); setSelectedZone(null); }}
                                keyboardType="numeric"
                                placeholderTextColor={Colors.light.textMuted}
                            />
                            <View style={styles.unitBadge}>
                                <Text style={styles.unitText}>sq ft</Text>
                            </View>
                        </View>
                    </View>

                    {productType === 'granular' ? (
                        <>
                            <View style={styles.inputCard}>
                                <Text style={styles.inputCardTitle}>Product Coverage Rate</Text>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 5000"
                                        value={coverageRate}
                                        onChangeText={setCoverageRate}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.light.textMuted}
                                    />
                                    <View style={styles.unitBadge}>
                                        <Text style={styles.unitText}>sq ft / bag</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputCard}>
                                <Text style={styles.inputCardTitle}>Bag Weight (optional)</Text>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 12.5"
                                        value={bagWeight}
                                        onChangeText={setBagWeight}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.light.textMuted}
                                    />
                                    <View style={styles.unitBadge}>
                                        <Text style={styles.unitText}>lbs</Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.inputCard}>
                                <Text style={styles.inputCardTitle}>Application Rate</Text>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 3.0"
                                        value={coverageRate}
                                        onChangeText={setCoverageRate}
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.light.textMuted}
                                    />
                                    <View style={styles.unitBadge}>
                                        <Text style={styles.unitText}>fl oz / 1K</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputRowContainer}>
                                <View style={[styles.inputCard, { flex: 1, marginRight: 8, marginHorizontal: 0, marginLeft: 20 }]}>
                                    <Text style={styles.inputCardTitle}>Tank Size</Text>
                                    <View style={styles.inputRow}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="4"
                                            value={tankSize}
                                            onChangeText={setTankSize}
                                            keyboardType="numeric"
                                            placeholderTextColor={Colors.light.textMuted}
                                        />
                                        <View style={styles.unitBadge}>
                                            <Text style={styles.unitText}>gal</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.inputCard, { flex: 1, marginHorizontal: 0, marginRight: 20 }]}>
                                    <Text style={styles.inputCardTitle}>Spray Vol.</Text>
                                    <View style={styles.inputRow}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="1"
                                            value={sprayVolume}
                                            onChangeText={setSprayVolume}
                                            keyboardType="numeric"
                                            placeholderTextColor={Colors.light.textMuted}
                                        />
                                        <View style={styles.unitBadge}>
                                            <Text style={styles.unitText}>gal / 1K</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}

                    <View style={styles.inputCard}>
                        <Text style={styles.inputCardTitle}>Price per {productType === 'granular' ? 'Bag' : 'Bottle'}</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 24.99"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                placeholderTextColor={Colors.light.textMuted}
                            />
                            <View style={styles.unitBadge}>
                                <Text style={styles.unitText}>$</Text>
                            </View>
                        </View>
                    </View>

                    {/* Calculate Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.calculateButton,
                            pressed && styles.calculateButtonPressed,
                            (!sqft || !coverageRate) && styles.calculateButtonDisabled,
                        ]}
                        onPress={calculate}
                        disabled={!sqft || !coverageRate}
                    >
                        <Package size={20} color="#FFF" />
                        <Text style={styles.calculateButtonText}>Calculate</Text>
                    </Pressable>

                    {/* Results */}
                    {showResult && sqftNum > 0 && rateNum > 0 && (
                        <View style={styles.resultCard}>
                            <Text style={styles.resultTitle}>RESULTS</Text>

                            {productType === 'granular' ? (
                                <>
                                    <View style={styles.bagsRow}>
                                        {Array.from({ length: fullBags }, (_, i) => (
                                            <View key={`full-${i}`} style={styles.bagFull}>
                                                <Package size={24} color={Colors.light.primary} />
                                                <Text style={styles.bagLabel}>Full</Text>
                                            </View>
                                        ))}
                                        {partialBag > 0.05 && (
                                            <View style={styles.bagPartial}>
                                                <Package size={24} color={Colors.light.accent} />
                                                <Text style={styles.bagLabel}>
                                                    {Math.round(partialBag * 100)}%
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.resultBags}>
                                        {bagsNeeded.toFixed(1)} bags total ({Math.ceil(bagsNeeded)} to purchase)
                                    </Text>
                                </>
                            ) : (
                                <View style={styles.liquidResults}>
                                    <View style={styles.liquidMainResult}>
                                        <Text style={styles.liquidResultLabel}>Product Needed</Text>
                                        <Text style={styles.liquidResultValue}>{totalOzNeeded.toFixed(1)} <Text style={styles.liquidResultUnit}>fl oz</Text></Text>
                                    </View>
                                    <View style={styles.liquidSubResult}>
                                        <Text style={styles.liquidResultLabel}>Total Spray Mixture</Text>
                                        <Text style={styles.liquidResultValueSmall}>{totalSprayVolume.toFixed(1)} <Text style={styles.liquidResultUnitSmall}>gal</Text></Text>
                                    </View>
                                    <View style={styles.liquidSubResult}>
                                        <Text style={styles.liquidResultLabel}>Tank Fills (@ {tankSize} gal)</Text>
                                        <Text style={styles.liquidResultValueSmall}>{tankFills.toFixed(1)} <Text style={styles.liquidResultUnitSmall}>fills</Text></Text>
                                    </View>
                                </View>
                            )}

                            {/* Stats Row */}
                            <View style={styles.statsRow}>
                                {productType === 'granular' && appRateLbs > 0 && (
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>
                                            {appRateLbs.toFixed(1)}
                                        </Text>
                                        <Text style={styles.statLabel}>lbs / 1K sq ft</Text>
                                    </View>
                                )}
                                {costPer1K > 0 && (
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>
                                            ${costPer1K.toFixed(2)}
                                        </Text>
                                        <Text style={styles.statLabel}>cost / 1K sq ft</Text>
                                    </View>
                                )}
                                {totalCost > 0 && (
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>
                                            ${totalCost.toFixed(2)}
                                        </Text>
                                        <Text style={styles.statLabel}>total cost</Text>
                                    </View>
                                )}
                            </View>

                            {/* Warning */}
                            {getWarning() && (
                                <View
                                    style={[
                                        styles.warningRow,
                                        {
                                            backgroundColor:
                                                getWarning()!.level === 'safe'
                                                    ? Colors.light.safeBg
                                                    : getWarning()!.level === 'caution'
                                                        ? Colors.light.cautionBg
                                                        : Colors.light.dangerBg,
                                        },
                                    ]}
                                >
                                    <Text style={styles.warningText}>
                                        {getWarning()!.text}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* History Section */}
                    {history.length > 0 && (
                        <View style={styles.historyContainer}>
                            <View style={styles.historyHeader}>
                                <View style={styles.historyTitleRow}>
                                    <HistoryIcon size={16} color={Colors.light.textSecondary} />
                                    <Text style={styles.historyTitle}>RECENT CALCULATIONS</Text>
                                </View>
                                <Pressable onPress={clearHistory} hitSlop={10}>
                                    <Trash2 size={16} color={Colors.light.danger} />
                                </Pressable>
                            </View>
                            {history.map((item) => (
                                <View key={item.id} style={styles.historyCard}>
                                    <View style={styles.historyLeft}>
                                        <Text style={styles.historyDate}>{item.date}</Text>
                                        <Text style={styles.historyDetail}>
                                            {item.sqft.toLocaleString()} sq ft • {item.zoneName || 'Custom'}
                                        </Text>
                                        <Text style={styles.historySubDetail}>
                                            {item.productType.charAt(0).toUpperCase() + item.productType.slice(1)} • {item.rate} {item.productType === 'granular' ? 'sq ft/bag' : 'oz/1K'}
                                        </Text>
                                    </View>
                                    <View style={styles.historyRight}>
                                        <Text style={styles.historyResultText}>{item.result}</Text>
                                    </View>
                                </View>
                            ))}
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
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
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
    sectionLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.light.textMuted,
        letterSpacing: 1,
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    zoneSelector: {
        marginBottom: 20,
    },
    zoneScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    zoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    zoneButtonActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    zoneButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.light.textSecondary,
    },
    zoneButtonTextActive: {
        color: '#FFF',
    },
    toggleContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    toggleActive: {
        backgroundColor: Colors.light.primary,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.textMuted,
    },
    toggleTextActive: {
        color: '#FFF',
    },
    inputCard: {
        marginHorizontal: 20,
        marginBottom: 14,
    },
    inputCardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        marginBottom: 6,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.light.text,
        fontWeight: '600',
    },
    unitBadge: {
        backgroundColor: Colors.light.surfaceAlt,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    unitText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.light.textMuted,
    },
    calculateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 20,
        backgroundColor: Colors.light.primary,
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 8,
        marginBottom: 24,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    calculateButtonPressed: {
        opacity: 0.9,
    },
    calculateButtonDisabled: {
        opacity: 0.5,
    },
    calculateButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    resultCard: {
        marginHorizontal: 20,
        backgroundColor: Colors.light.surface,
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    resultTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.light.primary,
        letterSpacing: 1,
        marginBottom: 16,
    },
    bagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    bagFull: {
        width: 60,
        height: 68,
        backgroundColor: Colors.light.safeBg,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.safe,
    },
    bagPartial: {
        width: 60,
        height: 68,
        backgroundColor: Colors.light.cautionBg,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.caution,
    },
    bagLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.light.textSecondary,
        marginTop: 4,
    },
    resultBags: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.light.text,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.light.textMuted,
        marginTop: 2,
    },
    warningRow: {
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    warningText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.light.textSecondary,
    },
    inputRowContainer: {
        flexDirection: 'row',
        marginBottom: 14,
    },
    liquidResults: {
        marginBottom: 20,
        gap: 12,
    },
    liquidMainResult: {
        backgroundColor: Colors.light.surfaceAlt,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    liquidSubResult: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingHorizontal: 4,
    },
    liquidResultLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.light.textSecondary,
    },
    liquidResultValue: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.light.primary,
        marginTop: 4,
    },
    liquidResultUnit: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.textMuted,
    },
    liquidResultValueSmall: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.light.text,
    },
    liquidResultUnitSmall: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.textMuted,
    },
    // History
    historyContainer: {
        marginTop: 32,
        paddingHorizontal: 20,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    historyTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    historyTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.light.textMuted,
        letterSpacing: 1,
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.light.surface,
        padding: 16,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.light.borderLight,
    },
    historyLeft: {
        flex: 1,
    },
    historyDate: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.light.textMuted,
        marginBottom: 2,
    },
    historyDetail: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
    },
    historySubDetail: {
        fontSize: 11,
        color: Colors.light.textSecondary,
        marginTop: 2,
    },
    historyRight: {
        alignItems: 'flex-end',
    },
    historyResultText: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.light.primary,
    },
    bottomSpacer: {
        height: 20,
    },
});
