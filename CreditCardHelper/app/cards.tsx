import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CardItem from '../components/CardItem';


export default function CardsScreen() {
  const [cards, setCards] = useState<any[]>([]);
  const navigation = useNavigation();

  /* ─────────── helpers ─────────── */
  const eraseAsyncStorage = async () => {
    await AsyncStorage.clear();
    setCards([]);
  };

  const fetchCards = async () => {
    try {
      const stored = await AsyncStorage.getItem('creditCards');
      if (stored) setCards(JSON.parse(stored));
      else setCards([]);
    } catch (e) {
      console.error('Failed to fetch cards:', e);
    }
  };

  const removeCard = async (id: string) => {
    try {
      const updated = cards.filter(c => c.id !== id);
      await AsyncStorage.setItem('creditCards', JSON.stringify(updated));
      setCards(updated);
    } catch (e) {
      console.error('Failed to remove card:', e);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchCards);
    return unsub;
  }, [navigation]);

  const handleAddCard = () => navigation.navigate('addCard');

  /* ─────────── render ─────────── */
  const renderCard = ({ item }: { item: any }) => (
    <CardItem card={item} onRemove={removeCard} />
    // <View style={styles.card}>
    //   {/* left column -- all the text */}
    //   <View style={styles.cardContent}>
    //   <Text style={styles.cardTitle}>{item.name}</Text>
  
    //   <Text style={styles.label}>
    //       Credit Line: ${item.creditLine.toLocaleString()}
    //   </Text>
    //   <Text style={styles.label}>
    //       Reward Multiplier: {item.rewardMultiplier}×
    //   </Text>
  
    //   <Text style={[styles.label, { marginTop: 6 }]}>Category Bonuses:</Text>
    //   {item.categoryBonuses.map(([cat, bonus]: any, idx: number) => (
    //       <Text key={idx} style={styles.bonus}>
    //       • {cat}: {bonus}%
    //       </Text>
    //   ))}
    //   </View>
  
    //   {/* right column -- full-height delete strip */}
    //   <TouchableOpacity
    //   style={styles.deleteStrip}
    //   onPress={() => removeCard(item.id)}
    //   >
    //   <Text style={styles.deleteText}>🗑️</Text>
    //   </TouchableOpacity>
    // </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={cards}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={{ padding: 24}}
        ListEmptyComponent={
          <Text style={styles.empty}>No cards saved yet. Tap “Add Card”.</Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* fixed bottom action row */}
      <View style={[styles.actions]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleAddCard}>
          <Text style={styles.primaryText}>Add Card</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={eraseAsyncStorage}>
          <Text style={styles.secondaryText}>Delete All</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ────── styles ────── */
const ACCENT = '#2563eb';          // indigo-600
const LIGHT  = '#f2f4f8';
const TEXT   = '#111';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: LIGHT },

  /* card list */
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: ACCENT, marginBottom: 8, marginTop: 8, marginLeft: 12 },
  label: { fontSize: 16, color: TEXT, marginLeft: 12 },
  bonus: { fontSize: 15, color: '#555', paddingLeft: 16 },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },

  /* left column (text) */
  cardContent: {
    flex: 1,
  },  

  /* bottom actions */
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(242,244,248,0.95)',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCENT,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: { color: ACCENT, fontWeight: '700', fontSize: 16 },

  deleteStrip: {
    width: 44,
    borderRadius: 16,
    backgroundColor: '#ff4d4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: { color: '#fff', fontWeight: '600' },
});
