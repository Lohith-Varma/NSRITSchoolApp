import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Svg, {Circle, Line, Path} from 'react-native-svg';

const {width: W} = Dimensions.get('window');

const NAVY  = '#1F3E66';
const GREEN = '#3DAE49';
const WHITE = '#FFFFFF';
const CREAM = '#F7F9FC';

const LOGO_W = W * 0.44;
const LOGO_H = LOGO_W * 1.62;

// Constellation nodes (viewBox coords within SVG width=160 height=90)
const NODES = [
  {id: 'n0', x: 80,  y: 10},
  {id: 'n1', x: 115, y: 25},
  {id: 'n2', x: 148, y: 18},
  {id: 'n3', x: 130, y: 55},
  {id: 'n4', x: 95,  y: 40},
  {id: 'n5', x: 155, y: 50},
  {id: 'n6', x: 108, y: 72},
  {id: 'n7', x: 140, y: 80},
];

const EDGES = [
  ['n0', 'n1'], ['n1', 'n2'], ['n2', 'n5'],
  ['n1', 'n4'], ['n4', 'n3'], ['n3', 'n5'],
  ['n3', 'n6'], ['n5', 'n7'], ['n6', 'n7'],
  ['n0', 'n4'], ['n2', 'n3'],
];

const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

const AnimatedLine   = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath   = Animated.createAnimatedComponent(Path);

// Shield path in a 100×120 viewBox
const SHIELD_PATH = 'M 50 4 L 94 18 L 94 58 Q 94 92 50 116 Q 6 92 6 58 L 6 18 Z';

