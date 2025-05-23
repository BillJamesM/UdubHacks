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
import {
  Mic,
  MicOff,
  Send,
  SmartToy,
  Person,
  CloudDownload,
  Delete,
} from "@mui/icons-material";
import { getChatResponse } from "../services/studySpaceService"; // Assuming you have an API function to get chat responses

// Add these imports if you want to save logs to server
// import { saveConversationLogs } from "../services/logService";

const RobotAssistant = ({ onStudySpaceSearch, onShowBookings }) => {
    // Generate a unique session ID for this conversation
  const [sessionId] = useState(() => {
    const savedSessionId = localStorage.getItem("chatSessionId");
    return (
      savedSessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );
  });
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(() => {
    // Try to load saved conversation from localStorage
    const savedConversation = localStorage.getItem(`chatLogs_${sessionId}`);
    return savedConversation
      ? JSON.parse(savedConversation)
      : [
          {
            role: "assistant",
            content:
              "Hi there! I'm your Campus Companion. How can I help you today?",
            timestamp: new Date().toISOString(),
          },
        ];
  });

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [botMood, setBotMood] = useState("neutral"); // neutral, thinking, happy, confused
  const conversationEndRef = useRef(null);

  // Save session ID to localStorage when it's created
  useEffect(() => {
    localStorage.setItem("chatSessionId", sessionId);
  }, [sessionId]);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    try {
      console.log(
        "Saving conversation to localStorage, length:",
        conversation.length
      );
      localStorage.setItem(
        `chatLogs_${sessionId}`,
        JSON.stringify(conversation)
      );

      // If you want to also save logs to server, uncomment this
      // saveConversationLogs(sessionId, conversation)
      //   .catch(err => console.error("Failed to save logs to server:", err));
    } catch (error) {
      console.error("Error saving conversation to localStorage:", error);
    }
  }, [conversation, sessionId]);

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
      console.log("Speech recognized:", transcript); // For debugging
      setInput(transcript);

      // Instead of directly calling handleUserInput, use a timeout to ensure state is updated
      setTimeout(() => {
        handleUserInput(transcript);
      }, 10);

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
    console.log("Handling user input:", text); // Debug logging

    // Ensure we have valid input
    if (!text || !text.trim()) {
      console.warn("Empty input received in handleUserInput");
      return;
    }

    // Create timestamp at the beginning to ensure consistency
    const messageTimestamp = new Date().toISOString();

    // Add user message to conversation with timestamp
    setConversation((prev) => {
      console.log(
        "Adding user message to conversation with timestamp:",
        messageTimestamp
      );
      return [
        ...prev,
        {
          role: "user",
          content: text,
          timestamp: messageTimestamp,
        },
      ];
    });

    // Clear input field
    setInput("");

    // Set bot to "thinking" mode
    setBotMood("thinking");

    try {
      // Process the input (simple keyword matching for the hackathon)
      const response = await processUserInput(text);

      // Create response timestamp
      const responseTimestamp = new Date().toISOString();

      // Add bot response to conversation with timestamp
      setConversation((prev) => {
        console.log(
          "Adding bot response to conversation with timestamp:",
          responseTimestamp
        );
        return [
          ...prev,
          {
            role: "assistant",
            content: response.text,
            timestamp: responseTimestamp,
            action: response.action,
            filters: response.filters,
          },
        ];
      });

      // Text to speech for response
      speak(response.text);

    // Execute any actions from the response
    if (response.action === "showStudySpaces") {
      onStudySpaceSearch(response.filters || {});
    }

     // Action: Show Bookings
    if (response.action === "showBookings") {
      if (typeof onShowBookings === "function") {
        onShowBookings();
      }
    }

      // Reset bot mood
      setBotMood(response.mood || "neutral");
    } catch (error) {
      console.error("Error processing user input:", error);

      // Add error message to conversation
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date().toISOString(),
          error: true,
        },
      ]);

      setBotMood("confused");
    }
  };

  const processUserInput = async (text) => {
    const response = await getChatResponse(text);
    const lowerText = text.toLowerCase();

    // If the action is for study spaces, apply filter logic
    if (response.action === "showStudySpaces") {
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

    // For other cases like "showBookings", just return the response
    return {
      text: response.text,
      action: response.action,
      mood: response.mood || "neutral",
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

  // Function to download chat logs as JSON
  const downloadChatLogs = () => {
    const dataStr = JSON.stringify(conversation, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `campus-companion-chat-${new Date().toISOString()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Function to clear chat history
  const clearChatHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the chat history? This cannot be undone."
      )
    ) {
      const initialMessage = {
        role: "assistant",
        content:
          "Hi there! I'm your Campus Companion. How can I help you today?",
        timestamp: new Date().toISOString(),
      };

      setConversation([initialMessage]);

      // Generate a new session ID
      const newSessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("chatSessionId", newSessionId);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
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
              sx={{ px: 2, mb: 2 }}
            >
              Ask me to find you a study space, or help with campus information!
            </Typography>

            {/* Session ID display */}
            {/* <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Session ID: {sessionId.substring(0, 8)}...
            </Typography> */}

            {/* Log management buttons */}
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={clearChatHistory}
              >
                Clear
              </Button>
            </Box>
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
                            secondary={new Date(
                              message.timestamp
                            ).toLocaleTimeString()}
                            secondaryTypographyProps={{
                              variant: "caption",
                              align: "right",
                              component: "div",
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

            {/* Input Area - Centered and Full Width */}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  handleUserInput(input);
                }
              }}
              sx={{
                width: "100%",
                maxWidth: "1600px",
                mx: "auto",
              }}
            >
              <Grid
                container
                spacing={1}
                alignItems="center"
                sx={{ width: "100%" }}
              >
                <Grid item md>
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
