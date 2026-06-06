import React from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {Card, Text, Button} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {Header, ERPLayout} from '../../components';
import {colors, radius, shadows, spacing} from '../../theme';

const ManageUsersScreen = ({navigation}) => {
  const navigateToBranchList = () => {
    Toast.show({
      type: 'info',
      text1: 'Select a branch',
      text2: 'Users must be provisioned within a specific branch context.',
    });
    navigation.navigate('BranchList');
  };

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Users"
      title="Create Users"
      breadcrumbs={['Dashboard', 'Users & Students', 'Users']}>
      <View style={styles.container}>
        <Header
          title="Create Users"
          subtitle="Provision branch admins and role-based school users"
        />

        <TouchableOpacity activeOpacity={0.7} onPress={navigateToBranchList} style={styles.cardWrapper}>
          <Card mode="outlined" style={styles.actionCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="shield-account" size={32} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Branch Admin</Text>
                <Text style={styles.cardDescription}>
                  Create administrators for specific branches.
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
            </Card.Content>
            <View style={styles.cardFooter}>
              <Button 
                mode="contained" 
                onPress={navigateToBranchList} 
                buttonColor={colors.primary}
                style={styles.actionBtn}>
                Create Branch Admin
              </Button>
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={navigateToBranchList} style={styles.cardWrapper}>
          <Card mode="outlined" style={styles.actionCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconContainerAlt}>
                <MaterialCommunityIcons name="account-group" size={32} color={colors.secondary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>School Roles</Text>
                <Text style={styles.cardDescription}>
                  Create Principals, Coordinators, Teachers, and Parents.
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
            </Card.Content>
            <View style={styles.cardFooter}>
              <Button 
                mode="contained" 
                onPress={navigateToBranchList} 
                buttonColor={colors.secondary}
                style={styles.actionBtn}>
                Create School User
              </Button>
            </View>
          </Card>
        </TouchableOpacity>

      </View>
    </ERPLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    flex: 1,
  },
  cardWrapper: {
    marginBottom: spacing.lg,
  },
  actionCard: {
    backgroundColor: colors.white,
    borderWidth: 0,
    borderRadius: radius.lg,
    ...shadows.card,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainerAlt: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.textSoft,
    lineHeight: 18,
  },
  cardFooter: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 0,
  },
  actionBtn: {
    borderRadius: radius.md,
  },
});

export default ManageUsersScreen;