// ── Letter-by-letter text reveal ──────────────────────────────────────────────
const AnimatedLetters = ({text, style, startDelay = 0, letterDelay = 55}) => {
  const opacities = useRef(text.split('').map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel(
      text.split('').map((_, i) =>
        Animated.timing(opacities[i], {
          toValue: 1, duration: 260,
          delay: startDelay + i * letterDelay,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
      ),
    ).start();
  }, []);

  return (
    <View style={styles.lettersRow}>
      {text.split('').map((char, i) => (
        <Animated.Text key={i} style={[style, {opacity: opacities[i]}]}>
          {char}
        </Animated.Text>
      ))}
    </View>
  );
};

// ── Tech-network overlay ──────────────────────────────────────────────────────
// Uses a single Animated.Value (progress 0→1) to stagger edges + nodes.
// Nodes use fixed radius (no animated r) to avoid Android radius=0 crash.
const TechNetwork = ({progress}) => (
  <View style={styles.svgNetworkWrap} pointerEvents="none">
    <Svg width={160} height={90} viewBox="80 0 80 90">
      {EDGES.map(([a, b], i) => {
        const na  = nodeMap[a];
        const nb  = nodeMap[b];
        const t0  = (i / EDGES.length) * 0.7;
        const t1  = Math.min(t0 + 0.3, 1);
        const opacity = progress.interpolate({
          inputRange: [t0, t1], outputRange: [0, 0.55], extrapolate: 'clamp',
        });
        return (
          <AnimatedLine
            key={`e${i}`}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={GREEN} strokeWidth="0.9" opacity={opacity}
          />
        );
      })}

      {NODES.map((node, i) => {
        const t0  = (i / NODES.length) * 0.65;
        const t1  = Math.min(t0 + 0.25, 1);
        const opacity = progress.interpolate({
          inputRange: [t0, t1], outputRange: [0, 1], extrapolate: 'clamp',
        });
        const radius = i % 3 === 0 ? 3.5 : 2.2;
        return (
          <AnimatedCircle
            key={node.id}
            cx={node.x} cy={node.y} r={radius}
            fill={GREEN} opacity={opacity}
          />
        );
      })}
    </Svg>
  </View>
);

// ── Shield glow overlay ───────────────────────────────────────────────────────
// Three concentric strokes (solid + soft + bloom) animated by glowProgress.
// pulseAnim drives stroke-width oscillation.
const ShieldGlow = ({glowProgress, pulseAnim}) => {
  const innerOp = glowProgress.interpolate({
    inputRange: [0, 0.5, 1], outputRange: [0, 0.85, 0.6],
  });
  const midOp = glowProgress.interpolate({
    inputRange: [0, 0.5, 1], outputRange: [0, 0.18, 0.1],
  });
  const outerOp = glowProgress.interpolate({
    inputRange: [0, 0.6, 1], outputRange: [0, 0.07, 0.04],
  });
  const sw = pulseAnim.interpolate({
    inputRange: [0, 1], outputRange: [1.5, 3.0],
  });

  return (
    <View style={styles.svgShieldWrap} pointerEvents="none">
      <Svg width={LOGO_W} height={LOGO_H * 0.82} viewBox="0 0 100 120">
        <AnimatedPath d={SHIELD_PATH} fill="none" stroke={GREEN}
          strokeWidth={sw} strokeOpacity={innerOp} strokeLinejoin="round" />
        <AnimatedPath d={SHIELD_PATH} fill="none" stroke={GREEN}
          strokeWidth="6" strokeOpacity={midOp} strokeLinejoin="round" />
        <AnimatedPath d={SHIELD_PATH} fill="none" stroke={GREEN}
          strokeWidth="10" strokeOpacity={outerOp} strokeLinejoin="round" />
      </Svg>
    </View>
  );
};

// ── SplashScreen ──────────────────────────────────────────────────────────────
const SplashScreen = ({onFinish}) => {
  // Phase 1 — background fade
  const bgAnim      = useRef(new Animated.Value(0)).current;

  // Phase 2 — logo reveal
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.8)).current;
  const logoTransY  = useRef(new Animated.Value(24)).current;

  // Phase 3 — tech network
  const netProgress = useRef(new Animated.Value(0)).current;

  // Phase 4 — shield glow
  const glowProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(0)).current;

  // Phase 5 — text reveal
  const [showTitle,    setShowTitle]    = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const subtitleOp   = useRef(new Animated.Value(0)).current;

  // Phase 6 — tagline + system
  const [showTagline, setShowTagline] = useState(false);
  const taglineOp    = useRef(new Animated.Value(0)).current;
  const dividerScale = useRef(new Animated.Value(0)).current;
  const systemOp     = useRef(new Animated.Value(0)).current;

  // Exit
  const screenOp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1 — 0ms
    Animated.timing(bgAnim, {
      toValue: 1, duration: 700,
      easing: Easing.out(Easing.quad), useNativeDriver: false,
    }).start();

    // Phase 2 — 600ms
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(logoScale,  {toValue: 1, tension: 42, friction: 7, useNativeDriver: true}),
        Animated.timing(logoOpacity, {toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
        Animated.timing(logoTransY,  {toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
      ]).start();
    }, 600);

    // Phase 3 — 1400ms
    setTimeout(() => {
      Animated.timing(netProgress, {
        toValue: 1, duration: 1100,
        easing: Easing.out(Easing.quad), useNativeDriver: false,
      }).start();
    }, 1400);

    // Phase 4 — 2300ms
    setTimeout(() => {
      Animated.timing(glowProgress, {
        toValue: 1, duration: 900,
        easing: Easing.inOut(Easing.quad), useNativeDriver: false,
      }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false}),
          Animated.timing(pulseAnim, {toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false}),
        ]),
      ).start();
    }, 2300);

    // Phase 5 — 3200ms school name, 3800ms badge
    setTimeout(() => setShowTitle(true), 3200);
    setTimeout(() => {
      setShowSubtitle(true);
      Animated.timing(subtitleOp, {toValue: 1, duration: 450, useNativeDriver: true}).start();
    }, 3800);

    // Phase 6 — 4200ms tagline, 4900ms system text
    setTimeout(() => {
      setShowTagline(true);
      Animated.parallel([
        Animated.timing(taglineOp,    {toValue: 1, duration: 500, useNativeDriver: true}),
        Animated.timing(dividerScale, {toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true}),
      ]).start();
    }, 4200);
    setTimeout(() => {
      Animated.timing(systemOp, {toValue: 1, duration: 500, useNativeDriver: true}).start();
    }, 4900);

    // Exit — 5600ms
    setTimeout(() => {
      Animated.timing(screenOp, {
        toValue: 0, duration: 550,
        easing: Easing.in(Easing.quad), useNativeDriver: true,
      }).start(() => onFinish?.());
    }, 5600);
  }, []);

  const bgColor = bgAnim.interpolate({inputRange: [0, 1], outputRange: [WHITE, CREAM]});

  return (
    <Animated.View style={[styles.root, {opacity: screenOp}]}>
      <StatusBar backgroundColor={WHITE} barStyle="dark-content" translucent />

      {/* Background */}
      <Animated.View style={[StyleSheet.absoluteFill, {backgroundColor: bgColor}]} />

      {/* Corner accents */}
      <View style={styles.cornerTL} />
      <View style={styles.cornerBR} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.logoWrap,
              {opacity: logoOpacity, transform: [{scale: logoScale}, {translateY: logoTransY}]},
            ]}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <TechNetwork progress={netProgress} />
            <ShieldGlow glowProgress={glowProgress} pulseAnim={pulseAnim} />
          </Animated.View>
        </View>

        {/* School name — letter-by-letter */}
        {showTitle && (
          <View style={styles.titleSection}>
            <AnimatedLetters text="NADIMPALLI SATYANARAYANA RAJU" style={styles.schoolName} startDelay={0} letterDelay={38} />
            <View style={styles.dividerRow}>
              <View style={styles.dot} />
              <Animated.View style={[styles.dividerLine, {transform: [{scaleX: dividerScale}]}]} />
              <View style={styles.dot} />
            </View>
            <AnimatedLetters text="INTERNATIONAL TECHNO SCHOOL" style={styles.subName} startDelay={120} letterDelay={30} />
          </View>
        )}

        {/* NSRIT Connect badge */}
        {showSubtitle && (
          <Animated.View style={[styles.connectBadge, {opacity: subtitleOp}]}>
            <View style={styles.connectAccent} />
            <Animated.Text style={styles.connectText}>NSRIT Connect</Animated.Text>
            <View style={styles.connectAccent} />
          </Animated.View>
        )}

        {/* Motto + tagline */}
        {showTagline && (
          <Animated.View style={[styles.mottoSection, {opacity: taglineOp}]}>
            <Animated.Text style={styles.motto}>UNITY  •  LEARNING  •  GROWTH</Animated.Text>
            <View style={styles.sanskritRow}>
              <View style={styles.dot} />
              <Animated.View style={[styles.dividerLineHalf, {transform: [{scaleX: dividerScale}]}]} />
              <Animated.Text style={styles.sanskrit}>ज्ञानं परमं बलम्</Animated.Text>
              <Animated.View style={[styles.dividerLineHalf, {transform: [{scaleX: dividerScale}]}]} />
              <View style={styles.dot} />
            </View>
            <Animated.Text style={styles.tagline}>Knowledge is the supreme strength</Animated.Text>
          </Animated.View>
        )}

        {/* System label */}
        <Animated.View style={[styles.systemBadge, {opacity: systemOp}]}>
          <View style={styles.systemDot} />
          <Animated.Text style={styles.systemText}>Smart School Management System</Animated.Text>
          <View style={styles.systemDot} />
        </Animated.View>
      </View>

      {/* Bottom strip */}
      <Animated.View style={[styles.bottomStrip, {opacity: systemOp}]}>
        <View style={styles.bottomBar} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: WHITE},
  cornerTL: {
    backgroundColor: 'transparent', borderColor: GREEN,
    borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 6,
    height: 40, left: 20, opacity: 0.25, position: 'absolute', top: 48, width: 40,
  },
  cornerBR: {
    backgroundColor: 'transparent', borderColor: NAVY,
    borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6,
    bottom: 40, height: 40, opacity: 0.2, position: 'absolute', right: 20, width: 40,
  },
  content: {
    alignItems: 'center', flex: 1, justifyContent: 'center',
    paddingHorizontal: 24, paddingBottom: 48,
  },
  logoContainer: {alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  logoWrap: {alignItems: 'center', justifyContent: 'center', position: 'relative'},
  logo: {width: LOGO_W, height: LOGO_H},
  svgNetworkWrap: {left: LOGO_W * 0.44, position: 'absolute', top: -8},
  svgShieldWrap: {
    bottom: LOGO_H * 0.02, left: 0, position: 'absolute',
    right: 0, alignItems: 'center',
  },
  titleSection: {alignItems: 'center', marginTop: 20, width: '100%'},
  lettersRow: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'},
  schoolName: {
    color: NAVY, fontFamily: 'serif',
    fontSize: W < 360 ? 16 : 19, fontWeight: '900', letterSpacing: 0.6,
  },
  subName: {
    color: NAVY, fontSize: W < 360 ? 10 : 12,
    fontWeight: '700', letterSpacing: 2.2, textAlign: 'center',
  },
  dividerRow: {
    alignItems: 'center', flexDirection: 'row',
    marginVertical: 10, width: '90%',
  },
  dot: {backgroundColor: GREEN, borderRadius: 4, height: 7, width: 7},
  dividerLine: {
    backgroundColor: NAVY, flex: 1, height: 1, marginHorizontal: 8, opacity: 0.4,
  },
  dividerLineHalf: {
    backgroundColor: NAVY, flex: 1, height: 1, marginHorizontal: 8, opacity: 0.35,
  },
  connectBadge: {alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 14},
  connectAccent: {backgroundColor: GREEN, borderRadius: 1, height: 2, width: 22},
  connectText: {color: GREEN, fontSize: 22, fontWeight: '900', letterSpacing: 1.5},
  mottoSection: {alignItems: 'center', marginTop: 16, width: '100%'},
  motto: {
    color: GREEN, fontSize: W < 360 ? 10 : 11.5,
    fontWeight: '800', letterSpacing: 2.8, textAlign: 'center',
  },
  sanskritRow: {
    alignItems: 'center', flexDirection: 'row',
    marginTop: 12, marginBottom: 8, width: '90%',
  },
  sanskrit: {
    color: NAVY, fontSize: 16, fontWeight: '700',
    marginHorizontal: 8, textAlign: 'center',
  },
  tagline: {color: GREEN, fontStyle: 'italic', fontSize: 12, fontWeight: '600'},
  systemBadge: {alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 22},
  systemDot: {backgroundColor: NAVY, borderRadius: 3, height: 5, opacity: 0.35, width: 5},
  systemText: {color: NAVY, fontSize: 11, fontWeight: '600', letterSpacing: 0.8, opacity: 0.6},
  bottomStrip: {alignItems: 'center', paddingBottom: 32},
  bottomBar: {backgroundColor: GREEN, borderRadius: 2, height: 3, opacity: 0.35, width: 48},
});

export default SplashScreen;
