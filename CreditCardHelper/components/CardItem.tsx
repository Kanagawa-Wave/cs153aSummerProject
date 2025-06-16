import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const CardItem = ({ card, onRemove }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setExpanded(!expanded)}
      style={styles.card}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{card.name}</Text>

        {/* These two lines are always visible */}
        <Text style={styles.label}>
          Credit Line: ${card.creditLine.toLocaleString()}
        </Text>
        <Text style={styles.label}>
          Multiplier: {card.rewardMultiplier}×
        </Text>

        {/* Extra details only when expanded */}
        {expanded && (
          <>
            <Text style={[styles.label, { marginTop: 6 }]}>Category Bonuses:</Text>
            {card.categoryBonuses.map(([cat, bonus], i) => (
              <Text key={i} style={styles.bonus}>• {cat}: {bonus}%</Text>
            ))}
          </>
        )}
      </View>

      {/* delete strip stays on the right */}
      <TouchableOpacity style={styles.delete} onPress={() => onRemove(card.id)}>
        <Text style={styles.deleteTxt}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default CardItem;

const ACCENT = '#2563eb';          // Tailwind-esque indigo-600
const LIGHT  = '#f2f4f8';
const TEXT   = '#111';

const styles = StyleSheet.create({
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
  content: { flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: ACCENT,
    marginBottom: 8,
    marginLeft: 12,
  },
  label: { fontSize: 16, color: TEXT, marginLeft: 12 },
  bonus: { fontSize: 15, color: '#555', paddingLeft: 16 },

  delete: {
    width: 44,
    borderRadius: 16,
    backgroundColor: '#ff4d4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTxt: { color: '#fff', fontWeight: '600' },
});