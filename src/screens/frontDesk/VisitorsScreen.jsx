import React, {useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {EmptyState, FloatingActionButton, SearchBar} from '../../components';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const MOCK_VISITORS = [
  {
    id: 'v1',
    name: 'Rajesh Kumar',
    purpose: 'Meeting with Principal',
    contact: '9876543210',
    checkIn: '09:15 AM',
    checkOut: '10:30 AM',
    status: 'Checked Out',
    idProof: 'Aadhaar',
  },
  {
    id: 'v2',
    name: 'Sunita Reddy',
    purpose: 'Fee Payment Query',
    contact: '8765432109',
    checkIn: '10:45 AM',
    checkOut: null,
    status: 'Inside',
    idProof: 'PAN Card',
  },
  {
    id: 'v3',
    name: 'Mohammed Irfan',
    purpose: 'Child Admission Enquiry',
    contact: '7654321098',
    checkIn: '11:20 AM',
    checkOut: '12:00 PM',
    status: 'Checked Out',
    idProof: 'Driving License',
  },
  {
    id: 'v4',
    name: 'Lakshmi Devi',
    purpose: 'Parent-Teacher Meeting',
    contact: '6543210987',
    checkIn: '02:00 PM',
    checkOut: null,
    status: 'Inside',
    idProof: 'Voter ID',
  },
];

const STATUS_META = {
  Inside: {color: colors.success, bg: colors.successSoft, icon: 'account-check-outline'},
  'Checked Out': {color: colors.textMuted, bg: colors.neutralSoft, icon: 'account-arrow-right-outline'},
};

const VisitorCard = ({visitor, index, onCheckOut}) => {
  const meta = STATUS_META[visitor.status] || STATUS_META['Checked Out'];

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(240).springify()}>
      <View style={[styles.visitorCard, visitor.status === 'Inside' && styles.visitorCardActive]}>
        <View style={styles.cardTop}>
          <View style={styles.visitorAvatar}>
            <Text style={styles.visitorAvatarText}>
              {visitor.name
                .split(' ')
                .slice(0, 2)
                .map(w => w[0])
                .join('')
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.visitorInfo}>
            <Text style={styles.visitorName}>{visitor.name}</Text>
            <Text style={styles.visitorPurpose}>{visitor.purpose}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: meta.bg}]}>
            <MaterialCommunityIcons name={meta.icon} size={12} color={meta.color} />
            <Text style={[styles.statusText, {color: meta.color}]}>
              {visitor.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="clock-in"
              size={12}
              color={colors.success}
            />
            <Text style={styles.metaText}>In: {visitor.checkIn}</Text>
          </View>
          {visitor.checkOut ? (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="clock-out"
                size={12}
                color={colors.textMuted}
              />
              <Text style={styles.metaText}>Out: {visitor.checkOut}</Text>
            </View>
          ) : null}
          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="card-account-details-outline"
              size={12}
              color={colors.info}
            />
            <Text style={styles.metaText}>{visitor.idProof}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={12}
              color={colors.textSoft}
            />
            <Text style={styles.metaText}>{visitor.contact}</Text>
          </View>
        </View>

        {visitor.status === 'Inside' ? (
          <Pressable
            onPress={() => onCheckOut(visitor.id)}
            style={styles.checkOutBtn}>
            <MaterialCommunityIcons
              name="account-arrow-right"
              size={14}
              color={colors.white}
            />
            <Text style={styles.checkOutText}>Mark Check-Out</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
};

const CheckInModal = ({visible, onClose, onSubmit}) => {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [contact, setContact] = useState('');

  if (!visible) {return null;}

  return (
    <View style={styles.modalOverlay}>
      <Animated.View
        entering={FadeInDown.duration(280).springify()}
        style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Visitor Check-In</Text>
          <Pressable onPress={onClose} style={styles.modalClose}>
            <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Visitor Name *</Text>
        <View style={styles.fieldInput}>
          <Text
            style={[styles.fieldPlaceholder, name.length > 0 && {display: 'none'}]}>
            Full name
          </Text>
        </View>
        <Text style={styles.fieldLabel}>Purpose *</Text>
        <Text style={styles.fieldLabel}>Contact Number</Text>

        <Pressable
          onPress={() => {
            onSubmit({name: 'New Visitor', purpose: 'Enquiry', contact: '-'});
            onClose();
          }}
          style={styles.modalSubmit}>
          <MaterialCommunityIcons name="check" size={16} color={colors.white} />
          <Text style={styles.modalSubmitText}>Register Check-In</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const VisitorsScreen = () => {
  const [visitors, setVisitors] = useState(MOCK_VISITORS);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const insideCount = visitors.filter(v => v.status === 'Inside').length;
  const todayCount = visitors.length;

  const filtered = visitors.filter(v =>
    `${v.name} ${v.purpose}`.toLowerCase().includes(query.toLowerCase()),
  );

  const handleCheckOut = id => {
    const now = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    setVisitors(prev =>
      prev.map(v =>
        v.id === id ? {...v, status: 'Checked Out', checkOut: now} : v,
      ),
    );
  };

  const handleAddVisitor = ({name, purpose, contact}) => {
    const now = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    setVisitors(prev => [
      {
        id: `v${Date.now()}`,
        name,
        purpose,
        contact: contact || '-',
        checkIn: now,
        checkOut: null,
        status: 'Inside',
        idProof: 'Verified',
      },
      ...prev,
    ]);
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <Animated.View
              entering={FadeInDown.duration(280).springify()}
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Today · {new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}</Text>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.headerTitle}>Visitor Log</Text>
                  <Text style={styles.headerSub}>Campus entry & exit tracking</Text>
                </View>
              </View>
              <View style={styles.headerStats}>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatNum}>{todayCount}</Text>
                  <Text style={styles.headerStatLabel}>Total Today</Text>
                </View>
                <View style={styles.headerStatSep} />
                <View style={styles.headerStat}>
                  <Text style={[styles.headerStatNum, {color: colors.success}]}>
                    {insideCount}
                  </Text>
                  <Text style={styles.headerStatLabel}>Currently Inside</Text>
                </View>
              </View>
            </Animated.View>

            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search visitor name or purpose"
            />

            {filtered.length > 0 ? (
              <Text style={styles.resultMeta}>
                {filtered.length} visitor{filtered.length !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <VisitorCard
            visitor={item}
            index={index}
            onCheckOut={handleCheckOut}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No visitors"
            message={
              query.trim()
                ? 'No visitors match your search.'
                : 'No visitor check-ins recorded today.'
            }
            actionLabel={query.trim() ? undefined : 'Register Visitor'}
            onAction={query.trim() ? undefined : () => setShowModal(true)}
          />
        }
        ListFooterComponent={<View style={{height: spacing.xxxl + spacing.xl}} />}
      />

      <FloatingActionButton
        icon="account-plus"
        label="Check In"
        onPress={() => setShowModal(true)}
        extended
      />

      <CheckInModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddVisitor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

  // Header
  header: {
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130,
  },
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {color: colors.white, fontSize: 20, fontWeight: '800'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 2},
  headerStats: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xl,
  },
  headerStat: {gap: 2},
  headerStatNum: {color: colors.white, fontSize: 22, fontWeight: '800'},
  headerStatLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600'},
  headerStatSep: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 30,
    width: 1,
  },

  resultMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },

  // Visitor card
  visitorCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.soft,
  },
  visitorCardActive: {
    borderColor: `${colors.success}40`,
    borderWidth: 1.5,
  },
  cardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  visitorAvatar: {
    alignItems: 'center',
    backgroundColor: `${colors.secondary}18`,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  visitorAvatarText: {color: colors.secondary, fontSize: 13, fontWeight: '800'},
  visitorInfo: {flex: 1},
  visitorName: {...typography.bodyBold, color: colors.text},
  visitorPurpose: {...typography.caption, color: colors.textMuted, marginTop: 2},
  statusBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusText: {fontSize: 10, fontWeight: '800'},

  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
    paddingTop: spacing.xs,
  },
  metaItem: {alignItems: 'center', flexDirection: 'row', gap: 4},
  metaText: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},

  checkOutBtn: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  checkOutText: {color: colors.white, fontSize: 13, fontWeight: '700'},

  // Modal
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    bottom: 0,
    justifyContent: 'flex-end',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    margin: spacing.lg,
    padding: spacing.lg,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {...typography.bodyBold, color: colors.text, fontSize: 16},
  modalClose: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 44,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  fieldPlaceholder: {color: colors.textSoft, fontSize: 14},
  modalSubmit: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 46,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  modalSubmitText: {color: colors.white, fontSize: 14, fontWeight: '700'},
});

export default VisitorsScreen;
