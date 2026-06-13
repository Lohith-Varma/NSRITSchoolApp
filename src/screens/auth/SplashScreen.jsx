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
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(25)).current;

    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const dividerScale = useRef(new Animated.Value(0)).current;

    const mottoOpacity = useRef(new Animated.Value(0)).current;
    const systemOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(200),

            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]),

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

            Animated.timing(subtitleOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),

            Animated.timing(dividerScale, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),

            Animated.timing(mottoOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),

            Animated.timing(systemOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),

            // Hold delay to reach ~3.5 seconds total duration
            Animated.delay(500),
        ]).start(() => {
            onFinish?.();
        });
    }, [logoScale, logoOpacity, titleOpacity, titleTranslateY, subtitleOpacity, dividerScale, mottoOpacity, systemOpacity, onFinish]);

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor="#F2F4F7"
                barStyle="dark-content"
            />

            {/* Decorative Background */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            {/* Logo */}
            <Animated.View
                style={{
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }],
                }}
            >
                <View style={styles.logoWrapper}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </Animated.View>

            {/* School Name */}
            <Animated.View
                style={{
                    opacity: titleOpacity,
                    transform: [{ translateY: titleTranslateY }],
                    alignItems: 'center',
                    marginTop: 25,
                }}
            >
                <Text style={styles.schoolName}>
                    NADIMPALLI SATYANARAYANA RAJU
                </Text>

                <Animated.Text
                    style={[
                        styles.schoolSubName,
                        { opacity: subtitleOpacity },
                    ]}
                >
                    INTERNATIONAL TECHNO SCHOOL
                </Animated.Text>
            </Animated.View>

            {/* Divider */}
            <Animated.View
                style={[
                    styles.divider,
                    {
                        transform: [{ scaleX: dividerScale }],
                    },
                ]}
            />

            {/* Motto */}
            <Animated.Text
                style={[
                    styles.motto,
                    { opacity: mottoOpacity },
                ]}
            >
                UNITY • LEARNING • GROWTH
            </Animated.Text>

            {/* System Badge */}
            <Animated.View
                style={[
                    styles.systemTag,
                    { opacity: systemOpacity },
                ]}
            >
                <Text style={styles.systemText}>
                    NSRIT CONNECT
                </Text>
            </Animated.View>

            {/* Loading Dots */}
            <Animated.View
                style={{
                    marginTop: 25,
                    opacity: systemOpacity,
                }}
            >
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
            animateDot(dot2, 200),
            animateDot(dot3, 400),
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    bgCircle1: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#E3EAF5',
        top: -80,
        right: -60,
    },

    bgCircle2: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#E9EEF8',
        bottom: 80,
        left: -60,
    },

    logoWrapper: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 6,
    },

    logo: {
        width: 90,
        height: 90,
    },

    schoolName: {
        color: '#00205B',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1.8,
        textAlign: 'center',
    },

    schoolSubName: {
        marginTop: 6,
        color: '#4A90D9',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 2.5,
        textAlign: 'center',
    },

    divider: {
        width: 220,
        height: 2,
        backgroundColor: '#4A90D9',
        marginVertical: 18,
    },

    motto: {
        color: '#6B7280',
        fontSize: 11,
        letterSpacing: 2,
        fontWeight: '500',
    },

    systemTag: {
        marginTop: 35,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#00205B',
        backgroundColor: '#FFFFFF',
    },

    systemText: {
        color: '#00205B',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
    },

    loadingRow: {
        flexDirection: 'row',
        gap: 8,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00205B',
    },
});

export default SplashScreen;