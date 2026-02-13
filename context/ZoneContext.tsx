import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface Coordinate {
    latitude: number;
    longitude: number;
}

export interface Zone {
    id: string;
    name: string;
    color: string;
    polygon: Coordinate[];
    areaSqFt: number;
    createdAt: string;
}

interface ZoneContextType {
    zones: Zone[];
    addZone: (zone: Omit<Zone, 'id' | 'createdAt'>) => void;
    deleteZone: (id: string) => void;
    updateZone: (id: string, updates: Partial<Zone>) => void;
    isLoading: boolean;
}

const ZoneContext = createContext<ZoneContextType | undefined>(undefined);

const STORAGE_KEY = '@lawn_calculator_zones';

export function ZoneProvider({ children }: { children: React.ReactNode }) {
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load zones on mount
    useEffect(() => {
        const loadZones = async () => {
            try {
                const savedZones = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedZones) {
                    setZones(JSON.parse(savedZones));
                }
            } catch (e) {
                console.error('Failed to load zones', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadZones();
    }, []);

    // Save zones whenever they change
    useEffect(() => {
        if (!isLoading) {
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(zones)).catch(e =>
                console.error('Failed to save zones', e)
            );
        }
    }, [zones, isLoading]);

    const addZone = useCallback((newZoneData: Omit<Zone, 'id' | 'createdAt'>) => {
        const newZone: Zone = {
            ...newZoneData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        setZones(prev => [...prev, newZone]);
    }, []);

    const deleteZone = useCallback((id: string) => {
        setZones(prev => prev.filter(z => z.id !== id));
    }, []);

    const updateZone = useCallback((id: string, updates: Partial<Zone>) => {
        setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
    }, []);

    return (
        <ZoneContext.Provider value={{ zones, addZone, deleteZone, updateZone, isLoading }}>
            {children}
        </ZoneContext.Provider>
    );
}

export function useZones() {
    const context = useContext(ZoneContext);
    if (context === undefined) {
        throw new Error('useZones must be used within a ZoneProvider');
    }
    return context;
}
