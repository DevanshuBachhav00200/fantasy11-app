import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getMatch } from '../services/api';
import { useMatchSocket } from '../utils/useMatchSocket';

export default function MatchDetailScreen({ route, navigation }) {
  const { matchId } = route.params;
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const { isConnected, lastEvent, liveScore } = useMatchSocket(matchId);

  useEffect(() => {
    (async () => {
      try {
        const { match } = await getMatch(matchId);
        setMatch(match);
      } finally { setLoading(false); }
    })();
  }, []);

  // Handle real-time events
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === 'MATCH_STARTED') {
      setMatch(prev => prev ? { ...prev, status: 'live' } : prev);
    } else if (lastEvent.type === 'MATCH_COMPLETED') {
      setMatch(prev => prev ? { ...prev, status: 'completed', result: lastEvent.result } : prev);
    }
  }, [lastEvent]);

  if (loading || !match) return (
    <LinearGradient colors={['#071525', '#0A1E30']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </LinearGradient>
  );

  const sortedPerformances = [...(match.performances || [])].sort((a, b) => b.fantasyPoints - a.fantasyPoints);

  return (
    <LinearGradient colors={['#071525', '#0A1E30']} style={styles.container}>
      {/* Match header */}
      <LinearGradient colors={['#0A1628', '#0D2137']} style={styles.matchHeader}>
        <View style={styles.teamsRow}>
          <View style={styles.team}>
            <Text style={styles.teamEmoji}>🏏</Text>
            <Text style={styles.teamName}>{match.team1}</Text>
            {match.result && <Text style={styles.score}>{match.result.team1Score}</Text>}
          </View>
          <View style={styles.center}>
            <Text style={styles.vs}>VS</Text>
            <View style={[styles.statusBadge, match.status === 'live' && styles.liveBadge]}>
              {match.status === 'live' && <View style={styles.liveDot} />}
              <Text style={styles.statusText}>{match.status.toUpperCase()}</Text>
            </View>
            {isConnected && <Text style={styles.wsText}>🟢 Live</Text>}
          </View>
          <View style={[styles.team, { alignItems: 'flex-end' }]}>
            <Text style={styles.teamEmoji}>🏏</Text>
            <Text style={styles.teamName}>{match.team2}</Text>
            {match.result && <Text style={styles.score}>{match.result.team2Score}</Text>}
          </View>
        </View>
        {match.result?.description && (
          <Text style={styles.resultText}>{match.result.description}</Text>
        )}
        <Text style={styles.venue}>📍 {match.venue}</Text>
      </LinearGradient>

      {/* Live commentary */}
      {match.status === 'live' && liveScore?.commentary?.length > 0 && (
        <View style={styles.commentaryBox}>
          <Text style={styles.commentaryTitle}>🎙 Live Commentary</Text>
          {liveScore.commentary.slice(0, 3).map((c, i) => (
            <Text key={i} style={[styles.commentaryLine, i === 0 && { color: '#FF6B35' }]}>• {c}</Text>
          ))}
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {['info', 'players', 'scorecard'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === 'info' && (
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Prize Pool</Text>
              <Text style={styles.infoVal}>₹{match.prizePool?.toLocaleString()}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Scheduled</Text>
              <Text style={styles.infoVal}>{new Date(match.scheduledAt).toLocaleString()}</Text>
            </View>
            {match.status === 'upcoming' && (
              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() => navigation.navigate('TeamSelection', { matchId: match._id })}>
                <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.joinGradient}>
                  <Text style={styles.joinText}>🏏 Create Fantasy Team</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {match.status !== 'upcoming' && (
              <TouchableOpacity
                style={styles.leaderboardBtn}
                onPress={() => navigation.navigate('Leaderboard', {
                  matchId: match._id,
                  matchName: `${match.team1} vs ${match.team2}`
                })}>
                <Text style={styles.leaderboardBtnText}>🏆 View Leaderboard</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {tab === 'players' && (
          <View>
            <Text style={styles.sectionTitle}>{match.team1}</Text>
            {(match.team1Players || []).map(p => (
              <View key={p._id} style={styles.playerRow}>
                <Text style={styles.playerEmoji}>
                  {p.role === 'batsman' ? '🏏' : p.role === 'bowler' ? '⚾' : p.role === 'wicket-keeper' ? '🧤' : '⭐'}
                </Text>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{p.name}</Text>
                  <Text style={styles.playerRole}>{p.role}</Text>
                </View>
                <Text style={styles.credits}>{p.credits} cr</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>{match.team2}</Text>
            {(match.team2Players || []).map(p => (
              <View key={p._id} style={styles.playerRow}>
                <Text style={styles.playerEmoji}>
                  {p.role === 'batsman' ? '🏏' : p.role === 'bowler' ? '⚾' : p.role === 'wicket-keeper' ? '🧤' : '⭐'}
                </Text>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{p.name}</Text>
                  <Text style={styles.playerRole}>{p.role}</Text>
                </View>
                <Text style={styles.credits}>{p.credits} cr</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'scorecard' && (
          <View>
            {sortedPerformances.length === 0 ? (
              <Text style={styles.noData}>Scorecard available after match</Text>
            ) : (
              <>
                <View style={styles.scorecardHeader}>
                  <Text style={[styles.scCol, { flex: 1 }]}>Player</Text>
                  <Text style={styles.scCol}>R</Text>
                  <Text style={styles.scCol}>W</Text>
                  <Text style={styles.scCol}>Pts</Text>
                </View>
                {sortedPerformances.map((perf, i) => (
                  <View key={i} style={[styles.scorecardRow, i < 3 && { backgroundColor: '#FF6B3511' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.perfName}>{perf.player?.name || 'Player'}</Text>
                      <Text style={styles.perfMeta}>{perf.player?.team} • {perf.balls ? `${perf.runs}(${perf.balls})` : ''} {perf.wickets ? `${perf.wickets}W` : ''}</Text>
                    </View>
                    <Text style={styles.scVal}>{perf.runs}</Text>
                    <Text style={styles.scVal}>{perf.wickets}</Text>
                    <Text style={[styles.scVal, { color: '#44BB88', fontWeight: '800' }]}>{perf.fantasyPoints?.toFixed(0)}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  matchHeader: { padding: 20, paddingTop: 50 },
  teamsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  team: { flex: 1, alignItems: 'center' },
  teamEmoji: { fontSize: 40 },
  teamName: { color: '#fff', fontWeight: '800', fontSize: 22, marginTop: 6 },
  score: { color: '#4A9EFF', fontSize: 13, marginTop: 4, fontWeight: '600' },
  center: { alignItems: 'center' },
  vs: { color: '#445566', fontSize: 16, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#1A3048', marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveBadge: { backgroundColor: '#FF444422', borderWidth: 1, borderColor: '#FF4444' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF4444' },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  wsText: { color: '#44BB88', fontSize: 11, marginTop: 4 },
  resultText: { color: '#44BB88', textAlign: 'center', fontWeight: '600', fontSize: 14, marginTop: 10 },
  venue: { color: '#667788', textAlign: 'center', fontSize: 12, marginTop: 6 },
  commentaryBox: { margin: 12, backgroundColor: '#0F2030', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#FF6B35' },
  commentaryTitle: { color: '#FF6B35', fontWeight: '700', marginBottom: 8 },
  commentaryLine: { color: '#aaa', fontSize: 13, marginBottom: 4 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#1A3048' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#FF6B35' },
  tabText: { color: '#667788', fontWeight: '600' },
  activeTabText: { color: '#FF6B35' },
  section: { padding: 16 },
  infoCard: { backgroundColor: '#0F2030', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#667788', fontSize: 14 },
  infoVal: { color: '#fff', fontSize: 14, fontWeight: '700' },
  joinBtn: { marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  joinGradient: { padding: 18, alignItems: 'center' },
  joinText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  leaderboardBtn: { marginTop: 12, backgroundColor: '#0F2030', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#1A3048' },
  leaderboardBtnText: { color: '#F7931E', fontWeight: '700', fontSize: 15 },
  sectionTitle: { color: '#FF6B35', fontSize: 15, fontWeight: '800', padding: 16, paddingBottom: 8 },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#0F2030' },
  playerEmoji: { fontSize: 24, marginRight: 12 },
  playerInfo: { flex: 1 },
  playerName: { color: '#ddd', fontWeight: '700' },
  playerRole: { color: '#667788', fontSize: 12 },
  credits: { color: '#4A9EFF', fontWeight: '700' },
  scorecardHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#1A3048' },
  scCol: { color: '#667788', fontSize: 12, fontWeight: '600', width: 40, textAlign: 'center' },
  scorecardRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#0F2030', alignItems: 'center' },
  perfName: { color: '#ddd', fontWeight: '700', fontSize: 14 },
  perfMeta: { color: '#667788', fontSize: 12 },
  scVal: { color: '#ddd', fontSize: 14, width: 40, textAlign: 'center' },
  noData: { color: '#667788', textAlign: 'center', marginTop: 40, fontSize: 15 },
});
