import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {ERPLayout} from '../../components';
import {colors, spacing, typography} from '../../theme';

const AdmissionsScreen = ({navigation}) => {
  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Admissions"
      title="Admissions"
      breadcrumbs={['Dashboard', 'Admissions']}>
      <View style={styles.container}>
        <Text style={styles.title}>Admissions (Coming Soon)</Text>
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

export default AdmissionsScreen;
