import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Pressable,
    FlatList,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    Map,
    Calculator,
    Layers,
    ChevronRight,
    Sparkles,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
    {
        id: '1',
        icon: Map,
        iconBg: Colors.light.safeBg,
        iconColor: Colors.light.primary,
        headline: 'Know your lawn\'s\nexact size',
        description:
            'Draw your lawn on a satellite map and get precise square footage instantly. No tape measure needed.',
        visual: '📐',
        accentColor: Colors.light.primary,
    },
    {
        id: '2',
        icon: Calculator,
        iconBg: Colors.light.highBg,
        iconColor: Colors.light.info,
        headline: 'Never buy the\nwrong amount',
        description:
            'Enter any fertilizer product and get exact bags needed, application rate, and cost — with over/under warnings.',
        visual: '🧮',
        accentColor: Colors.light.info,
    },
    {
        id: '3',
        icon: Layers,
        iconBg: Colors.light.cautionBg,
        iconColor: Colors.light.accent,
        headline: 'Perfect spreader\nsettings, every time',
        description:
            '20+ spreader brands, 50+ models. Find your exact setting in seconds — no more Googling or guessing.',
        visual: '⚙️',
        accentColor: Colors.light.accent,
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleNext = () => {
        if (currentIndex < ONBOARDING_SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
            setCurrentIndex(currentIndex + 1);
        } else {
            router.replace('/(tabs)');
        }
    };

    const handleSkip = () => {
        router.replace('/(tabs)');
    };

    const renderSlide = ({ item, index }: { item: typeof ONBOARDING_SLIDES[0]; index: number }) => {
        const Icon = item.icon;
        return (
            <View style={[styles.slide, { width }]}>
                {/* Big Visual */}
                <View style={styles.visualContainer}>
                    <View
                        style={[
                            styles.visualCircleOuter,
                            { borderColor: item.accentColor + '20' },
                        ]}
                    >
                        <View
                            style={[
                                styles.visualCircleInner,
                                { backgroundColor: item.iconBg },
                            ]}
                        >
                            <Icon size={64} color={item.iconColor} />
                        </View>
                    </View>
                    <Text style={styles.visualEmoji}>{item.visual}</Text>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.headline}>{item.headline}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    };

    const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Skip Button */}
                <View style={styles.topBar}>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>
                            {currentIndex + 1} / {ONBOARDING_SLIDES.length}
                        </Text>
                    </View>
                    {!isLastSlide && (
                        <Pressable onPress={handleSkip} style={styles.skipButton}>
                            <Text style={styles.skipText}>Skip</Text>
                        </Pressable>
                    )}
                </View>

                {/* Slides */}
                <FlatList
                    ref={flatListRef}
                    data={ONBOARDING_SLIDES}
                    renderItem={renderSlide}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                />

                {/* Bottom */}
                <View style={styles.bottom}>
                    {/* Dots */}
                    <View style={styles.dots}>
                        {ONBOARDING_SLIDES.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i === currentIndex
                                        ? styles.dotActive
                                        : styles.dotInactive,
                                ]}
                            />
                        ))}
                    </View>

                    {/* CTA Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.ctaButton,
                            isLastSlide && styles.ctaButtonFinal,
                            pressed && { opacity: 0.9 },
                        ]}
                        onPress={handleNext}
                    >
                        <Text style={styles.ctaText}>
                            {isLastSlide ? 'Get Started' : 'Next'}
                        </Text>
                        {isLastSlide ? (
                            <Sparkles size={18} color="#FFF" />
                        ) : (
                            <ChevronRight size={18} color="#FFF" />
                        )}
                    </Pressable>
                </View>
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
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    countBadge: {
        backgroundColor: Colors.light.surfaceAlt,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.light.textMuted,
    },
    skipButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.textMuted,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    visualContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    visualCircleOuter: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    visualCircleInner: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    visualEmoji: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        fontSize: 40,
    },
    content: {
        alignItems: 'center',
    },
    headline: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.light.text,
        textAlign: 'center',
        lineHeight: 38,
        letterSpacing: -0.5,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 320,
    },
    bottom: {
        padding: 20,
        paddingBottom: 12,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        width: 28,
        backgroundColor: Colors.light.primary,
    },
    dotInactive: {
        width: 8,
        backgroundColor: Colors.light.border,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.light.primary,
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    ctaButtonFinal: {
        backgroundColor: Colors.light.primary,
    },
    ctaText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
    },
});
