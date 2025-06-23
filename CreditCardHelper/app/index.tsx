import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Optimizer() {
  const [amountSpent, setAmountSpent] = useState('');
  const [category,     setCategory]   = useState('');
  const [cards,        setCards]      = useState<any[]>([]);
  const [suggested,    setSuggested]  = useState('N/A');
  const [region,       setRegion]     = useState<null | {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>(null);
  const [loadingLoc,   setLoadingLoc] = useState(true);
  const insets = useSafeAreaInsets();
  
  const fetchCards = async () => {
    try {
      const stored = await AsyncStorage.getItem('creditCards');
      setCards(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error('Failed to fetch cards:', e);
    }
  }
  
  /* core algo */
  const getBestCard = async () => {
    fetchCards();

    if (!cards.length) return null;

    const target = category.trim().toLowerCase();
    
    let bestCard: any = null;
    let bestScore = -Infinity;
    
    for (const card of cards) {
      const bonusEntry = card.categoryBonuses.find(
        ([cat]: [string, number]) => cat.toLowerCase() === target
      );
      const bonus = bonusEntry ? bonusEntry[1] : 1; // default 1×
      const score = bonus * card.rewardMultiplier;
      
      if (score > bestScore) {
        bestScore = score;
        bestCard  = card;
      }
    }
    return bestCard;
  };
  
  const handleSuggest = async () => {
    const best = await getBestCard();
    setSuggested(best ? best.name : 'No card found');
  };

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  /* ───── UI ───── */
  return (
    <SafeAreaView style={[styles.screen, { paddingBottom: insets.bottom }]}>
      {/* <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        > */}
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
          <TextInput
            style={styles.input}
            placeholder="e.g., dining, groceries, gas"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor="#9aa0a6"
            />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSuggest}>
          <Text style={styles.primaryText}>Suggest Best Card</Text>
        </TouchableOpacity>

        <Text style={styles.result}>Suggested Card: {suggested}</Text>
      {/* </ScrollView> */}
      </View>
    </SafeAreaView>
  );
}

/* ───── styles ───── */
const ACCENT = '#2563eb';          // indigo-600
const LIGHT  = '#f2f4f8';
const TEXT   = '#111';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: LIGHT },
  
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
    marginVertical: 24,
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

  /* button */
  primaryBtn: {
    marginTop: 28,
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
    marginTop: 40,
    fontSize: 18,
    color: ACCENT,
    fontWeight: '600',
    textAlign: 'center',
  },
});
