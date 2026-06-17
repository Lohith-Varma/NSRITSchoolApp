import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {EmptyState} from '../../components';
import {colors, radius, shadows, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const ClassWiseFeeReportScreen = () => {
  const records = useSelector(state => state.fees.records);

  const reports = useMemo(() => {
    const grouped = records.reduce((acc, item) => {
      const key = `${item.className}-${item.sectionName}`;
      const current = acc[key] || {
        id: key,
        title: `${item.className} - Section ${item.sectionName}`,
        total: 0,
        paid: 0,
        due: 0,
      };
      current.total += item.totalFee;
      current.paid += item.paidAmount;
      current.due += item.dueAmount;
      acc[key] = current;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [records]);

  return (
    <FlatList
      data={reports}
      keyExtractor={item => item.id}
      style={styles.root}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Animated.View entering={FadeInDown.duration(260).springify()} style={styles.hero}>
          <View style={styles.heroDecor} />
          <Text style={styles.heroOverline}>Reports</Text>
          <Text style={styles.heroTitle}>Class-wise Due Report</Text>
          <Text style={styles.heroSub}>Fee collection grouped by class and section</Text>
        </Animated.View>
      }
      renderItem={({item, index}) => (
        <Animated.View entering={FadeInRight.delay(index * 30).duration(220).springify()} style={styles.reportRow}>
          <View style={styles.reportLeft}>
            <MaterialCommunityIcons name="google-classroom" size={18} color={colors.secondary} />
          </View>
          <View style={styles.reportBody}>
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportMeta}>{formatCurrency(item.paid)} collected of {formatCurrency(item.total)}</Text>
          </View>
          <View style={styles.reportRight}>
            <Text style={styles.dueLabel}>Due</Text>
            <Text style={styles.dueAmount}>{formatCurrency(item.due)}</Text>
          </View>
        </Animated.View>
      )}
      ListEmptyComponent={
        <EmptyState title="No report data" message="Fee records are needed for reports." />
      }
    />
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},
  hero: {
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 120,
    position: 'absolute',
    right: -20,
    top: -35,
    width: 120,
  },
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},
  reportRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.soft,
  },
  reportLeft: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  reportBody: {flex: 1},
  reportTitle: {color: colors.text, fontSize: 13, fontWeight: '700'},
  reportMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  reportRight: {alignItems: 'flex-end'},
  dueLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase'},
  dueAmount: {color: colors.danger, fontSize: 13, fontWeight: '800', marginTop: 1},
});

export default ClassWiseFeeReportScreen;
