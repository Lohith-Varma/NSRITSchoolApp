import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import {IconButton} from 'react-native-paper';
import {colors, spacing, radius} from '../../../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.76;

const SideDrawer = ({
  visible,
  onClose,
  navigation,
  activeRoute = 'AccountantDashboard',
  userName = 'Jane Doe, CPA',
  userRole = 'Lead Auditor',
  userId = 'ACC-99234',
  userAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLykNU2rFq-M0MVDO7FY7J9EPOl30m1xB1z22bQGg_l2WEJsqucLiJ_2kAPao6b-q6H43z8FBOabx5X74dJ-4D6NrrWisJe9VqXUIVd9WKGSyBDbvVJo0ES_7b5OlzMRTqbHjp7i6y8YHl1uS3Lz0bB7EF5NNGIecHQC0H98f2yQdJiSiRGJalxzwbJKc-ZL_pv1l2BGN_LC4esyg7hDUGxdnggWzdqYuegHXPi79dA84mcJbjwyj1WJHc2dHxso3XlLn6ue1lU-Bk',
}) => {
  console.log('SideDrawer rendering! visible =', visible);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('SideDrawer useEffect visible =', visible);
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        console.log('SideDrawer open animation complete');
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        console.log('SideDrawer close animation complete');
      });
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigate = route => {
    onClose();
    // Prevent double navigation if already there
    if (activeRoute !== route) {
      if (route === 'Logout') {
        navigation.replace('Login');
      } else {
        navigation.navigate(route);
      }
    }
  };

  const navItems = [
    {label: 'Dashboard', icon: 'view-dashboard', route: 'AccountantDashboard'},
    {label: 'Record Offline Payment', icon: 'cash-register', route: 'RecordPayment'},
    {label: 'Result Posting', icon: 'clipboard-check-outline', route: 'ResultPosting'},
    {label: 'Fee Tracking', icon: 'currency-usd', route: 'FeeDashboard'},
    {label: 'Create Notification', icon: 'megaphone-outline', route: 'CreateNotification'},
    {label: 'Audit Logs', icon: 'history', route: 'AuditLogs'},
    {label: 'Settings', icon: 'cog-outline', route: 'AccountantProfile'},
  ];

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none">
      <View style={styles.container}>
        {/* Scrim Overlay */}
        <Animated.View style={[styles.scrim, {opacity: fadeAnim}]}>
          <Pressable style={styles.dismissPressable} onPress={onClose} />
        </Animated.View>

        {/* Drawer Content */}
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{translateX: slideAnim}],
            },
          ]}>
          <View style={styles.drawerHeader}>
            <View style={styles.avatarBorder}>
              <Image source={{uri: userAvatar}} style={styles.avatar} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>{userRole}</Text>
              <Text style={styles.userId}>ID: {userId}</Text>
            </View>
          </View>

          <ScrollView style={styles.navScroll} contentContainerStyle={styles.navContent}>
            {navItems.map((item, idx) => {
              const isActive = activeRoute === item.route;
              return (
                <Pressable
                  key={idx}
                  style={[
                    styles.navItem,
                    isActive && styles.activeNavItem,
                  ]}
                  onPress={() => handleNavigate(item.route)}>
                  <IconButton
                    icon={item.icon}
                    iconColor={isActive ? colors.secondary : colors.textMuted}
                    size={22}
                    style={styles.navIcon}
                  />
                  <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.divider} />

            {/* Logout item */}
            <Pressable
              style={styles.navItem}
              onPress={() => handleNavigate('Logout')}>
              <IconButton
                icon="logout"
                iconColor={colors.danger}
                size={22}
                style={styles.navIcon}
              />
              <Text style={[styles.navLabel, styles.logoutLabel]}>Logout</Text>
            </Pressable>
          </ScrollView>

          {/* System Health Footer */}
          <View style={styles.drawerFooter}>
            <View style={styles.healthCard}>
              <View style={styles.healthDot} />
              <Text style={styles.healthText}>System Health: Optimal</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 22, 42, 0.45)',
  },
  dismissPressable: {
    flex: 1,
  },
  drawer: {
    backgroundColor: colors.background,
    width: DRAWER_WIDTH,
    height: '100%',
    elevation: 16,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: spacing.xxl,
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  userRole: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  userId: {
    fontSize: 10,
    color: colors.textSoft,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  navScroll: {
    flex: 1,
  },
  navContent: {
    paddingVertical: spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  activeNavItem: {
    backgroundColor: colors.accentSoft,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  navIcon: {
    margin: 0,
    marginRight: spacing.sm,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeNavLabel: {
    color: colors.secondary,
    fontWeight: '700',
  },
  logoutLabel: {
    color: colors.danger,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  drawerFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});

export default SideDrawer;
