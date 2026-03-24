import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getMatchPlayers, createTeam } from '../services/api';

const ROLE_ICONS = {
  'batsman': '🏏',
  'bowler': '⚾',
  'all-rounder': '⭐',
  'wicket-keeper': '🧤'
};

const ROLE_CONSTRAINTS = {
  'wicket-keeper': { min: 1, max: 4 },
  'batsman': { min: 3, max: 6 },
  'all-rounder': { min: 1, max: 4 },
  'bowler': { min: 3, max: 6 }
};

export default function TeamSelectionScreen({ route, navigation }) {
  const { matchId } = route.params;
  const [players, setPlayers] = useState([]);
  const [match, setMatch] = useState(null);
  const [selected, setSelected] = useState({}); // playerId -> { isCaptain, isViceCaptain }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRole, setActiveRole] = useState('all');
  const [captainMode, setCaptainMode] = useState(null); // 'captain' | 'vc'

  useEffect(() => {
    (async () => {
      try {
        const data = await getMatchPlayers(matchId);
        setPlayers(data.players);
        setMatch(data.match);
      } catch (e) { Alert.alert('Error', e.error || 'Failed to load players'); }
      finally { setLoading(false); }
    })();
  }, []);

  const selectedList = Object.keys(selected);
  const totalCredits = selectedList.reduce((sum, id) => {
    const p = players.find(p => p._id === id);
    return sum + (p?.credits || 0);
  }, 0);

  const roleCounts = () => {
    const counts = { 'wicket-keeper': 0, batsman: 0, 'all-rounder': 0, bowler: 0 };
    selectedList.forEach(id => {
      const p = players.find(p => p._id === id);
      if (p) counts[p.role]++;
    });
    return counts;
  };

  const captain = selectedList.find(id => selected[id]?.isCaptain);
  const vc = selectedList.find(id => selected[id]?.isViceCaptain);

  const togglePlayer = (player) => {
    const id = player._id;
    if (captainMode) {
      if (!selected[id]) return Alert.alert('', 'Select the player first');
      const isAlreadyC = captain === id;
      const isAlreadyVC = vc === id;
      if (captainMode === 'captain') {
        setSelected(prev => {
          const next = { ...prev };
          if (captain) next[captain] = { ...next[captain], isCaptain: false };
          next[id] = { ...(next[id] || {}), isCaptain: true, isViceCaptain: id === vc ? false : (next[id]?.isViceCaptain || false) };
          return next;
        });
      } else {
        setSelected(prev => {
          const next = { ...prev };
          if (vc) next[vc] = { ...next[vc], isViceCaptain: false };
          next[id] = { ...(next[id] || {}), isViceCaptain: true, isCaptain: id === captain ? false : (next[id]?.isCaptain || false) };
          return next;
        });
      }
      setCaptainMode(null);
      return;
    }

    if (selected[id]) {
      const next = { ...selected };
      delete next[id];
      setSelected(next);
    } else {
      if (selectedList.length >= 11) return Alert.alert('Team Full', 'Remove a player first');
      if (totalCredits + player.credits > 100) return Alert.alert('Credits Exceeded', `Only ${(100 - totalCredits).toFixed(1)} credits remaining`);
      const counts = roleCounts();
      const constraint = ROLE_CONSTRAINTS[player.role];
      if (counts[player.role] >= constraint.max) return Alert.alert('Role Limit', `Max ${constraint.max} ${player.role}s allowed`);
      setSelected(prev => ({ ...prev, [id]: {} }));
    }
  };

  const saveTeam = async () => {
    if (selectedList.length !== 11) return Alert.alert('', 'Select exactly 11 players');
    if (!captain) return Alert.alert('', 'Select a captain');
    if (!vc) return Alert.alert('', 'Select a vice-captain');

    const counts = roleCounts();
    for (const role of Object.keys(ROLE_CONSTRAINTS)) {
      if (counts[role] < ROLE_CONSTRAINTS[role].min)
        return Alert.alert('', `Need at least ${ROLE_CONSTRAINTS[role].min} ${role}(s)`);
    }

    setSaving(true);
    try {
      const teamPlayers = selectedList.map(id => ({
        playerId: id,
        isCaptain: selected[id]?.isCaptain || false,
        isViceCaptain: selected[id]?.isViceCaptain || false
      }));
      await createTeam({ matchId, players: teamPlayers, teamName: 'My Dream Team' });
      Alert.alert('🎉 Team Saved!', 'Your fantasy team has been saved successfully!', [
        { text: 'View Contest', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.error || 'Failed to save team');
    } finally { setSaving(false); }
  };

  const filteredPlayers = activeRole === 'all' ? players : players.filter(p => p.role === activeRole);
  const roles = ['all', 'wicket-keeper', 'batsman', 'all-rounder', 'bowler'];

  if (loading) return (
    <LinearGradient colors={['#071525', '#0A1E30']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </LinearGradient>
  );

  return (
    <LinearGradient colors={['#071525', '#0A1E30']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{match?.team1} vs {match?.team2}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{selectedList.length}/11</Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statVal, totalCredits > 95 && { color: '#FF4444' }]}>
              {(100 - totalCredits).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Credits Left</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{captain ? '✅' : '—'}</Text>
            <Text style={styles.statLabel}>Captain</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{vc ? '✅' : '—'}</Text>
            <Text style={styles.statLabel}>V-Captain</Text>
          </View>
        </View>
      </View>

      {/* Role tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleBar}>
        {roles.map(role => (
          <TouchableOpacity
            key={role}
            style={[styles.roleTab, activeRole === role && styles.activeRoleTab]}
            onPress={() => setActiveRole(role)}>
            <Text style={[styles.roleTabText, activeRole === role && styles.activeRoleText]}>
              {role === 'all' ? 'All' : `${ROLE_ICONS[role]} ${role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Captain mode banner */}
      {captainMode && (
        <TouchableOpacity style={styles.captainBanner} onPress={() => setCaptainMode(null)}>
          <Text style={styles.captainBannerText}>
            {captainMode === 'captain' ? '👑 Tap a selected player to make Captain (2x points)' : '⭐ Tap a selected player for Vice-Captain (1.5x points)'}
          </Text>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}

      {/* Players list */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.columnHeader}>
          <Text style={[styles.colText, { flex: 1 }]}>Player</Text>
          <Text style={styles.colText}>Credits</Text>
          <Text style={styles.colText}>Pts</Text>
        </View>
        {filteredPlayers.map(player => {
          const isSelected = !!selected[player._id];
          const isCaptain = captain === player._id;
          const isVC = vc === player._id;
          return (
            <TouchableOpacity
              key={player._id}
              style={[styles.playerRow, isSelected && styles.selectedRow]}
              onPress={() => togglePlayer(player)}>
              <View style={[styles.roleIcon, { backgroundColor: isSelected ? '#FF6B3533' : '#1A3048' }]}>
                <Text style={styles.roleIconText}>{ROLE_ICONS[player.role]}</Text>
              </View>
              <View style={styles.playerInfo}>
                <View style={styles.playerNameRow}>
                  <Text style={[styles.playerName, isSelected && { color: '#FF6B35' }]}>{player.name}</Text>
                  {isCaptain && <View style={styles.capBadge}><Text style={styles.capText}>C</Text></View>}
                  {isVC && <View style={[styles.capBadge, { backgroundColor: '#4A9EFF' }]}><Text style={styles.capText}>VC</Text></View>}
                </View>
                <Text style={styles.playerMeta}>{player.team} • {player.role}</Text>
              </View>
              <Text style={[styles.credits, totalCredits + player.credits > 100 && !isSelected && { color: '#FF4444' }]}>
                {player.credits}
              </Text>
              <Text style={styles.pts}>{player.basePoints || 0}</Text>
              {isSelected && (
                <View style={styles.checkmark}><Text>✓</Text></View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        {selectedList.length > 0 && (
          <View style={styles.captainRow}>
            <TouchableOpacity
              style={[styles.captainBtn, captainMode === 'captain' && { borderColor: '#F7931E', backgroundColor: '#F7931E22' }]}
              onPress={() => setCaptainMode(captainMode === 'captain' ? null : 'captain')}>
              <Text style={styles.captainBtnText}>👑 Set Captain</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.captainBtn, captainMode === 'vc' && { borderColor: '#4A9EFF', backgroundColor: '#4A9EFF22' }]}
              onPress={() => setCaptainMode(captainMode === 'vc' ? null : 'vc')}>
              <Text style={styles.captainBtnText}>⭐ Set VC</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity onPress={saveTeam} disabled={saving}>
          <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.saveBtn}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Save Team ({selectedList.length}/11)</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 50, backgroundColor: '#0A1628' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { color: '#FF6B35', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#667788', fontSize: 11, marginTop: 2 },
  roleBar: { paddingHorizontal: 12, paddingVertical: 10, maxHeight: 52 },
  roleTab: { paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#0F2030', borderWidth: 1, borderColor: '#1A3048' },
  activeRoleTab: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  roleTabText: { color: '#667788', fontSize: 12, fontWeight: '600' },
  activeRoleText: { color: '#fff' },
  captainBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FF6B3522', borderColor: '#FF6B35', borderWidth: 1, margin: 12, borderRadius: 10, padding: 10 },
  captainBannerText: { color: '#FF6B35', fontSize: 12, flex: 1 },
  cancelText: { color: '#FF4444', fontSize: 12, fontWeight: '700', marginLeft: 8 },
  columnHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1A3048' },
  colText: { color: '#667788', fontSize: 12, fontWeight: '600', width: 60, textAlign: 'center' },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#0F2030' },
  selectedRow: { backgroundColor: '#FF6B3511' },
  roleIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  roleIconText: { fontSize: 20 },
  playerInfo: { flex: 1 },
  playerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  playerName: { color: '#ddd', fontSize: 15, fontWeight: '700' },
  playerMeta: { color: '#667788', fontSize: 12, marginTop: 2 },
  capBadge: { backgroundColor: '#F7931E', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  capText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  credits: { color: '#4A9EFF', fontSize: 13, fontWeight: '700', width: 50, textAlign: 'center' },
  pts: { color: '#44BB88', fontSize: 13, fontWeight: '700', width: 40, textAlign: 'center' },
  checkmark: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#0A1628', borderTopWidth: 1, borderColor: '#1A3048' },
  captainRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  captainBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#1A3048', alignItems: 'center' },
  captainBtnText: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
