import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const stats = [
    { label: 'Coins', value: `🪙 ${user?.coins?.toLocaleString()}`, color: '#F7931E' },
    { label: 'Matches', value: user?.totalMatches || 0, color: '#4A9EFF' },
    { label: 'Wins', value: user?.totalWins || 0, color: '#44BB88' },
    { label: 'Win Rate', value: user?.totalMatches ? `${Math.round((user.totalWins / user.totalMatches) * 100)}%` : '—', color: '#FF6B35' },
  ];

  const menuItems = [
    { icon: '🏆', label: 'Global Leaderboard', onPress: () => navigation.navigate('Leaderboard', { matchId: 'global' }) },
    { icon: '👥', label: 'My Teams', onPress: () => navigation.navigate('My Teams') },
    { icon: '⚙️', label: 'Settings', onPress: () => {} },
    { icon: '❓', label: 'Help & Support', onPress: () => {} },
  ];

  return (
    <LinearGradient colors={['#071525', '#0A1E30']} style={styles.container}>
      <ScrollView>
        {/* Profile header */}
        <LinearGradient colors={['#0A1628', '#0D2137']} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>🛡 Admin</Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 32, paddingTop: 56 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: '800' },
  username: { color: '#fff', fontSize: 22, fontWeight: '800' },
  email: { color: '#667788', fontSize: 14, marginTop: 4 },
  adminBadge: { marginTop: 8, backgroundColor: '#4A9EFF22', borderWidth: 1, borderColor: '#4A9EFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  adminText: { color: '#4A9EFF', fontWeight: '700', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#0F2030', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1A3048' },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#667788', fontSize: 12, marginTop: 4 },
  menu: { margin: 16, backgroundColor: '#0F2030', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1A3048' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#1A3048' },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { color: '#ccc', fontSize: 15, flex: 1 },
  menuArrow: { color: '#445566', fontSize: 22 },
  logoutBtn: { margin: 16, backgroundColor: '#FF444422', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FF4444' },
  logoutText: { color: '#FF4444', fontWeight: '700', fontSize: 16 },
});
