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
  List,
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

const RobotAssistant = ({ onStudySpaceSearch }) => {
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
        text: responseText, // now using the actual smart reply
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
    <Box sx={{ width: "100%", textAlign: "center" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Robot Avatar and Info - Centered */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
            width: "100%",
            textAlign: "center",
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mb: 2,
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
          <Typography variant="h6" sx={{ mb: 1 }}>
            Campus Companion
          </Typography>

          <Box sx={{ height: 24, mb: 2 }}>
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

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2, maxWidth: "80%", mx: "auto" }}
          >
            Ask me to find you a study space, or help with campus information!
          </Typography>

          {/* Session ID display */}
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Session ID: {sessionId.substring(0, 8)}...
          </Typography>

          {/* Log management buttons */}
          <Box
            sx={{ display: "flex", gap: 2, mb: 3, justifyContent: "center" }}
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={downloadChatLogs}
            >
              DOWNLOAD LOGS
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={clearChatHistory}
            >
              CLEAR
            </Button>
          </Box>
        </Box>

        {/* Conversation Area - Centered */}
        <Paper
          variant="outlined"
          sx={{
            height: 350,
            mb: 3,
            overflow: "auto",
            p: 2,
            bgcolor: "grey.50",
            width: "100%",
            maxWidth: "800px",
            mx: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <List sx={{ width: "100%" }}>
            {conversation.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                  width: "100%",
                  mb: 2,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    maxWidth: "70%",
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
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: getAvatarColor(message.role),
                        }}
                      >
                        {message.role === "user" ? <Person /> : <SmartToy />}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="body2">{message.content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          mt: 1,
                          color: "text.secondary",
                        }}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            ))}
            <div ref={conversationEndRef} />
          </List>
        </Paper>

        {/* Input Area - Centered */}
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
            maxWidth: "800px",
            mx: "auto",
            display: "flex",
            justifyContent: "center",
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
      </Box>
    </Box>
  );
};

export default RobotAssistant;
