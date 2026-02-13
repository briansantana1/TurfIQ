import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import {
  Calculator,
  ChevronRight,
  FlaskConical,
  Leaf,
  Map,
  Ruler,
  Target
} from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();

  const quickActions = [
    {
      id: 'measure',
      title: 'Measure Lawn',
      subtitle: 'Draw on satellite map',
      icon: Map,
      color: Colors.light.primary,
      bg: Colors.light.safeBg,
      route: '/measure' as const,
    },
    {
      id: 'calculate',
      title: 'Calculate Product',
      subtitle: 'How much do I need?',
      icon: Calculator,
      color: Colors.light.info,
      bg: Colors.light.highBg,
      route: '/calculate' as const,
    },
    {
      id: 'spreader',
      title: 'Spreader Settings',
      subtitle: 'Find your setting',
      icon: Target,
      color: Colors.light.accent,
      bg: Colors.light.cautionBg,
      route: '/tools?tab=spreader' as const,
    },
    {
      id: 'npk',
      title: 'NPK Decoder',
      subtitle: 'Understand fertilizer labels',
      icon: FlaskConical,
      color: '#8B5CF6',
      bg: '#EDE9FE',
      route: '/tools?tab=npk' as const,
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good evening 👋</Text>
              <Text style={styles.title}>TurfIQ Dashboard</Text>
            </View>
            <View style={styles.proBadge}>
              <Leaf size={14} color={Colors.light.primary} />
              <Text style={styles.proBadgeText}>Free</Text>
            </View>
          </View>

          {/* Hero Card */}
          <Pressable
            style={styles.heroCard}
            onPress={() => router.navigate('/measure')}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Ruler size={28} color="#FFF" />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Set up your lawn</Text>
                <Text style={styles.heroSubtitle}>
                  Draw your lawn on the satellite map to get started with
                  precise calculations
                </Text>
              </View>
            </View>
            <View style={styles.heroAction}>
              <Text style={styles.heroActionText}>Draw My Lawn</Text>
              <ChevronRight size={18} color="#FFF" />
            </View>
          </Pressable>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={({ pressed }) => [
                  styles.actionCard,
                  pressed && styles.actionCardPressed,
                ]}
                onPress={() => router.navigate(action.route)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: action.bg },
                  ]}
                >
                  <action.icon size={22} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </Pressable>
            ))}
          </View>

          {/* Saved Zones Preview */}
          <Text style={styles.sectionTitle}>My Lawn Zones</Text>
          <View style={styles.emptyZonesCard}>
            <View style={styles.emptyZonesIcon}>
              <Map size={32} color={Colors.light.textMuted} />
            </View>
            <Text style={styles.emptyZonesTitle}>No zones saved yet</Text>
            <Text style={styles.emptyZonesSubtitle}>
              Use the Measure tab to draw your lawn and save zones
            </Text>
            <Pressable
              style={styles.emptyZonesButton}
              onPress={() => router.navigate('/measure')}
            >
              <Text style={styles.emptyZonesButtonText}>
                + Add First Zone
              </Text>
            </Pressable>
          </View>

          {/* Recent Calculations */}
          <Text style={styles.sectionTitle}>Recent Calculations</Text>
          <View style={styles.emptyCalcCard}>
            <Calculator size={24} color={Colors.light.textMuted} />
            <Text style={styles.emptyCalcText}>
              No calculations yet. Start by measuring your lawn!
            </Text>
          </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 15,
    color: Colors.light.textMuted,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.safeBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  heroActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  actionCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  emptyZonesCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    borderStyle: 'dashed',
    marginBottom: 28,
  },
  emptyZonesIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyZonesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  emptyZonesSubtitle: {
    fontSize: 13,
    color: Colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyZonesButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyZonesButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  emptyCalcCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: 20,
  },
  emptyCalcText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.textMuted,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 20,
  },
});
