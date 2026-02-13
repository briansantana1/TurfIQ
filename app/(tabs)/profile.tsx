import Colors from '@/constants/Colors';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
    Bell,
    ChevronRight,
    Crown,
    Database,
    FileText,
    HelpCircle,
    Settings,
    Star,
    User,
} from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const handleAction = (action: string) => {
        switch (action) {
            case 'upgrade':
                Alert.alert('TurfIQ Pro', 'Subscriptions are coming soon! You will get unlimited zones, full spreader database access, and advanced lawn diagnostics.');
                break;
            case 'privacy':
                WebBrowser.openBrowserAsync('https://raw.githubusercontent.com/briansantana1/TurfIQ/main/legal/privacy-policy.md');
                break;
            case 'terms':
                WebBrowser.openBrowserAsync('https://raw.githubusercontent.com/briansantana1/TurfIQ/main/legal/terms-of-use.md');
                break;
            case 'help':
                Linking.openURL('mailto:info.turfiq@yahoo.com');
                break;
            default:
                Alert.alert('Coming Soon', 'This feature is currently under development. Stay tuned for future updates!');
                break;
        }
    };

    const menuItems = [
        {
            icon: Crown,
            title: 'Upgrade to Pro',
            subtitle: 'Unlock all features',
            color: Colors.light.accent,
            action: 'upgrade',
        },
        {
            icon: Database,
            title: 'Saved Data',
            subtitle: 'Manage your lawn zones',
            color: Colors.light.info,
            action: 'data',
        },
        {
            icon: Bell,
            title: 'Notifications',
            subtitle: 'Seasonal reminders',
            color: Colors.light.primary,
            action: 'notifications',
        },
        {
            icon: Settings,
            title: 'Settings',
            subtitle: 'Units, preferences',
            color: Colors.light.textMuted,
            action: 'settings',
        },
        {
            icon: HelpCircle,
            title: 'Help & Support',
            subtitle: 'FAQ, contact us',
            color: Colors.light.secondary,
            action: 'help',
        },
        {
            icon: Star,
            title: 'Rate This App',
            subtitle: 'Love it? Let us know!',
            color: Colors.light.accent,
            action: 'rate',
        },
        {
            icon: FileText,
            title: 'Privacy Policy',
            subtitle: 'Data usage & protection',
            color: Colors.light.textMuted,
            action: 'privacy',
        },
        {
            icon: FileText,
            title: 'Terms of Use',
            subtitle: 'App usage agreement',
            color: Colors.light.textMuted,
            action: 'terms',
        },
    ];

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Profile</Text>
                    </View>

                    {/* User Card */}
                    <View style={styles.userCard}>
                        <View style={styles.userAvatar}>
                            <User size={28} color={Colors.light.primary} />
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>TurfIQ Enthusiast</Text>
                            <View style={styles.tierBadge}>
                                <Text style={styles.tierText}>Free Tier</Text>
                            </View>
                        </View>
                    </View>

                    {/* Pro Banner */}
                    <Pressable style={styles.proBanner}>
                        <View style={styles.proContent}>
                            <Crown size={24} color="#FFF" />
                            <View style={styles.proText}>
                                <Text style={styles.proTitle}>Go Pro</Text>
                                <Text style={styles.proSubtitle}>
                                    Unlimited zones, full spreader database & more
                                </Text>
                            </View>
                        </View>
                        <View style={styles.proPrice}>
                            <Text style={styles.proPriceText}>$3.99/wk</Text>
                            <Text style={styles.proPriceOr}>or $49.99/yr</Text>
                        </View>
                    </Pressable>

                    {/* Menu Items */}
                    <View style={styles.menuContainer}>
                        {menuItems.map((item, i) => (
                            <Pressable
                                key={item.action}
                                style={({ pressed }) => [
                                    styles.menuItem,
                                    pressed && { opacity: 0.85 },
                                    i === menuItems.length - 1 && styles.menuItemLast,
                                ]}
                                onPress={() => handleAction(item.action)}
                            >
                                <View style={styles.menuLeft}>
                                    <View
                                        style={[
                                            styles.menuIcon,
                                            {
                                                backgroundColor:
                                                    item.action === 'upgrade'
                                                        ? Colors.light.cautionBg
                                                        : Colors.light.surfaceAlt,
                                            },
                                        ]}
                                    >
                                        <item.icon size={18} color={item.color} />
                                    </View>
                                    <View>
                                        <Text style={styles.menuTitle}>{item.title}</Text>
                                        <Text style={styles.menuSubtitle}>
                                            {item.subtitle}
                                        </Text>
                                    </View>
                                </View>
                                <ChevronRight size={16} color={Colors.light.textMuted} />
                            </Pressable>
                        ))}
                    </View>

                    <Text style={styles.version}>Version 1.0.0</Text>

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
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.light.text,
        letterSpacing: -0.5,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.light.borderLight,
    },
    userAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.light.safeBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    tierBadge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.light.surfaceAlt,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    tierText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.textMuted,
    },
    proBanner: {
        marginHorizontal: 20,
        backgroundColor: Colors.light.primary,
        borderRadius: 16,
        padding: 18,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    proContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    proText: {
        flex: 1,
    },
    proTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    proSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2,
    },
    proPrice: {
        alignItems: 'flex-end',
    },
    proPriceText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
    },
    proPriceOr: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    menuContainer: {
        marginHorizontal: 20,
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.light.borderLight,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.borderLight,
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.light.text,
    },
    menuSubtitle: {
        fontSize: 12,
        color: Colors.light.textMuted,
        marginTop: 1,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: Colors.light.textMuted,
        marginTop: 24,
    },
    bottomSpacer: {
        height: 20,
    },
});
