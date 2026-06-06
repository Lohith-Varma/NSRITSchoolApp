import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Button, Card, Text} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {ERPLayout} from '../../components';
import {logoutUser} from '../../store/slices/authSlice';
import {ROLE_LABELS} from '../../config/constants';
import {colors, radius, spacing, typography, shadows} from '../../theme';

const ProfileScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {user, role} = useSelector(state => state.auth);
  
  const userInitials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'US';

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Profile"
      title="Administrator Profile"
      breadcrumbs={['Dashboard', 'System', 'Profile']}>
      <View style={styles.container}>
        
        {/* Profile Details Card */}
        <Card mode="outlined" style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text size={72} label={userInitials} style={styles.avatar} labelStyle={styles.avatarText} />
            <Text style={styles.profileName}>{user?.fullName || 'NSRIT Administrator'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{ROLE_LABELS[role] || 'Main Admin'}</Text>
            </View>
            <Text style={styles.phoneText}>{user?.phoneNumber || 'No phone set'}</Text>
          </Card.Content>
        </Card>

        {/* System Settings/Details Card */}
        <Card mode="outlined" style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionHeader}>System Environment Info</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>v1.0.0 (Release)</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Database Environment</Text>
              <Text style={styles.infoValue}>Firebase Data Connect</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Region</Text>
              <Text style={styles.infoValue}>asia-south1 (Live)</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Auth Service</Text>
              <Text style={styles.infoValue}>Production Phone Auth</Text>
            </View>
            <View style={[styles.infoRow, styles.lastInfoRow]}>
              <Text style={styles.infoLabel}>Active Workspace</Text>
              <Text style={styles.infoValue}>chaitanyareddykarri/NSRITSchoolApp</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutBtn}
          labelStyle={styles.logoutLabel}
          buttonColor={colors.danger}>
          Sign Out of ERP
        </Button>

      </View>
    </ERPLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    flex: 1,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  profileContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginTop: spacing.xxs,
    marginBottom: spacing.xs,
  },
  roleText: {
    color: colors.secondary,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  phoneText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  logoutBtn: {
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    ...shadows.soft,
  },
  logoutLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ProfileScreen;
