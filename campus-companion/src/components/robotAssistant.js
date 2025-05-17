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
  Delete,
  Room,
  Bookmark,
} from "@mui/icons-material";
import { getChatResponse } from "../services/studySpaceService"; // Assuming you have an API function to get chat responses

// Mock implementation for getChatResponse if the real one isn't working
// Uncomment this if needed and comment out the real import above
/*
const getChatResponse = async (text) => {
  console.log("Mock getChatResponse called with:", text);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("study") || 
      lowerText.includes("room") || 
      lowerText.includes("library") || 
      lowerText.includes("space") || 
      lowerText.includes("quiet")) {
    return {
      text: "I can help you find a study space on campus. Would you prefer a quiet individual space or a collaborative group area?",
      action: "showStudySpaces",
      mood: "happy"
    };
  }
  
  if (lowerText.includes("book") || 
      lowerText.includes("reservation") || 
      lowerText.includes("my bookings")) {
    return {
      text: "Let me show you your current bookings.",
      action: "showBookings",
      mood: "neutral"
    };
  }
  
  return {
    text: `I understand you said: "${text}". How can I help you find a study space today?`,
    mood: "neutral"
  };
};
*/

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
              "Hi there! I'm your Campus Companion. How can I help you today? Ask me about finding a study space or checking your bookings.",
            timestamp: new Date().toISOString(),
          },
        ];
  });

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [botMood, setBotMood] = useState("neutral"); // neutral, thinking, happy, confused
  const conversationEndRef = useRef(null);

  // Debug function to verify props are passed correctly
  useEffect(() => {
    console.log("RobotAssistant mounted with props:", {
      hasOnStudySpaceSearch: typeof onStudySpaceSearch === "function",
      hasOnShowBookings: typeof onShowBookings === "function",
    });
  }, [onStudySpaceSearch, onShowBookings]);

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
      console.log("Speech recognized:", transcript);
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

  // Direct navigation buttons for testing
  const directNavToStudySpaces = () => {
    console.log("Direct navigation to study spaces");
    if (typeof onStudySpaceSearch === "function") {
      const filters = { noiseLevel: "any" };
      onStudySpaceSearch(filters);

      // Optional: Add a message to the conversation about this action
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Navigating to the study spaces finder. I can show you all available spaces on campus.",
          timestamp: new Date().toISOString(),
          action: "showStudySpaces",
          filters: filters,
        },
      ]);
    } else {
      console.error("onStudySpaceSearch is not a function");
      alert("Navigation function is not available");
    }
  };

  const directNavToBookings = () => {
    console.log("Direct navigation to bookings");
    if (typeof onShowBookings === "function") {
      onShowBookings();

      // Optional: Add a message to the conversation about this action
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Let me show you your current bookings.",
          timestamp: new Date().toISOString(),
          action: "showBookings",
        },
      ]);
    } else {
      console.error("onShowBookings is not a function");
      alert("Bookings function is not available");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with input:", input);
    if (input.trim()) {
      handleUserInput(input);
    }
  };

  const handleUserInput = async (text) => {
    console.log("Handling user input:", text);

    // Ensure we have valid input
    if (!text || !text.trim()) {
      console.warn("Empty input received in handleUserInput");
      return;
    }

    // Create timestamp at the beginning to ensure consistency
    const messageTimestamp = new Date().toISOString();

    // Add user message to conversation with timestamp
    setConversation((prev) => {
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
      // Process the input
      console.log("Calling processUserInput with text:", text);
      const response = await processUserInput(text);
      console.log("Response from processUserInput:", response);

      // Create response timestamp
      const responseTimestamp = new Date().toISOString();

      // Add bot response to conversation with timestamp
      setConversation((prev) => {
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

      // Execute any actions from the response AFTER a slight delay
      setTimeout(() => {
        if (response.action === "showStudySpaces") {
          console.log(
            "Executing showStudySpaces with filters:",
            response.filters
          );
          if (typeof onStudySpaceSearch === "function") {
            onStudySpaceSearch(response.filters || { noiseLevel: "any" });
          } else {
            console.error("onStudySpaceSearch is not a function");
          }
        }

        if (response.action === "showBookings") {
          console.log("Executing showBookings");
          if (typeof onShowBookings === "function") {
            onShowBookings();
          } else {
            console.error("onShowBookings is not a function");
          }
        }
      }, 500); // 500ms delay to ensure state updates have completed

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
    try {
      console.log("Getting response from API for:", text);

      // Call the API to get a response
      const response = await getChatResponse(text);
      console.log("API response:", response);

      const lowerText = text.toLowerCase();

      // Check if the text mentions any of the 5 study spaces by name
      const mentionsSpecificSpace =
        lowerText.includes("cp-324a") ||
        lowerText.includes("cp-324b") ||
        lowerText.includes("cp-324c") ||
        lowerText.includes("mds-302") ||
        lowerText.includes("library commons");

      // Check if we need to handle study spaces
      if (
        lowerText.includes("study") ||
        lowerText.includes("library") ||
        lowerText.includes("quiet") ||
        lowerText.includes("spaces") ||
        lowerText.includes("space") ||
        lowerText.includes("room") ||
        mentionsSpecificSpace ||
        response.action === "showStudySpaces"
      ) {
        // Set the filter based on text content
        const filters = {
          noiseLevel: lowerText.includes("quiet")
            ? "quiet"
            : lowerText.includes("collaborative") || lowerText.includes("group")
            ? "collaborative"
            : "any",
          building: lowerText.includes("main library")
            ? "Main Library"
            : lowerText.includes("engineering")
            ? "Engineering Building"
            : lowerText.includes("student union")
            ? "Student Union"
            : lowerText.includes("cherry parks")
            ? "Cherry Parks"
            : undefined,
          features: [],
        };

        // Add features based on text
        if (lowerText.includes("whiteboard"))
          filters.features.push("whiteboard");
        if (lowerText.includes("monitor") || lowerText.includes("screen"))
          filters.features.push("monitors", "large screen");
        if (lowerText.includes("power") || lowerText.includes("outlet"))
          filters.features.push("power outlets");
        if (lowerText.includes("comfort") || lowerText.includes("chair"))
          filters.features.push("comfortable seating", "ergonomic chairs");

        // Determine capacity needs
        if (lowerText.includes("group") || lowerText.includes("team")) {
          if (lowerText.includes("large") || lowerText.includes("big")) {
            filters.minCapacity = 8;
          } else {
            filters.minCapacity = 4;
          }
        } else if (
          lowerText.includes("individual") ||
          lowerText.includes("alone") ||
          lowerText.includes("quiet")
        ) {
          filters.maxCapacity = 2;
        }

        console.log(
          "Detected study space request, creating response with filters:",
          filters
        );

        // Create appropriate text based on the filters
        let customText = response.text;
        if (!customText) {
          customText = "I can help you find a study space";

          if (filters.building) {
            customText += ` in the ${filters.building}`;
          }

          if (filters.noiseLevel === "quiet") {
            customText += " that's quiet for focused work";
          } else if (filters.noiseLevel === "collaborative") {
            customText += " suitable for group collaboration";
          }

          if (filters.features.length > 0) {
            customText += ` with ${filters.features.join(" and ")}`;
          }

          customText += ". Let me show you what's available!";
        }

        return {
          text: customText,
          action: "showStudySpaces",
          filters,
          mood: "happy",
        };
      }

      // Check if we need to handle bookings
      if (
        lowerText.includes("booking") ||
        lowerText.includes("reservation") ||
        lowerText.includes("my bookings") ||
        lowerText.includes("reserved") ||
        response.action === "showBookings"
      ) {
        console.log("Detected bookings request");

        return {
          text: response.text || "Let me show you your current bookings.",
          action: "showBookings",
          mood: "neutral",
        };
      }

      // Default response if no specific action detected
      return {
        text:
          response.text ||
          `I understand you're looking for assistance. I can help you find study spaces on campus or check your current bookings. What would you like to do?`,
        action: response.action,
        mood: response.mood || "neutral",
      };
    } catch (error) {
      console.error("Error in processUserInput:", error);
      // Provide a fallback response
      return {
        text: "I'm having trouble understanding your request right now. Would you like to see available study spaces or check your bookings?",
        mood: "confused",
      };
    }
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
          "Hi there! I'm your Campus Companion. How can I help you today? Ask me about finding a study space or checking your bookings.",
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

            {/* Debug/Navigation buttons */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Room />}
                onClick={directNavToStudySpaces}
              >
                Study Spaces
              </Button>
              <Button
                variant="outlined"
                startIcon={<Bookmark />}
                onClick={directNavToBookings}
              >
                My Bookings
              </Button>
            </Box>

            {/* Quick suggestions */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                width: "100%",
                maxWidth: "300px",
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                align="center"
              >
                Quick Questions:
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => handleUserInput("Find me a quiet study space")}
              >
                Find a quiet study space
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() =>
                  handleUserInput("I need a room with a whiteboard")
                }
              >
                Room with whiteboard
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => handleUserInput("Show me my reservations")}
              >
                Show my reservations
              </Button>
            </Box>

            {/* Log management buttons */}
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={clearChatHistory}
              >
                Clear Chat
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
              onSubmit={handleFormSubmit}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && input.trim()) {
                        e.preventDefault();
                        handleUserInput(input);
                      }
                    }}
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
