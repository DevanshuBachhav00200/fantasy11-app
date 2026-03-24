import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getLeaderboard, getMyRank } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen({ route }) {
  const { matchId, matchName } = route.params || {};
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = async (reset = false) => {
    try {
      const p = reset ? 1 : page;
      const [lb, rank] = await Promise.all([
        getLeaderboard(matchId, p),
        getMyRank(matchId).catch(() => null)
      ]);

      if (reset) setLeaderboard(lb.leaderboard);
      else setLeaderboard(prev => [...prev, ...lb.leaderboard]);

      setMyRank(rank);
      setHasMore(p < lb.totalPages);
      if (!reset) setPage(p + 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(true); }, [matchId]);

  const EntryRow = ({ entry, rank }) => {
    const isMe = entry.user?._id === user?._id;
    const isTopThree = rank <= 3;
    return (
      <View style={[styles.row, isMe && styles.myRow]}>
        <View style={styles.rankCol}>
          {isTopThree
            ? <Text style={styles.rankEmoji}>{RANK_EMOJIS[rank - 1]}</Text>
            : <Text style={[styles.rankNum, { color: isMe ? '#FF6B35' : '#667788' }]}>#{rank}</Text>}
        </View>
        <View style={[styles.avatar, isMe && { backgroundColor: '#FF6B35' }]}>
          <Text style={styles.avatarText}>{entry.user?.username?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.username, isMe && { color: '#FF6B35' }]}>
            {entry.user?.username || 'Unknown'} {isMe && '(You)'}
          </Text>
          <Text style={styles.teamName}>{entry.teamName}</Text>
        </View>
        <View style={styles.pointsCol}>
          <Text style={[styles.points, isTopThree && { color: RANK_COLORS[rank - 1] }]}>
            {entry.totalPoints?.toFixed(1) || '0.0'}
          </Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#071525', '#0A1E30']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        {matchName && <Text style={styles.matchName}>{matchName}</Text>}
      </View>

      {myRank && (
        <LinearGradient colors={['#FF6B3522', '#F7931E11']} style={styles.myRankBanner}>
          <View>
            <Text style={styles.myRankLabel}>Your Rank</Text>
            <Text style={styles.myRankVal}>#{myRank.rank} of {myRank.totalParticipants}</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.myRankLabel}>Points</Text>
            <Text style={styles.myRankVal}>{myRank.totalPoints?.toFixed(1)}</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.myRankLabel}>Percentile</Text>
            <Text style={[styles.myRankVal, { color: '#44BB88' }]}>Top {100 - myRank.percentile + 1}%</Text>
          </View>
        </LinearGradient>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setPage(1); load(true); }} tintColor="#FF6B35" />}
          onMomentumScrollEnd={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20 && hasMore) load();
          }}>
          {leaderboard.length === 0 ? (
            <Text style={styles.empty}>No participants yet</Text>
          ) : (
            leaderboard.map((entry, i) => <EntryRow key={entry._id} entry={entry} rank={i + 1} />)
          )}
          {!hasMore && leaderboard.length > 0 && (
            <Text style={styles.endText}>— End of Leaderboard —</Text>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  matchName: { color: '#667788', fontSize: 14, marginTop: 4 },
  myRankBanner: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FF6B3544' },
  myRankLabel: { color: '#667788', fontSize: 11, textAlign: 'center' },
  myRankVal: { color: '#FF6B35', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  divider: { width: 1, height: 40, backgroundColor: '#1A3048' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#0F2030' },
  myRow: { backgroundColor: '#FF6B3511' },
  rankCol: { width: 40, alignItems: 'center' },
  rankEmoji: { fontSize: 20 },
  rankNum: { fontSize: 15, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A3048', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '800' },
  userInfo: { flex: 1 },
  username: { color: '#ddd', fontWeight: '700', fontSize: 14 },
  teamName: { color: '#667788', fontSize: 12, marginTop: 2 },
  pointsCol: { alignItems: 'flex-end' },
  points: { color: '#4A9EFF', fontSize: 18, fontWeight: '800' },
  pointsLabel: { color: '#667788', fontSize: 11 },
  empty: { color: '#667788', textAlign: 'center', marginTop: 60, fontSize: 16 },
  endText: { color: '#667788', textAlign: 'center', paddingVertical: 16 },
});
