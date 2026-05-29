/**
 * auth.header.js
 * Header component for Authentication screens (Login and OTP).
 * Matches APP_REFF/auth/image.png exactly.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, CText, BackButton, Logo, ms, vs, normFont } from '../../../Reusable-Component';

const AuthHeader = ({
    type = 'login', // 'login' | 'otp'
    phoneNumber = '',
    onBackPress,
    onEditPhonePress,
}) => {

    // ─── OTP Header ──────────────────────────────────────────────────────────────
    if (type === 'otp') {
        return (
            <View style={styles.otpContainer}>
                {/* Back Button row */}
                <View style={styles.topBar}>
                    <BackButton onPress={onBackPress} />
                </View>

                {/* Shield illustration — matches Figma: two rings + shield + check */}
                <View style={styles.illustrationWrapper}>
                    {/* Sparkle + — top left of the outer ring */}
                    <CText style={[styles.sparkle, styles.sparkleTopLeft]}>+</CText>
                    {/* Sparkle + — right of inner ring */}
                    <CText style={[styles.sparkle, styles.sparkleRight]}>+</CText>

                    {/* Outer faint blue ring */}
                    <View style={styles.glowOuter}>
                        {/* Inner slightly less faint blue ring */}
                        <View style={styles.glowInner}>
                            {/* White center circle with shield */}
                            <View style={styles.centerCircle}>
                                {/* Shield icon — blue, large */}
                                <MaterialIcons name="shield" size={ms(44)} color={Colors.primary} />
                                {/* Checkmark overlaid on shield */}
                                <View style={styles.checkOverlay}>
                                    <MaterialIcons name="check" size={ms(20)} color={Colors.white} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Title + subtitle */}
                <View style={styles.otpTextBlock}>
                    <CText variant="h1" weight="bold" color={Colors.textPrimary} align="center">
                        Enter the code
                    </CText>
                    <CText variant="body" color={Colors.textSecondary} align="center" style={styles.otpSubLine}>
                        We've sent a 6-digit code to
                    </CText>
                    {phoneNumber ? (
                        <TouchableOpacity
                            onPress={onEditPhonePress}
                            activeOpacity={0.7}
                            style={styles.phoneEditRow}
                        >
                            <CText variant="body" weight="semibold" color={Colors.primary}>
                                {phoneNumber}
                            </CText>
                            <MaterialIcons name="edit" size={ms(14)} color={Colors.primary} style={styles.editIcon} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        );
    }

    // ─── Login Header ─────────────────────────────────────────────────────────────
    return (
        <View style={styles.loginContainer}>
            {/* VibeCheck Logo */}
            <View style={styles.logoContainer}>
                <Logo mode="full" size="sm" />
            </View>

            {/* Big heading — uses 'black' weight for max boldness */}
            <CText variant="display" weight="black" color={Colors.textPrimary} style={styles.headingLine1}>
                {'What\'s\nhappening\n'}
                <CText variant="display" weight="black" color={Colors.primary}>
                    nearby?
                </CText>
            </CText>

            {/* Subtitle */}
            <CText variant="body" weight="regular" color={Colors.textSecondary} style={styles.subtitle}>
                {'Join activities, meet people, make memories.'}
            </CText>
        </View>
    );
};

const styles = StyleSheet.create({
    // ─── Login ─────────────────────────────────────────────────────────────────
    loginContainer: {
        width: '100%',
        backgroundColor: Colors.background,
        paddingBottom: vs(8),
    },
    logoContainer: {
        marginTop: vs(4),
        marginBottom: vs(20),
    },
    headingLine1: {
        lineHeight: vs(46),
        letterSpacing: ms(-0.5),
    },
    subtitle: {
        marginTop: vs(10),
        lineHeight: vs(20),
    },

    // ─── OTP ───────────────────────────────────────────────────────────────────
    otpContainer: {
        width: '100%',
        backgroundColor: Colors.background,
        paddingBottom: vs(16),
    },
    topBar: {
        height: vs(52),
        justifyContent: 'center',
        paddingHorizontal: ms(4),
    },
    // Wrapper with position:relative so sparkles can be placed absolutely
    illustrationWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        height: vs(148),
        marginTop: vs(4),
        position: 'relative',
    },
    // Outer very faint circle — largest
    glowOuter: {
        width: ms(144),
        height: ms(144),
        borderRadius: ms(70),
        backgroundColor: 'rgba(161, 191, 251, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Inner slightly more opaque circle
    glowInner: {
        width: ms(92),
        height: ms(92),
        borderRadius: ms(46),
        backgroundColor: 'rgba(161, 191, 251, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // White circle in center — clean, with soft but present shadow
    centerCircle: {
        width: ms(64),
        height: ms(64),
        borderRadius: ms(32),
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: vs(3) },
        shadowOpacity: 0.15,
        shadowRadius: ms(8),
        elevation: 10,
    },
    // Check sits in the middle of the shield icon
    checkOverlay: {
        position: 'absolute',
        top: ms(18),
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Absolute + signs — small, blue, muted
    sparkle: {
        position: 'absolute',
        fontSize: normFont(20),
        fontFamily: 'Poppins-Bold',
        color: Colors.primary,
        opacity: 0.30,
    },
    // Top-left sparkle (above and left of the outer ring)
    sparkleTopLeft: {
        top: vs(18),
        left: ms(40),
    },
    // Right sparkle (middle-right, outside inner ring)
    sparkleRight: {
        top: vs(64),
        right: ms(36),
    },
    otpTextBlock: {
        alignItems: 'center',
        paddingTop: vs(6),
    },
    otpSubLine: {
        marginTop: vs(8),
    },
    phoneEditRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vs(4),
    },
    editIcon: {
        marginLeft: ms(5),
    },
});

export default AuthHeader;
