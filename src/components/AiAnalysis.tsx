'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { ChatMessage, ScreenContext } from '@/lib/ai';

interface AiAnalysisProps {
  context: ScreenContext;
}

const DRAWER_WIDTH = 420;

function getSuggestedPrompts(context: ScreenContext): string[] {
  const prompts: string[] = [];

  const topWalking = context.walkingBreakdown[0];
  const topDriving = context.drivingBreakdown[0];

  if (topDriving) {
    prompts.push(`How many ${topDriving.category.toLowerCase()} are nearby?`);
  }

  if (context.walkingScore < 50) {
    prompts.push('Why is the walking score low?');
  } else {
    prompts.push('What makes this area walkable?');
  }

  if (topWalking) {
    prompts.push(`What's within walking distance?`);
  }

  prompts.push('Is this a good area for families?');

  return prompts.slice(0, 3);
}

export default function AiAnalysis({ context }: AiAnalysisProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  const suggestedPrompts = useMemo(() => getSuggestedPrompts(context), [context]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string, currentMessages: ChatMessage[]) => {
    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...currentMessages, userMessage];
    setMessages(updatedMessages);
    messagesRef.current = updatedMessages;
    setShowSuggestions(false);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: updatedMessages,
          context,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to get AI response');
        return;
      }

      const withReply = [
        ...updatedMessages,
        { role: 'assistant' as const, content: data.reply },
      ];
      setMessages(withReply);
      messagesRef.current = withReply;
    } catch {
      setError('Failed to connect to AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = useCallback(async () => {
    setOpen(true);
    if (initialized) return;

    setInitialized(true);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '__initial_analysis__',
          history: [],
          context,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to get AI analysis');
        return;
      }

      const initial: ChatMessage[] = [{ role: 'assistant', content: data.reply }];
      setMessages(initial);
      messagesRef.current = initial;
      setShowSuggestions(true);
    } catch {
      setError('Failed to connect to AI. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [context, initialized]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput('');
    await sendMessage(trimmed, messagesRef.current);
  };

  const handleSuggestionClick = (prompt: string) => {
    if (loading) return;
    sendMessage(prompt, messagesRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Floating AI Analysis button */}
      <Button
        variant="contained"
        startIcon={<AutoAwesomeIcon />}
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 'calc(24px + env(safe-area-inset-bottom))',
          right: 24,
          zIndex: 1200,
          borderRadius: '28px',
          px: 3,
          py: 1.5,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4293 100%)',
            boxShadow: '0 6px 28px rgba(102,126,234,0.5)',
          },
        }}
      >
        AI Analysis
      </Button>

      {/* Chat Drawer */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : DRAWER_WIDTH,
            height: isMobile ? '85vh' : '100%',
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <AutoAwesomeIcon />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              AI Analysis
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Ask anything about this neighborhood
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Messages area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#f8f9fb',
          }}
        >
          {/* Initial loading state */}
          {loading && messages.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={32} sx={{ mb: 2, color: '#667eea' }} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing neighborhood data...
                </Typography>
              </Box>
            </Box>
          )}

          {/* Error state */}
          {error && messages.length === 0 && !loading && (
            <Card
              sx={{
                p: 2.5,
                bgcolor: '#fff3f0',
                border: '1px solid #ffccc7',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                {error}
              </Typography>
              {error.includes('Not implemented') && (
                <Typography variant="caption" color="text.secondary">
                  To enable AI Analysis, implement the functions in{' '}
                  <code>src/lib/ai.ts</code> and add your{' '}
                  <code>OPENAI_API_KEY</code> to <code>.env.local</code>
                </Typography>
              )}
            </Card>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: msg.role === 'user' ? '#e3f2fd' : '#f3e5f5',
                  mt: 0.5,
                }}
              >
                {msg.role === 'user' ? (
                  <PersonIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                ) : (
                  <SmartToyIcon sx={{ fontSize: 18, color: '#7b1fa2' }} />
                )}
              </Box>

              {/* Message bubble */}
              <Card
                sx={{
                  p: 2,
                  maxWidth: '85%',
                  bgcolor: msg.role === 'user' ? '#e3f2fd' : 'white',
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    '& code': {
                      bgcolor: 'rgba(0,0,0,0.06)',
                      px: 0.5,
                      borderRadius: 0.5,
                      fontFamily: 'monospace',
                      fontSize: '0.85em',
                    },
                  }}
                >
                  {msg.content}
                </Typography>
              </Card>
            </Box>
          ))}

          {/* Suggested prompts */}
          {showSuggestions && messages.length > 0 && !loading && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: -0.5 }}>
              {suggestedPrompts.map((prompt, i) => (
                <Chip
                  key={i}
                  label={prompt}
                  onClick={() => handleSuggestionClick(prompt)}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#667eea',
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Loading indicator for follow-up messages */}
          {loading && messages.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: '#f3e5f5',
                }}
              >
                <SmartToyIcon sx={{ fontSize: 18, color: '#7b1fa2' }} />
              </Box>
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <Box sx={{ display: 'flex', gap: 0.6 }}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#667eea',
                        opacity: 0.5,
                        animation: 'pulse 1.4s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                        '@keyframes pulse': {
                          '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                          '40%': { opacity: 1, transform: 'scale(1)' },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Card>
            </Box>
          )}

          {/* Inline error for follow-up failures */}
          {error && messages.length > 0 && (
            <Typography variant="caption" color="error.main" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input area */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            px: 2,
            pt: 1.5,
            pb: 'calc(12px + env(safe-area-inset-bottom))',
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Ask about this neighborhood..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#f8f9fb',
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || loading}
            sx={{
              bgcolor: '#667eea',
              color: 'white',
              '&:hover': { bgcolor: '#5a6fd6' },
              '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#bdbdbd' },
              borderRadius: 2,
              width: 40,
              height: 40,
              alignSelf: 'flex-end',
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Drawer>
    </>
  );
}
