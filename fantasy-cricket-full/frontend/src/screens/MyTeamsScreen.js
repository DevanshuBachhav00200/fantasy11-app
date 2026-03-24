// MyTeamsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getMyTeams } from '../services/api';

export function MyTeamsScreen() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { teams } = await getMyTeams();
      setTeams(teams);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <LinearGradient colors={['#071525', '#0A1E30']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </LinearGradient>
  );

  return (
    <LinearGradient colors={['#071525', '#0A1E30']} style={styles.container}>
      <Text style={styles.title}>My Fantasy Teams</Text>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#FF6B35" />}>
        {teams.length === 0 ? (
          <Text style={styles.empty}>No teams yet. Join a match!</Text>
        ) : teams.map(team => (
          <View key={team._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.teamName}>{team.teamName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: team.match?.status === 'live' ? '#FF444422' : '#1A3048' }]}>
                <Text style={[styles.statusText, { color: team.match?.status === 'live' ? '#FF4444' : '#667788' }]}>
                  {team.match?.status?.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.matchName}>{team.match?.team1} vs {team.match?.team2}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{team.players?.length || 0}</Text>
                <Text style={styles.statLabel}>Players</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{team.totalCredits}</Text>
                <Text style={styles.statLabel}>Credits</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statVal, { color: '#44BB88' }]}>{team.totalPoints?.toFixed(1) || '0.0'}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              {team.rank > 0 && (
                <View style={styles.stat}>
                  <Text style={[styles.statVal, { color: '#F7931E' }]}>#{team.rank}</Text>
                  <Text style={styles.statLabel}>Rank</Text>
                </View>
              )}
            </View>
            <View style={styles.playerChips}>
              {(team.players || []).slice(0, 6).map(({ player, isCaptain, isViceCaptain }) => (
                <View key={player?._id} style={[styles.chip, isCaptain && styles.captainChip, isViceCaptain && styles.vcChip]}>
                  <Text style={styles.chipText}>
                    {isCaptain ? '👑' : isViceCaptain ? '⭐' : ''}{player?.name?.split(' ').pop()}
                  </Text>
                </View>
              ))}
              {(team.players?.length || 0) > 6 && (
                <View style={styles.chip}><Text style={styles.chipText}>+{team.players.length - 6}</Text></View>
              )}
            </View>
          </View>
        ))}
        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', padding: 20, paddingTop: 56 },
  empty: { color: '#667788', textAlign: 'center', marginTop: 60, fontSize: 16 },
  card: { margin: 16, marginTop: 0, backgroundColor: '#0F2030', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1A3048' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  teamName: { color: '#fff', fontWeight: '800', fontSize: 16 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  matchName: { color: '#667788', fontSize: 13, marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1A3048', paddingVertical: 12, marginBottom: 12 },
  stat: { alignItems: 'center' },
  statVal: { color: '#4A9EFF', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#667788', fontSize: 11 },
  playerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#1A3048', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  captainChip: { backgroundColor: '#F7931E33', borderWidth: 1, borderColor: '#F7931E' },
  vcChip: { backgroundColor: '#4A9EFF33', borderWidth: 1, borderColor: '#4A9EFF' },
  chipText: { color: '#ccc', fontSize: 11, fontWeight: '600' },
});

export default MyTeamsScreen;
