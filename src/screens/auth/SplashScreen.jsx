import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
    Image,
} from 'react-native';

const SplashScreen = ({ onFinish }) => {
    // Animation Refs
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(20)).current;

    const dividerScaleX = useRef(new Animated.Value(0)).current;
    const mottoOpacity = useRef(new Animated.Value(0)).current;

    const sanskritOpacity = useRef(new Animated.Value(0)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    
    const systemOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Run overlapping realistic animations
        Animated.parallel([
            // 1. Logo scale & fade
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),

            // 2. Title fade & slide up (starts at t=250ms)
            Animated.sequence([
                Animated.delay(250),
                Animated.parallel([
                    Animated.timing(titleOpacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(titleTranslateY, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]),
            ]),

            // 3. Motto & Dividers expand (starts at t=450ms)
            Animated.sequence([
                Animated.delay(450),
                Animated.parallel([
                    Animated.timing(dividerScaleX, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(mottoOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
            ]),

            // 4. Sanskrit & Tagline fade (starts at t=650ms)
            Animated.sequence([
                Animated.delay(650),
                Animated.parallel([
                    Animated.timing(sanskritOpacity, {
                        toValue: 1,
                        duration: 450,
                        useNativeDriver: true,
                    }),
                    Animated.timing(taglineOpacity, {
                        toValue: 1,
                        duration: 450,
                        useNativeDriver: true,
                    }),
                ]),
            ]),

            // 5. System Footer & Loading dots fade (starts at t=850ms)
            Animated.sequence([
                Animated.delay(850),
                Animated.timing(systemOpacity, {
                    toValue: 1,
                    duration: 450,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            // Short hold delay of 1200ms before transition (Total duration = 1300ms + 1200ms = 2.5 seconds)
            setTimeout(() => {
                onFinish?.();
            }, 1200);
        });
    }, [
        logoScale,
        logoOpacity,
        titleOpacity,
        titleTranslateY,
        dividerScaleX,
        mottoOpacity,
        sanskritOpacity,
        taglineOpacity,
        systemOpacity,
        onFinish
    ]);

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor="#F2F4F7"
                barStyle="dark-content"
            />

            {/* Subtle Modern Background Shapes */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            {/* Main Branding Content */}
            <View style={styles.content}>
                {/* Crest Logo */}
                <Animated.View
                    style={{
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    }}
                >
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* School Name Text */}
                <Animated.View
                    style={[
                        styles.titleContainer,
                        {
                            opacity: titleOpacity,
                            transform: [{ translateY: titleTranslateY }],
                        }
                    ]}
                >
                    <Text style={styles.schoolName}>
                        NADIMPALLI SATYANARAYANA RAJU
                    </Text>
                    <Text style={styles.schoolSubName}>
                        INTERNATIONAL TECHNO SCHOOL
                    </Text>
                </Animated.View>

                {/* Motto & Taglines with Dividers */}
                <Animated.View style={[styles.mottoContainer, { opacity: mottoOpacity }]}>
                    {/* Divider Row 1 */}
                    <View style={styles.dividerRow}>
                        <View style={styles.greenDot} />
                        <Animated.View style={[styles.line, { transform: [{ scaleX: dividerScaleX }] }]} />
                        <View style={styles.greenDot} />
                    </View>

                    {/* Motto */}
                    <Text style={styles.motto}>
                        UNITY • LEARNING • GROWTH
                    </Text>

                    {/* Divider Row 2 with Sanskrit Text */}
                    <View style={styles.sanskritRow}>
                        <View style={styles.greenDot} />
                        <Animated.View style={[styles.lineHalf, { transform: [{ scaleX: dividerScaleX }] }]} />
                        
                        <Animated.Text style={[styles.sanskritText, { opacity: sanskritOpacity }]}>
                            ज्ञानं परमं बलम्
                        </Animated.Text>
                        
                        <Animated.View style={[styles.lineHalf, { transform: [{ scaleX: dividerScaleX }] }]} />
                        <View style={styles.greenDot} />
                    </View>

                    {/* English Tagline */}
                    <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
                        Knowledge is the supreme strength
                    </Animated.Text>
                </Animated.View>
            </View>

            {/* Footer System Badge & Loading Indicator */}
            <Animated.View style={[styles.footer, { opacity: systemOpacity }]}>
                <Text style={styles.systemText}>
                    NSRIT CONNECT
                </Text>
                <LoadingDots />
            </Animated.View>
        </View>
    );
};

const LoadingDots = () => {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animateDot = (dot, delay) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0.3,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                ])
            );

        Animated.parallel([
            animateDot(dot1, 0),
            animateDot(dot2, 120),
            animateDot(dot3, 240),
        ]).start();
    }, [dot1, dot2, dot3]);

    return (
        <View style={styles.loadingRow}>
            {[dot1, dot2, dot3].map((dot, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.dot,
                        { opacity: dot },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F4F7',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 40,
    },

    bgCircle1: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: '#E2EAF5',
        top: -90,
        right: -60,
        opacity: 0.6,
    },

    bgCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#E8EDF7',
        bottom: 80,
        left: -70,
        opacity: 0.6,
    },

    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        marginTop: 20,
    },

    titleContainer: {
        alignItems: 'center',
        marginTop: 20,
    },

    mottoContainer: {
        alignItems: 'center',
        width: '100%',
    },

    logo: {
        width: 140,
        height: 224, // 1:1.6 aspect ratio
        marginBottom: 20,
    },

    schoolName: {
        color: '#1F344A',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
        textAlign: 'center',
        lineHeight: 20,
    },

    schoolSubName: {
        marginTop: 4,
        color: '#1F344A',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 2.2,
        textAlign: 'center',
    },

    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 280,
        marginTop: 16,
        marginBottom: 10,
    },

    sanskritRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 280,
        marginTop: 12,
        marginBottom: 8,
    },

    greenDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#3AAB47',
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#D4D3D3',
        marginHorizontal: 8,
    },

    lineHalf: {
        flex: 1,
        height: 1,
        backgroundColor: '#D4D3D3',
        marginHorizontal: 8,
    },

    motto: {
        color: '#3AAB47',
        fontSize: 12,
        letterSpacing: 2.5,
        fontWeight: '700',
        textAlign: 'center',
    },

    sanskritText: {
        color: '#1F344A',
        fontSize: 14,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 0.5,
    },

    tagline: {
        color: '#3AAB47',
        fontSize: 12,
        fontWeight: '600',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 4,
    },

    footer: {
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },

    systemText: {
        color: '#1F344A',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 3,
        marginBottom: 15,
    },

    loadingRow: {
        flexDirection: 'row',
        gap: 8,
        height: 12,
        alignItems: 'center',
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1F344A',
    },
});

export default SplashScreen;