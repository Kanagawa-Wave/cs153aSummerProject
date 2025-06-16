import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddCardScreen() {
  /* ─────────────── state ─────────────── */
  const [cardName, setCardName]           = useState('');
  const [category, setCategory]           = useState('');
  const [bonus, setBonus]                 = useState('');
  const [categoryBonuses, setCategoryBonuses] = useState<[string, number][]>([]);
  const [creditLine, setCreditLine]       = useState('');
  const [rewardMultiplier, setRewardMultiplier] = useState('');
  const navigation = useNavigation();

  /* ─────────────── helpers ─────────────── */
  const resetTemporaryFields = () => {
    setCardName('');
    setCategory('');
    setBonus('');
    setCategoryBonuses([]);
    setCreditLine('');
    setRewardMultiplier('');
  };

  const addBonusCategory = () => {
    if (!category.trim() || isNaN(parseFloat(bonus))) {
      Alert.alert('Error', 'Please enter a valid category and bonus.');
      return;
    }
    setCategoryBonuses(prev => [...prev, [category.trim(), +bonus]]);
    setCategory('');
    setBonus('');
  };

  /* ─────────────── save ─────────────── */
  const handleSaveCard = async () => {
    if (!cardName.trim()) {
      Alert.alert('Error', 'Card name cannot be empty.');
      return;
    }
    if (categoryBonuses.length === 0) {
      Alert.alert('Error', 'Please add at least one category bonus.');
      return;
    }
    if (isNaN(+creditLine) || isNaN(+rewardMultiplier)) {
      Alert.alert('Error', 'Credit line and reward multiplier must be numbers.');
      return;
    }

    const newCard = {
      id: Crypto.randomUUID(),
      name: cardName.trim(),
      categoryBonuses,
      creditLine: +creditLine,
      rewardMultiplier: +rewardMultiplier,
    };

    try {
      const storedCards = await AsyncStorage.getItem('creditCards');
      const cards = storedCards ? JSON.parse(storedCards) : [];
      cards.push(newCard);
      await AsyncStorage.setItem('creditCards', JSON.stringify(cards));
      Alert.alert('Success', 'Card added successfully!');
      resetTemporaryFields();
      navigation.navigate('cards');
    } catch (error) {
      console.error('Failed to save card:', error);
      Alert.alert('Error', 'Failed to save card.');
    }
  };

  /* ─────────────── UI ─────────────── */
  return (
    <SafeAreaView style={styles.screen}>
      <View
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Add a New Credit Card</Text>

        {/* ── MAIN FORM ── */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Card name"
            value={cardName}
            onChangeText={setCardName}
            placeholderTextColor="#9aa0a6"
          />

          {/* category + bonus pair */}
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex1, { marginRight: 8 }]}
              placeholder="Category (e.g. Dining)"
              value={category}
              onChangeText={setCategory}
              placeholderTextColor="#9aa0a6"
            />
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="Bonus %"
              keyboardType="numeric"
              value={bonus}
              onChangeText={setBonus}
              placeholderTextColor="#9aa0a6"
            />
          </View>

          {/* add category button */}
          <TouchableOpacity style={styles.secondaryButton} onPress={addBonusCategory}>
            <Text style={styles.secondaryText}>+ Add Bonus Category</Text>
          </TouchableOpacity>

          {/* list of added categories */}
          <FlatList
            data={categoryBonuses}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <Text style={styles.bonusItem}>• {item[0]} — {item[1]}%</Text>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No bonus categories yet</Text>
            }
            style={{ marginVertical: 12 }}
          />

          <TextInput
            style={styles.input}
            placeholder="Credit line"
            keyboardType="numeric"
            value={creditLine}
            onChangeText={setCreditLine}
            placeholderTextColor="#9aa0a6"
          />
          <TextInput
            style={styles.input}
            placeholder="Reward multiplier"
            keyboardType="numeric"
            value={rewardMultiplier}
            onChangeText={setRewardMultiplier}
            placeholderTextColor="#9aa0a6"
          />
        </View>

        {/* ── SAVE BUTTON ── */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveCard}>
          <Text style={styles.primaryText}>Save Card</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ─────────────── styles ─────────────── */
const ACCENT = '#2563eb';          // Tailwind-esque indigo-600
const LIGHT  = '#f2f4f8';
const TEXT   = '#111';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LIGHT,
  },

  /* ScrollView content */
  container: {
    padding: 24,
    paddingBottom: 48,
  },

  header: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 16,
    textAlign: 'center',
  },

  /* white “card” */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,          // Android shadow
    marginBottom: 24,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: '#fff',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: { flex: 1 },

  bonusItem: {
    fontSize: 15,
    color: TEXT,
    marginBottom: 4,
  },
  empty: {
    fontStyle: 'italic',
    color: '#777',
  },

  /* buttons */
  secondaryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#e8efff',
  },
  secondaryText: {
    color: ACCENT,
    fontWeight: '600',
  },

  primaryButton: {
    backgroundColor: ACCENT,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
