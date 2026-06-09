import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {ERPLayout} from '../../components';
import {colors, spacing, typography} from '../../theme';

const VisitorsScreen = ({navigation}) => {
  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Visitors"
      title="Visitors"
      breadcrumbs={['Dashboard', 'Visitors']}>
      <View style={styles.container}>
        <Text style={styles.title}>Visitors (Coming Soon)</Text>
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

export default VisitorsScreen;
