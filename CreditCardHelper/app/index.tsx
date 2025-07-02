import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import MapView from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = require('../assets/Categories.json') as string[];
const OSM_TYPE_TO_CATEGORY = require('../assets/OSMTypeToCategory.json');

export default function Optimizer() {
  const [amountSpent, setAmountSpent] = useState('');
  const [category,     setCategory]   = useState(CATEGORIES[0]);
  const [suggested,    setSuggested]  = useState('N/A');
  const [region,       setRegion]     = useState<null | {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>(null);
  const [loadingLoc,   setLoadingLoc] = useState(true);
  const [osmType, setOsmType] = useState<string>('');
  const [loading,      setLoading]    = useState(false);
  const [useLocation, setUseLocation] = useState(true);
  const insets = useSafeAreaInsets();

  const openCategorySheet = () => {
  ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...CATEGORIES, 'Cancel'],
        cancelButtonIndex: CATEGORIES.length,
      },
      (buttonIndex) => {
        if (buttonIndex !== CATEGORIES.length) {
          setCategory(CATEGORIES[buttonIndex]);
        }
      }
    )
  };
  
 // Fetch saved cards
  const fetchCards = async () => {
    const stored = await AsyncStorage.getItem('creditCards');
    return stored ? JSON.parse(stored) : [];
  };

  // Reverse geocode via OSM Nominatim
  const getOsmType = async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'OptimizerApp/1.0' } });
    if (!res.ok) throw new Error(`OSM error ${res.status}`);
    const data = await res.json();
    return data.type;
  };

  // Core: find best card given a spending category
  const getBestCardFor = async (targetCat: string) => {
    const cards = await fetchCards();
    if (!cards.length) return null;

    let bestCard: any = null;
    let bestScore = -Infinity;
    const target = targetCat.trim().toLowerCase();

    for (const card of cards) {
      const bonusEntry = card.categoryBonuses.find(
        ([cat]: [string, number]) => cat.toLowerCase() === target
      );
      const bonus = bonusEntry ? bonusEntry[1] : 1;
      const score = bonus * card.rewardMultiplier;

      if (score > bestScore) {
        bestScore = score;
        bestCard  = card;
      }
    }
    return bestCard;
  };

  // Handle Suggest: try location-based override first
  const handleSuggest = async () => {
    setLoading(true);
    if (useLocation) {
      await updateLocation();
      if (region) {
        try {
          const type = await getOsmType(region);
          setOsmType(type);
          const mapped = OSM_TYPE_TO_CATEGORY[type];
          setCategory(mapped || 'all');
        } catch (err: any) {
          console.warn(err);
        }
      }
    }
    const best = await getBestCardFor(category);
    setSuggested(best ? best.name : 'N/A');
    setLoading(false);
  };

  const updateLocation = async() => {
    let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        setLoadingLoc(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      setLoadingLoc(false);
  };

  useEffect(() => {updateLocation();}, []);

  /* ───── UI ───── */
  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { paddingBottom: insets.bottom }]}>        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.header}>Credit Card Optimizer</Text>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            showsUserLocation
            showsMyLocationButton
          />
        </View>
        {/* <Text>Your Location Type: {osmType}</Text> */}

        {/* white card wrapper */}
        <View style={styles.card}>
          <Text style={styles.label}>Amount Spent</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 45.00"
            keyboardType="numeric"
            value={amountSpent}
            onChangeText={setAmountSpent}
            placeholderTextColor="#9aa0a6"
            />

          <Text style={styles.label}>Spending Category</Text>
          {/* ───── Dropdown selector ───── */}
          {Platform.OS === 'ios' ? (
            <TouchableOpacity style={styles.selector} onPress={openCategorySheet}>
              <Text style={styles.selectorText}>{category}</Text>
            </TouchableOpacity>
          ) : (
            <Text></Text>
          )}
          <View style={styles.toggleRow}>
                <Text style={styles.label}>Auto-detect category</Text>
                <Switch
                  value={useLocation}
                  onValueChange={setUseLocation}
                  trackColor={{ false: '#ccc', true: ACCENT }}
                  thumbColor="#fff"
                />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSuggest}>
          <Text style={styles.primaryText}>Suggest Best Card</Text>
        </TouchableOpacity>

        <Text style={styles.result}>{suggested}</Text>
      </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

/* ───── styles ───── */
const ACCENT = '#2563eb';          // indigo-600
const LIGHT  = '#f2f4f8';
const TEXT   = '#111';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: LIGHT },

  loadingContainer: { flex:1, justifyContent:'center', alignItems:'center' },
  loadingText: { marginTop:12, fontSize:16, color:TEXT },
  
  container: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
    alignItems: 'center',
  },
  
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 24,
    textAlign: 'center',
  },

  /* white form card */
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  mapContainer: {
    width: '100%',
    height: 200,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },

  label: {
    fontSize: 16,
    color: TEXT,
    marginBottom: 6,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 18,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  /* button */
  primaryBtn: {
    marginTop: 24,
    width: '100%',
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  result: {
    marginTop: 24,
    fontSize: 18,
    color: ACCENT,
    fontWeight: '600',
    textAlign: 'center',
  },

  selector: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: '#fff',
  },
  selectorText: {
    fontSize: 16,
    color: '#111',
  },
});
