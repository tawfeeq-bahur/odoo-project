import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../hooks/useChat';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';
import { Card } from '../components/UIComponents';

const AI_FEATURES = [
  { icon: '🗺️', title: 'Trip Planning', desc: 'Ask for destination recommendations, itineraries, and travel tips.' },
  { icon: '💰', title: 'Budget Help', desc: 'Get cost estimates for your trip and money-saving tips.' },
  { icon: '🏨', title: 'Accommodation', desc: 'Find the best hotels, hostels, and guesthouses.' },
  { icon: '⏰', title: 'Best Time', desc: 'Discover the ideal season to visit any destination.' },
];

export default function AIDemoScreen() {
  const { messages, input, setInput, isLoading, sendMessage, clearChat } = useChat();
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (input.trim()) sendMessage();
  };

  const copyMessage = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text>🤖</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.msgBubble, isUser ? styles.userBubble : styles.botBubble]}
          onLongPress={() => copyMessage(item.content)}
          activeOpacity={0.8}
        >
          <Text style={[styles.msgText, isUser ? styles.userText : styles.botText]}>
            {item.content}
          </Text>
          <Text style={styles.msgTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={88}
      >
        <ScrollView style={styles.featuresScroll} horizontal showsHorizontalScrollIndicator={false}>
          {AI_FEATURES.map((feat, i) => (
            <TouchableOpacity
              key={i}
              style={styles.featureChip}
              onPress={() => sendMessage(`Tell me about ${feat.title.toLowerCase()}`)}
            >
              <Text style={styles.featureIcon}>{feat.icon}</Text>
              <Text style={styles.featureTitle}>{feat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>TourJet AI Assistant</Text>
              <TouchableOpacity onPress={clearChat}>
                <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          }
        />

        {isLoading && (
          <View style={styles.typingIndicator}>
            <View style={styles.botAvatar}>
              <Text>🤖</Text>
            </View>
            <View style={styles.typingDots}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.typingText}> Thinking…</Text>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about travel destinations…"
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  featuresScroll: { maxHeight: 72, paddingVertical: SPACING.sm, paddingLeft: SPACING.sm },
  featureChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    marginRight: SPACING.xs, borderWidth: 1, borderColor: COLORS.border,
  },
  featureIcon: { fontSize: 14 },
  featureTitle: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontWeight: '600' },

  messageList: { padding: SPACING.base, paddingBottom: SPACING.sm },
  chatHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.base,
  },
  chatTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.base },

  msgRow: { flexDirection: 'row', marginBottom: SPACING.md, alignItems: 'flex-end', gap: SPACING.xs },
  msgRowUser: { flexDirection: 'row-reverse' },
  botAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  msgBubble: {
    maxWidth: '78%', borderRadius: RADIUS.lg, padding: SPACING.md,
  },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  msgText: { fontSize: FONTS.sm, lineHeight: 20 },
  userText: { color: COLORS.white },
  botText: { color: COLORS.textPrimary },
  msgTime: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'right' },

  typingIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.base, paddingBottom: SPACING.xs,
  },
  typingDots: { flexDirection: 'row', alignItems: 'center' },
  typingText: { color: COLORS.textMuted, fontSize: FONTS.xs },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm,
    padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chatInput: {
    flex: 1, backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.xl, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, color: COLORS.textPrimary,
    fontSize: FONTS.sm, maxHeight: 100,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.surfaceAlt },
});
