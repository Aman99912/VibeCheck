/**
 * dummyTest.js  ─  Design System & Component Catalog Page
 *
 * Use this screen to manually test and review all components:
 *   1. Logo variants (VibeCheck Heart Pin, VibeCheck Square)
 *   2. Custom Text variants (CText display, h1, h2, h3, h4, body, caption)
 *   3. Button variants (solid, outline, ghost, danger, success, soft, sm/md/lg, icon-only)
 *   4. Form Input boxes (focused/unfocused, password, phone with country code, multiline with counter)
 *   5. OTP Group input box (6-cell interactive verification code)
 *   6. Custom dialogs (Logout confirmation, Join Vibe details bullet modal)
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Import all custom components directly from barrel index
import {
  Colors,
  Scale,
  CText,
  Logo,
  AppButton,
  InputBox,
  OTPGroupInput,
  AppAlert,
  BackButton,
  Header,
  Card,
  ListItem,
  ms,
  vs,
} from './App/Reusable-Component';

const DummyTestScreen = () => {
  // State variables for interactive testing
  const [textVal, setTextVal] = useState('');
  const [passVal, setPassVal] = useState('');
  const [phoneVal, setPhoneVal] = useState('');
  const [bioVal, setBioVal] = useState('');
  const [otpVal, setOtpVal] = useState('');

  // Dialog/Alert visibility states
  const [alertSuccessVisible, setAlertSuccessVisible] = useState(false);
  const [alertConfirmVisible, setAlertConfirmVisible] = useState(false);
  const [alertLogoutVisible, setAlertLogoutVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      {/* App Header Bar */}
      <Header
        title="Component Catalog"
        leftComponent={<BackButton onPress={() => console.log('Back Pressed')} />}
        rightComponent={
          <AppButton
            variant="text"
            title="Reset"
            onPress={() => {
              setTextVal('');
              setPassVal('');
              setPhoneVal('');
              setBioVal('');
              setOtpVal('');
            }}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SECTION 1: LOGO MODES */}
        <Card style={styles.sectionCard}>
          <CText variant="h4" weight="bold" color={Colors.primary} style={styles.sectionTitle}>
            1. Logo Variants
          </CText>
          
          <View style={styles.logoRow}>
            <View style={styles.logoCol}>
              <CText variant="caption" color={Colors.textMuted} style={styles.logoLabel}>
                Horizontal Full (Default)
              </CText>
              <Logo mode="full" size="md" appName="VibeCheck" />
            </View>
            <View style={styles.logoCol}>
              <CText variant="caption" color={Colors.textMuted} style={styles.logoLabel}>
                Icon Only
              </CText>
              <Logo mode="icon" size="md" />
            </View>
          </View>

          <View style={styles.logoRow}>
            <View style={styles.logoCol}>
              <CText variant="caption" color={Colors.textMuted} style={styles.logoLabel}>
                Stacked Logo
              </CText>
              <Logo mode="stacked" size="md" appName="VibeMatch" />
            </View>
            <View style={styles.logoCol}>
              <CText variant="caption" color={Colors.textMuted} style={styles.logoLabel}>
                Text Only Logo
              </CText>
              <Logo mode="text" size="md" appName="VibeCheck" />
            </View>
          </View>

          <View style={styles.logoRow}>
            <View style={styles.logoCol}>
              <CText variant="caption" color={Colors.textMuted} style={styles.logoLabel}>
                VibeCheck Square Logo
              </CText>
              <Logo mode="square" size="md" />
            </View>
            <View style={styles.logoCol}>
              <CText variant="caption" color={Colors.textMuted} style={styles.logoLabel}>
                VibeCheck Square Stacked
              </CText>
              <Logo mode="square-stacked" size="md" appName="VibeCheck" />
            </View>
          </View>
        </Card>

        {/* SECTION 2: TYPOGRAPHY STYLE GUIDE */}
        <Card style={styles.sectionCard}>
          <CText variant="h4" weight="bold" color={Colors.primary} style={styles.sectionTitle}>
            2. Typography
          </CText>
          
          <View style={styles.demoList}>
            <CText variant="display" weight="black">Display Heading</CText>
            <CText variant="h1" weight="bold">h1 Heading Bold</CText>
            <CText variant="h2" weight="semibold">h2 Section Title Semibold</CText>
            <CText variant="h3" weight="medium">h3 Title Medium</CText>
            <CText variant="h4" weight="regular">h4 Subtitle Regular</CText>
            <CText variant="body" color={Colors.textSecondary}>
              body - Standard paragraph text color mapped to slate grey. Proportional font scaling has been normalized globally.
            </CText>
            <CText variant="bodySmall" color={Colors.textSecondary}>
              bodySmall - Used for metadata rows or description subtitles.
            </CText>
            <CText variant="caption" color={Colors.textMuted}>
              caption - Used for helper captions, limits, and timestamps.
            </CText>
          </View>
        </Card>

        {/* SECTION 3: BUTTON VARIANTS */}
        <Card style={styles.sectionCard}>
          <CText variant="h4" weight="bold" color={Colors.primary} style={styles.sectionTitle}>
            3. Buttons
          </CText>

          <CText variant="label" weight="bold" color={Colors.textSecondary} style={styles.subTitle}>
            Core Styles
          </CText>
          <View style={styles.buttonGrid}>
            <AppButton variant="primary" title="Primary Blue" onPress={() => {}} />
            <AppButton variant="secondary" title="Secondary Navy" onPress={() => {}} />
            <AppButton variant="ghost" title="Ghost (Brand)" onPress={() => {}} />
            <AppButton variant="outline" title="Outline (Neutral)" onPress={() => {}} />
            <AppButton variant="soft" title="Soft Blue Tint" onPress={() => {}} />
            <AppButton variant="text" title="Text Link Button" onPress={() => {}} />
          </View>

          <CText variant="label" weight="bold" color={Colors.textSecondary} style={styles.subTitle}>
            Status Buttons (Solid & Outline)
          </CText>
          <View style={styles.buttonGrid}>
            <AppButton variant="danger" title="Danger" onPress={() => {}} />
            <AppButton variant="dangerOutline" title="Danger Outline" onPress={() => {}} />
            <AppButton variant="success" title="Success" onPress={() => {}} />
            <AppButton variant="successOutline" title="Success Outline" onPress={() => {}} />
          </View>

          <CText variant="label" weight="bold" color={Colors.textSecondary} style={styles.subTitle}>
            Icons & Sizes
          </CText>
          <View style={styles.buttonRow}>
            <AppButton variant="primary" size="sm" title="Small" leftIcon="save" onPress={() => {}} />
            <AppButton variant="primary" size="md" title="Medium" rightIcon="arrow-forward" onPress={() => {}} />
            <AppButton variant="primary" size="lg" title="Large" onPress={() => {}} />
          </View>
          <View style={styles.buttonRow}>
            <AppButton variant="icon" iconName="camera" onPress={() => {}} />
            <AppButton variant="icon" iconName="location-on" onPress={() => {}} />
            <AppButton variant="outline" title="Loading state" loading onPress={() => {}} />
            <AppButton variant="primary" title="Disabled" disabled onPress={() => {}} />
          </View>
        </Card>

        {/* SECTION 4: FORM INPUT BOXES */}
        <Card style={styles.sectionCard}>
          <CText variant="h4" weight="bold" color={Colors.primary} style={styles.sectionTitle}>
            4. Text Inputs
          </CText>

          <InputBox
            type="text"
            label="Name / General Text"
            placeholder="Enter your name"
            value={textVal}
            onChangeText={setTextVal}
            showClear
          />

          <InputBox
            type="phone"
            label="Mobile Number Prefix (Phone Layout)"
            placeholder="Enter mobile number"
            value={phoneVal}
            onChangeText={setPhoneVal}
            countryCode="+91"
            onCountryCodePress={() => alert('Country Code Selector Tapped')}
            hideLeftIcon
          />

          <InputBox
            type="password"
            label="Password Toggle (Secure Entry)"
            placeholder="Enter password"
            value={passVal}
            onChangeText={setPassVal}
          />

          <InputBox
            type="multiline"
            label="Bio (Character Limit & Counter)"
            placeholder="Tell us about yourself..."
            value={bioVal}
            onChangeText={setBioVal}
            maxLength={150}
            hideLeftIcon
          />
        </Card>

        {/* SECTION 5: OTP PASSPORTS */}
        <Card style={styles.sectionCard}>
          <CText variant="h4" weight="bold" color={Colors.primary} style={styles.sectionTitle}>
            5. Verification Code Input Grid
          </CText>
          
          <CText variant="body" color={Colors.textSecondary} style={{ marginBottom: vs(12) }}>
            6-digit interactive grid. Tap cells to edit, shifts focus dynamically.
          </CText>

          <OTPGroupInput
            length={6}
            value={otpVal}
            onChangeText={setOtpVal}
          />
          
          <CText variant="caption" color={Colors.textMuted} align="center">
            Current Entered Value: {otpVal || '(empty)'}
          </CText>
        </Card>

        {/* SECTION 6: MODALS & POPUPS */}
        <Card style={styles.sectionCard}>
          <CText variant="h4" weight="bold" color={Colors.primary} style={styles.sectionTitle}>
            6. Dialog Boxes / Alerts
          </CText>
          
          <CText variant="body" color={Colors.textSecondary} style={{ marginBottom: vs(14) }}>
            Trigger dialog overlays utilizing design assets theme variables:
          </CText>

          <View style={styles.dialogTriggerRow}>
            <AppButton
              variant="outline"
              title="Logout Confirmation"
              onPress={() => setAlertLogoutVisible(true)}
              style={styles.triggerButton}
            />
            <AppButton
              variant="outline"
              title="Join Vibe Details"
              onPress={() => setAlertConfirmVisible(true)}
              style={styles.triggerButton}
            />
            <AppButton
              variant="outline"
              title="Success Feedback"
              onPress={() => setAlertSuccessVisible(true)}
              style={styles.triggerButton}
            />
          </View>
        </Card>

      </ScrollView>

      {/* ─── ALERT / DIALOG DICTIONARY OVERLAYS ───────────────────────────────── */}

      {/* ALERT 1: Success feedback */}
      <AppAlert
        visible={alertSuccessVisible}
        onClose={() => setAlertSuccessVisible(false)}
        type="success"
        title="Operation Successful"
        message="Your highlight has been successfully uploaded. Participants have been tagged."
        confirmTitle="Awesome"
        onConfirm={() => setAlertSuccessVisible(false)}
      />

      {/* ALERT 2: Join Vibe Confirmation with bullet nodes */}
      <AppAlert
        visible={alertConfirmVisible}
        onClose={() => setAlertConfirmVisible(false)}
        type="confirm"
        title="Join this vibe?"
        confirmTitle="Yes, Accept & Join"
        onConfirm={() => {
          setAlertConfirmVisible(false);
          alert('You joined the football match vibe!');
        }}
        cancelTitle="Cancel"
      >
        <View style={styles.dialogList}>
          <View style={styles.dialogBulletRow}>
            <MaterialIcons name="check-circle" size={ms(18)} color={Colors.primary} style={styles.bulletIcon} />
            <CText variant="bodySmall" color={Colors.textSecondary} style={styles.bulletText}>
              You'll join the group chat
            </CText>
          </View>
          <View style={styles.dialogBulletRow}>
            <MaterialIcons name="check-circle" size={ms(18)} color={Colors.primary} style={styles.bulletIcon} />
            <CText variant="bodySmall" color={Colors.textSecondary} style={styles.bulletText}>
              See live location of members
            </CText>
          </View>
          <View style={styles.dialogBulletRow}>
            <MaterialIcons name="check-circle" size={ms(18)} color={Colors.primary} style={styles.bulletIcon} />
            <CText variant="bodySmall" color={Colors.textSecondary} style={styles.bulletText}>
              Get notified about updates
            </CText>
          </View>
        </View>
      </AppAlert>

      {/* ALERT 3: Logout Danger validation (matching Logout Flow) */}
      <AppAlert
        visible={alertLogoutVisible}
        onClose={() => setAlertLogoutVisible(false)}
        type="danger"
        iconName="no-meeting-room" // exit/door style icon matching logout card
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to re-verify your phone number."
        confirmTitle="Logout"
        onConfirm={() => {
          setAlertLogoutVisible(false);
          alert('Logged out successfully!');
        }}
        cancelTitle="Cancel"
        stackedButtons // stack logout above cancel as in modal layout
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: ms(16),
    paddingBottom: vs(32),
  },
  sectionCard: {
    marginTop: vs(16),
    padding: ms(16),
  },
  sectionTitle: {
    marginBottom: vs(14),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: vs(6),
  },
  subTitle: {
    marginTop: vs(12),
    marginBottom: vs(8),
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(16),
    alignItems: 'center',
    gap: ms(10),
  },
  logoCol: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: ms(12),
    padding: ms(10),
    backgroundColor: Colors.surface,
  },
  logoLabel: {
    marginBottom: vs(8),
    fontSize: Scale.normFont(10),
  },
  demoList: {
    gap: vs(8),
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
    marginBottom: vs(10),
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: ms(10),
    marginBottom: vs(8),
  },
  dialogTriggerRow: {
    flexDirection: 'column',
    gap: vs(10),
  },
  triggerButton: {
    width: '100%',
  },
  // Custom dialog bullet styles
  dialogList: {
    backgroundColor: Colors.surface,
    borderRadius: ms(14),
    padding: ms(14),
    gap: vs(10),
  },
  dialogBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletIcon: {
    marginRight: ms(8),
  },
  bulletText: {
    flex: 1,
  },
});

export default DummyTestScreen;
