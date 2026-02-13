import Colors from '@/constants/Colors';
import { Coordinate, useZones } from '@/context/ZoneContext';
import { area } from '@turf/area';
import { polygon as turfPolygon } from '@turf/helpers';
import { useRouter } from 'expo-router';
import {
    Check,
    ChevronLeft,
    Info,
    Layers,
    PenTool,
    Plus,
    Trash2,
    Undo2
} from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const ZONE_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function calculatePolygonArea(points: Coordinate[]): number {
    if (points.length < 3) return 0;

    // Turf expects [longitude, latitude] pairs and the polygon must be closed
    const coordinates = [...points.map(p => [p.longitude, p.latitude])];
    coordinates.push([points[0].longitude, points[0].latitude]);

    try {
        const poly = turfPolygon([coordinates]);
        const areaSqMeters = area(poly);
        return Math.round(areaSqMeters * 10.7639); // Convert to sq ft
    } catch (e) {
        console.error('Area calculation error', e);
        return 0;
    }
}

export default function MeasureScreen() {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const { zones, addZone, deleteZone } = useZones();
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<Coordinate[]>([]);
    const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('hybrid');

    const handleMapPress = useCallback(
        (e: any) => {
            if (!isDrawing) return;
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setCurrentPoints((prev) => [...prev, { latitude, longitude }]);
        },
        [isDrawing]
    );

    const handleUndo = () => setCurrentPoints((prev) => prev.slice(0, -1));
    const handleClearDrawing = () => setCurrentPoints([]);

    const handleFinishDrawing = () => {
        if (currentPoints.length < 3) {
            Alert.alert('Need more points', 'Tap at least 3 points on the map to create a zone.');
            return;
        }
        const areaSqFt = calculatePolygonArea(currentPoints);
        addZone({
            name: zones.length === 0 ? 'Front Yard' : zones.length === 1 ? 'Back Yard' : `Zone ${zones.length + 1}`,
            color: ZONE_COLORS[zones.length % ZONE_COLORS.length],
            polygon: currentPoints,
            areaSqFt: areaSqFt,
        });
        setCurrentPoints([]);
        setIsDrawing(false);
    };

    const toggleMapType = () => {
        setMapType((prev) =>
            prev === 'hybrid' ? 'satellite' : prev === 'satellite' ? 'standard' : 'hybrid'
        );
    };

    const totalArea = zones.reduce((sum, z) => sum + z.areaSqFt, 0);

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
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
                            <Text style={styles.title}>Measure</Text>
                            <Text style={styles.subtitle}>
                                {isDrawing ? 'Tap points on the map to draw' : 'Draw your lawn on the map'}
                            </Text>
                        </View>
                    </View>
                    <Pressable style={styles.layerButton} onPress={toggleMapType}>
                        <Layers size={20} color={Colors.light.text} />
                    </Pressable>
                </View>

                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        mapType={mapType}
                        initialRegion={{
                            latitude: 33.749,
                            longitude: -84.388,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                        showsUserLocation
                        showsMyLocationButton
                        onPress={handleMapPress}
                    >
                        {zones.map((zone) => (
                            <React.Fragment key={zone.id}>
                                <Polygon
                                    coordinates={zone.polygon}
                                    fillColor={zone.color + '40'}
                                    strokeColor={zone.color}
                                    strokeWidth={2}
                                />
                                {zone.polygon[0] && (
                                    <Marker coordinate={zone.polygon[0]} anchor={{ x: 0.5, y: 0.5 }}>
                                        <View style={[styles.zoneLabel, { backgroundColor: zone.color }]}>
                                            <Text style={styles.zoneLabelText}>
                                                {zone.name}: {zone.areaSqFt.toLocaleString()} sq ft
                                            </Text>
                                        </View>
                                    </Marker>
                                )}
                            </React.Fragment>
                        ))}
                        {currentPoints.map((point, i) => (
                            <Marker key={`point-${i}`} coordinate={point} anchor={{ x: 0.5, y: 0.5 }}>
                                <View style={styles.drawPoint}>
                                    <Text style={styles.drawPointText}>{i + 1}</Text>
                                </View>
                            </Marker>
                        ))}
                        {currentPoints.length >= 3 && (
                            <Polygon
                                coordinates={currentPoints}
                                fillColor="rgba(22, 163, 74, 0.25)"
                                strokeColor={Colors.light.primary}
                                strokeWidth={2}
                            />
                        )}
                    </MapView>

                    {zones.length === 0 && !isDrawing && (
                        <View style={styles.instructionOverlay}>
                            <View style={styles.instructionCard}>
                                <Info size={24} color={Colors.light.primary} />
                                <Text style={styles.instructionTitle}>How to Measure</Text>
                                <Text style={styles.instructionText}>
                                    Tap "Draw Lawn" below, then tap points on the map to outline your lawn.
                                    Save the zone to use it in calculations.
                                </Text>
                            </View>
                        </View>
                    )}

                    {isDrawing && (
                        <View style={styles.drawingOverlay}>
                            <View style={styles.drawingBanner}>
                                <PenTool size={16} color="#FFF" />
                                <Text style={styles.drawingBannerText}>
                                    Drawing Mode · {currentPoints.length} points
                                </Text>
                                {currentPoints.length >= 3 && (
                                    <Text style={styles.drawingAreaText}>
                                        ≈ {calculatePolygonArea(currentPoints).toLocaleString()} sq ft
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    {isDrawing && (
                        <View style={styles.drawingActions}>
                            <Pressable style={[styles.drawActionBtn, styles.drawActionSecondary]} onPress={handleUndo}>
                                <Undo2 size={18} color={Colors.light.text} />
                            </Pressable>
                            <Pressable style={[styles.drawActionBtn, styles.drawActionSecondary]} onPress={handleClearDrawing}>
                                <Trash2 size={18} color={Colors.light.error} />
                            </Pressable>
                            <Pressable style={[styles.drawActionBtn, styles.drawActionPrimary]} onPress={handleFinishDrawing}>
                                <Check size={18} color="#FFF" />
                                <Text style={styles.drawActionPrimaryText}>Save Zone</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                <View style={styles.bottomBar}>
                    <View>
                        <Text style={styles.zonesLabel}>SAVED ZONES</Text>
                        <Text style={styles.zonesCount}>
                            {zones.length} zone{zones.length !== 1 ? 's' : ''} · {totalArea.toLocaleString()} sq ft
                        </Text>
                    </View>
                    {!isDrawing && (
                        <Pressable
                            style={styles.addZoneButton}
                            onPress={() => { setIsDrawing(true); setCurrentPoints([]); }}
                        >
                            <Plus size={20} color="#FFF" />
                            <Text style={styles.addZoneText}>{zones.length === 0 ? 'Draw Lawn' : 'Add Zone'}</Text>
                        </Pressable>
                    )}
                </View>

                {zones.length > 0 && !isDrawing && (
                    <View style={styles.zoneList}>
                        {zones.map((zone) => (
                            <View key={zone.id} style={styles.zoneCard}>
                                <View style={[styles.zoneColorDot, { backgroundColor: zone.color }]} />
                                <View style={styles.zoneInfo}>
                                    <Text style={styles.zoneName}>{zone.name}</Text>
                                    <Text style={styles.zoneArea}>{zone.areaSqFt.toLocaleString()} sq ft</Text>
                                </View>
                                <Pressable onPress={() => deleteZone(zone.id)} style={styles.zoneDeleteBtn}>
                                    <Trash2 size={14} color={Colors.light.error} />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
    },
    title: { fontSize: 28, fontWeight: '800', color: Colors.light.text, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: Colors.light.textMuted, marginTop: 2 },
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
    layerButton: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.light.surface,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.light.border,
    },
    mapContainer: {
        flex: 1, marginHorizontal: 12, marginBottom: 8, borderRadius: 20,
        overflow: 'hidden', borderWidth: 2, borderColor: Colors.light.border,
    },
    map: { flex: 1 },
    zoneLabel: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    zoneLabelText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
    drawPoint: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.light.primary,
        justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF',
    },
    drawPointText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
    instructionOverlay: {
        position: 'absolute', top: 20, left: 20, right: 20,
    },
    instructionCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 20, borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    },
    instructionTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text, marginTop: 10, marginBottom: 4 },
    instructionText: { fontSize: 13, color: Colors.light.textSecondary, textAlign: 'center', lineHeight: 18 },
    drawingOverlay: { position: 'absolute', top: 12, left: 12, right: 12 },
    drawingBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: Colors.light.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    },
    drawingBannerText: { fontSize: 13, fontWeight: '700', color: '#FFF', flex: 1 },
    drawingAreaText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
    drawingActions: {
        position: 'absolute', bottom: 16, left: 12, right: 12, flexDirection: 'row', gap: 8,
    },
    drawActionBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
    },
    drawActionSecondary: {
        backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border,
    },
    drawActionPrimary: { flex: 1, backgroundColor: Colors.light.primary },
    drawActionPrimaryText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
    bottomBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 8,
    },
    zonesLabel: { fontSize: 10, fontWeight: '700', color: Colors.light.textMuted, letterSpacing: 0.5, marginBottom: 2 },
    zonesCount: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
    addZoneButton: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: Colors.light.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14,
    },
    addZoneText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
    zoneList: { paddingHorizontal: 20, paddingBottom: 8, gap: 6 },
    zoneCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.surface,
        borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.light.borderLight,
    },
    zoneColorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    zoneInfo: { flex: 1 },
    zoneName: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
    zoneArea: { fontSize: 12, color: Colors.light.textMuted, marginTop: 1 },
    zoneDeleteBtn: { padding: 8 },
});
