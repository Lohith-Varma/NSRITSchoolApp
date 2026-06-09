import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {ERPLayout} from '../../components';
import {colors, spacing, typography} from '../../theme';

const FrontDeskDashboardScreen = ({navigation}) => {
  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Dashboard"
      title="Front Desk Console"
      breadcrumbs={['Dashboard', 'Console']}>
      <View style={styles.container}>
        <Text style={styles.title}>Front Desk Dashboard (Coming Soon)</Text>
      </View>
    </ERPLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    color: colors.textSoft,
  },
});

export default FrontDeskDashboardScreen;
