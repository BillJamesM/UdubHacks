import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
} from "@mui/material";
import { Mic, MicOff, Send, SmartToy, Person } from "@mui/icons-material";
import { getChatResponse } from "../services/studySpaceService"; // Assuming you have an API function to get chat responses

const RobotAssistant = ({ onStudySpaceSearch }) => {
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      content: "Hi there! I'm your Campus Companion. How can I help you today?",
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [botMood, setBotMood] = useState("neutral"); // neutral, thinking, happy, confused
  const conversationEndRef = useRef(null);

  // Speech recognition setup
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleUserInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }

  // Text-to-speech setup
  const speak = (text) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleUserInput = async (text) => {
    // Add user message to conversation
    setConversation((prev) => [...prev, { role: "user", content: text }]);

    // Clear input field
    setInput("");

    // Set bot to "thinking" mode
    setBotMood("thinking");

    // Process the input (simple keyword matching for the hackathon)
    const response = await processUserInput(text);

    // Add bot response to conversation
    setConversation((prev) => [
      ...prev,
      { role: "assistant", content: response.text },
    ]);

    // Text to speech for response
    speak(response.text);

    // Execute any actions from the response
    if (response.action === "showStudySpaces") {
      onStudySpaceSearch(response.filters || {});
    }

    // Reset bot mood
    setBotMood(response.mood || "neutral");
  };

  const processUserInput = async (text) => {
    const responseText = await getChatResponse(text);
    const lowerText = text.toLowerCase();

    if (
    lowerText.includes("study") ||
    lowerText.includes("library") ||
    lowerText.includes("quiet place") ||
    lowerText.includes("room")
    ) {
    const filters = {
      noiseLevel: lowerText.includes("quiet")
        ? "quiet"
        : lowerText.includes("collaborative")
        ? "collaborative"
        : "any",
    };

    return {
      text: responseText,     // now using the actual smart reply
      action: "showStudySpaces",
      filters,
      mood: "happy",
    };
  }

    // Fallback for other queries
    return {
      text: responseText,
      mood: "neutral",
    };
  };

  // Get avatar color based on role
  const getAvatarColor = (role) => {
    return role === "user" ? "primary.main" : "secondary.main";
  };

  // Get bot mood styling
  const getBotMoodStyles = () => {
    switch (botMood) {
      case "thinking":
        return {
          animation: "pulse 1.5s infinite",
          bgcolor: "info.light",
        };
      case "happy":
        return { bgcolor: "success.light" };
      case "confused":
        return { bgcolor: "warning.light" };
      default:
        return { bgcolor: "secondary.main" };
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          {/* Robot Avatar */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 1,
                  ...getBotMoodStyles(),
                  "@keyframes pulse": {
                    "0%": { opacity: 0.7 },
                    "50%": { opacity: 1 },
                    "100%": { opacity: 0.7 },
                  },
                }}
              >
                <SmartToy sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6">Campus Companion</Typography>
              <Box sx={{ mt: 1, height: 24, textAlign: "center" }}>
                {isListening && (
                  <Chip
                    label="Listening..."
                    color="error"
                    size="small"
                    icon={<Mic />}
                    sx={{ animation: "pulse 1s infinite" }}
                  />
                )}
                {isSpeaking && (
                  <Chip
                    label="Speaking..."
                    color="success"
                    size="small"
                    sx={{ animation: "pulse 1s infinite" }}
                  />
                )}
                {botMood === "thinking" && !isListening && !isSpeaking && (
                  <Chip label="Thinking..." color="info" size="small" />
                )}
              </Box>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ px: 2 }}
            >
              Ask me to find you a study space, or help with campus information!
            </Typography>
          </Grid>

          {/* Conversation Area */}
          <Grid item xs={12} md={8}>
            <Paper
              variant="outlined"
              sx={{
                height: 350,
                mb: 2,
                overflow: "auto",
                p: 2,
                bgcolor: "grey.50",
              }}
            >
              <List>
                {conversation.map((message, index) => (
                  <ListItem
                    key={index}
                    alignItems="flex-start"
                    sx={{
                      justifyContent:
                        message.role === "user" ? "flex-end" : "flex-start",
                      mb: 1,
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        maxWidth: "80%",
                        bgcolor:
                          message.role === "user"
                            ? "primary.light"
                            : "background.paper",
                        color:
                          message.role === "user"
                            ? "primary.contrastText"
                            : "text.primary",
                      }}
                    >
                      <Grid container spacing={1} alignItems="flex-start">
                        <Grid item>
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: getAvatarColor(message.role),
                              }}
                            >
                              {message.role === "user" ? (
                                <Person />
                              ) : (
                                <SmartToy />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                        </Grid>
                        <Grid item xs>
                          <ListItemText
                            primary={message.content}
                            primaryTypographyProps={{
                              variant: "body2",
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </ListItem>
                ))}
                <div ref={conversationEndRef} />
              </List>
            </Paper>

            {/* Input Area */}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  handleUserInput(input);
                }
              }}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <TextField
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me about study spaces..."
                    variant="outlined"
                    disabled={isSpeaking || isListening}
                    size="small"
                  />
                </Grid>
                <Grid item>
                  <IconButton
                    color={isListening ? "error" : "primary"}
                    onClick={toggleListening}
                    disabled={!SpeechRecognition || isSpeaking}
                  >
                    {isListening ? <MicOff /> : <Mic />}
                  </IconButton>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={!input.trim() || isSpeaking}
                    endIcon={<Send />}
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default RobotAssistant;
