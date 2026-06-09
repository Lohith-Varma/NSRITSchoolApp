import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {ERPLayout} from '../../components';
import {colors, spacing, typography} from '../../theme';

const EventsScreen = ({navigation}) => {
  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Events"
      title="Events"
      breadcrumbs={['Dashboard', 'Events']}>
      <View style={styles.container}>
        <Text style={styles.title}>Events (Coming Soon)</Text>
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

export default EventsScreen;
