import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Preset = {
  id: string;
  name: string;
  categoryBonuses: [string, number][];
  creditLine: number;
  rewardMultiplier: number;
};

const CARD_PRESETS: Preset[] = require('../assets/Cards.json');

export default function SelectCardScreen() {
  const navigation = useNavigation();

  const handleSelect = (preset: Preset) => {
    navigation.navigate('addCard', {
      cardName: preset.name,
      categoryBonuses: JSON.stringify(preset.categoryBonuses),
      rewardMultiplier: preset.rewardMultiplier,
    });
  };

  const renderItem = ({ item }: { item: Preset }) => (
    <Pressable style={styles.card} onPress={() => handleSelect(item)}>
      <Text style={styles.title}>{item.name}</Text>
      {item.categoryBonuses.map(([cat, bonus]) => (
        <Text key={`${item.name}-${cat}`} style={styles.bonus}>
          • {cat}: {bonus}%
        </Text>
      ))}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Select Card</Text>

      <FlatList
        data={CARD_PRESETS as Preset[]}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/* ------------- styles ------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7', padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 14,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  bonus: { fontSize: 15, color: '#555' },
});
