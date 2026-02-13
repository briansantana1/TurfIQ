import Colors from '@/constants/Colors';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, MessageSquare, Send, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ContactScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [showSubjectPicker, setShowSubjectPicker] = useState(false);

    const subjects = [
        'Bug Report',
        'Feature Request',
        'Account Issue',
        'Subscription Help',
        'General Inquiry',
        'Other'
    ];

    const handleSendEmail = () => {
        if (!name.trim() || !email.trim() || !subject || !message.trim()) {
            Alert.alert('Missing Information', 'Please fill in all fields before sending.');
            return;
        }

        const emailBody = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;
        const mailtoUrl = `mailto:info.turfiq@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

        Linking.openURL(mailtoUrl);

        // Clear form after sending
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');

        Alert.alert('Success', 'Your email client has been opened. Please send the email to complete your message.');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <ChevronLeft size={24} color={Colors.light.text} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Contact Us</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>Contact Us</Text>
                        <Text style={styles.infoSubtitle}>
                            We are here to help! Reach out to us for app issues, feedback, or suggestions.
                        </Text>
                        <View style={styles.emailBadge}>
                            <Mail size={16} color={Colors.light.primary} />
                            <Text style={styles.emailText}>info.turfiq@yahoo.com</Text>
                        </View>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <User size={16} color={Colors.light.textMuted} />
                                <Text style={styles.label}>Your Name</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor={Colors.light.textMuted}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Mail size={16} color={Colors.light.textMuted} />
                                <Text style={styles.label}>Email Address</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="john@example.com"
                                placeholderTextColor={Colors.light.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Subject Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subject</Text>
                            <Pressable
                                style={styles.pickerButton}
                                onPress={() => setShowSubjectPicker(!showSubjectPicker)}
                            >
                                <Text style={subject ? styles.pickerText : styles.pickerPlaceholder}>
                                    {subject || 'Select a subject'}
                                </Text>
                                <ChevronLeft
                                    size={20}
                                    color={Colors.light.textMuted}
                                    style={{ transform: [{ rotate: showSubjectPicker ? '90deg' : '-90deg' }] }}
                                />
                            </Pressable>
                            {showSubjectPicker && (
                                <View style={styles.pickerOptions}>
                                    {subjects.map((subj) => (
                                        <Pressable
                                            key={subj}
                                            style={styles.pickerOption}
                                            onPress={() => {
                                                setSubject(subj);
                                                setShowSubjectPicker(false);
                                            }}
                                        >
                                            <Text style={styles.pickerOptionText}>{subj}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Message Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <MessageSquare size={16} color={Colors.light.textMuted} />
                                <Text style={styles.label}>Message</Text>
                            </View>
                            <TextInput
                                style={[styles.input, styles.messageInput]}
                                placeholder="Tell us how we can help..."
                                placeholderTextColor={Colors.light.textMuted}
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Send Button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.sendButton,
                                pressed && styles.sendButtonPressed,
                            ]}
                            onPress={handleSendEmail}
                        >
                            <Send size={20} color="#FFF" />
                            <Text style={styles.sendButtonText}>Send E-mail</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.borderLight,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    infoCard: {
        backgroundColor: Colors.light.safeBg,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
    },
    infoTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
    },
    infoSubtitle: {
        fontSize: 14,
        color: Colors.light.textMuted,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    emailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.light.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    emailText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.primary,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    input: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: Colors.light.text,
        borderWidth: 1,
        borderColor: Colors.light.borderLight,
    },
    messageInput: {
        minHeight: 120,
        paddingTop: 16,
    },
    pickerButton: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.borderLight,
    },
    pickerText: {
        fontSize: 15,
        color: Colors.light.text,
    },
    pickerPlaceholder: {
        fontSize: 15,
        color: Colors.light.textMuted,
    },
    pickerOptions: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.borderLight,
        overflow: 'hidden',
    },
    pickerOption: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.borderLight,
    },
    pickerOptionText: {
        fontSize: 15,
        color: Colors.light.text,
    },
    sendButton: {
        backgroundColor: Colors.light.primary,
        borderRadius: 12,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 8,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sendButtonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});
