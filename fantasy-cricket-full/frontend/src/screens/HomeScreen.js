import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getMatches } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  upcoming: '#4A9EFF',
  live: '#FF4444',
  completed: '#44BB88'
};

const TEAM_COLORS = {
  MI: { primary: '#004C97', accent: '#D4AF37' },
  CSK: { primary: '#F9CD05', accent: '#0081E9' },
  RCB: { primary: '#C8102E', accent: '#1A1A1A' },
  KKR: { primary: '#3A225D', accent: '#B3973A' },
};

function MatchCard({ match, onPress }) {
  const timeUntil = (date) => {
    const diff = new Date(date) - new Date();
    if (diff < 0) return 'Completed';
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hrs > 24) return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const isLive = match.status === 'live';

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[match.status] + '22', borderColor: STATUS_COLORS[match.status] }]}>
          {isLive && <View style={styles.liveDot} />}
          <Text style={[styles.statusText, { color: STATUS_COLORS[match.status] }]}>
            {match.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.prizeText}>🏆 ₹{(match.prizePool || 0).toLocaleString()}</Text>
      </View>

      <View style={styles.teamsRow}>
        <View style={styles.team}>
          <View style={[styles.teamBadge, { backgroundColor: (TEAM_COLORS[match.team1]?.primary || '#333') + '44' }]}>
            <Text style={styles.teamEmoji}>🏏</Text>
          </View>
          <Text style={styles.teamName}>{match.team1}</Text>
          {match.result && <Text style={styles.score}>{match.result.team1Score?.split(' ')[0]}</Text>}
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vs}>VS</Text>
          {match.status === 'upcoming' && (
            <Text style={styles.timer}>{timeUntil(match.scheduledAt)}</Text>
          )}
        </View>

        <View style={[styles.team, { alignItems: 'flex-end' }]}>
          <View style={[styles.teamBadge, { backgroundColor: (TEAM_COLORS[match.team2]?.primary || '#333') + '44' }]}>
            <Text style={styles.teamEmoji}>🏏</Text>
          </View>
          <Text style={styles.teamName}>{match.team2}</Text>
          {match.result && <Text style={styles.score}>{match.result.team2Score?.split(' ')[0]}</Text>}
        </View>
      </View>

      {match.result && (
        <Text style={styles.resultText}>{match.result.description}</Text>
      )}

      <View style={styles.cardBottom}>
        <Text style={styles.venueText}>📍 {match.venue}</Text>
        {match.status === 'upcoming' && (
          <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.joinBtn}>
            <Text style={styles.joinText}>Join Contest</Text>
          </LinearGradient>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadMatches = async () => {
    try {
      const status = filter !== 'all' ? filter : undefined;
      const { matches } = await getMatches(status);
      setMatches(matches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadMatches(); }, [filter]);

  const filters = ['all', 'upcoming', 'live', 'completed'];

  return (
    <LinearGradient colors={['#071525', '#0A1E30']} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey {user?.username}! 👋</Text>
          <Text style={styles.coins}>🪙 {user?.coins?.toLocaleString()} coins</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.activeFilter]}
            onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#FF6B35" style={{ marginTop: 60 }} size="large" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMatches(); }} tintColor="#FF6B35" />}>
          {matches.length === 0 ? (
            <Text style={styles.empty}>No matches found</Text>
          ) : (
            matches.map(match => (
              <MatchCard
                key={match._id}
                match={match}
                onPress={() => navigation.navigate('MatchDetail', { matchId: match._id })}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '700' },
  coins: { color: '#F7931E', fontSize: 14, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0F2030', borderWidth: 1, borderColor: '#1A3048' },
  activeFilter: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  filterText: { color: '#667788', fontSize: 13, fontWeight: '600' },
  activeFilterText: { color: '#fff' },
  card: { marginHorizontal: 16, marginBottom: 14, backgroundColor: '#0F2030', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1A3048' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF4444' },
  statusText: { fontSize: 11, fontWeight: '700' },
  prizeText: { color: '#F7931E', fontSize: 13, fontWeight: '600' },
  teamsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  team: { flex: 1, alignItems: 'center' },
  teamBadge: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  teamEmoji: { fontSize: 28 },
  teamName: { color: '#fff', fontWeight: '800', fontSize: 18 },
  score: { color: '#4A9EFF', fontSize: 13, fontWeight: '600', marginTop: 4 },
  vsContainer: { alignItems: 'center' },
  vs: { color: '#445566', fontSize: 14, fontWeight: '700' },
  timer: { color: '#FF6B35', fontSize: 12, fontWeight: '600', marginTop: 4 },
  resultText: { color: '#44BB88', textAlign: 'center', fontSize: 13, fontWeight: '600', marginBottom: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1A3048', paddingTop: 12 },
  venueText: { color: '#667788', fontSize: 12, flex: 1 },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  joinText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { color: '#667788', textAlign: 'center', marginTop: 60, fontSize: 16 },
});
