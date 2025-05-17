import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Delete,
  CalendarMonth,
  LocationOn,
  Group,
  Category,
  EventNote,
} from "@mui/icons-material";
import { getUserBookings } from "../services/studySpaceService";

// New import for canceling bookings
import { cancelBooking } from "../services/studySpaceService";

// Mock service for event bookings (would be in your services directory in a real app)
const getUserEventBookings = async (userId) => {
  // This would be an API call in a real application
  // For now, we'll retrieve from localStorage for the demo
  try {
    const storedBookings = localStorage.getItem("userEventBookings");
    const bookings = storedBookings ? JSON.parse(storedBookings) : [];
    return bookings.filter((booking) => booking.userId === userId);
  } catch (error) {
    console.error("Error fetching event bookings:", error);
    return [];
  }
};

const cancelEventBooking = async (bookingId) => {
  // This would be an API call in a real application
  try {
    console.log("Cancelling event booking:", bookingId);
    const storedBookings = localStorage.getItem("userEventBookings");

    if (!storedBookings) {
      console.error("No stored bookings found, cannot cancel");
      throw new Error("No bookings found");
    }

    let bookings = JSON.parse(storedBookings);
    console.log("Current bookings before cancellation:", bookings);

    const initialLength = bookings.length;
    bookings = bookings.filter((booking) => booking.bookingId !== bookingId);
    console.log("Bookings after removal:", bookings);

    if (bookings.length === initialLength) {
      console.warn("No booking found with ID:", bookingId);
    }

    localStorage.setItem("userEventBookings", JSON.stringify(bookings));
    return { success: true };
  } catch (error) {
    console.error("Error cancelling event booking:", error);
    throw new Error("Failed to cancel booking");
  }
};

const UserBookings = ({
  userId = "demo-user-id",
  onBookingChange,
  refreshTrigger = 0,
}) => {
  // Tab state
  const [bookingTab, setBookingTab] = useState(0);

  // Study space bookings state
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelStatus, setCancelStatus] = useState(null);

  // Event bookings state
  const [eventBookings, setEventBookings] = useState([]);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState(null);
  const [eventCancelStatus, setEventCancelStatus] = useState(null);

  // Initialize localStorage if needed (for demo purposes)
  useEffect(() => {
    // Check if userEventBookings exists in localStorage, if not initialize it
    if (!localStorage.getItem("userEventBookings")) {
      localStorage.setItem("userEventBookings", JSON.stringify([]));
    }
  }, []);

  // This effect will run when the component mounts or refreshTrigger changes
  useEffect(() => {
    console.log("UserBookings component refreshed, trigger:", refreshTrigger);
    // Fetch the appropriate bookings based on the active tab
    if (bookingTab === 0) {
      fetchUserBookings();
    } else {
      fetchUserEventBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, bookingTab]); // Added eslint disable to avoid dependency warnings

  const fetchUserBookings = async () => {
    setLoading(true);
    try {
      const userBookings = await getUserBookings(userId);
      setBookings(userBookings);
      setError(null);
    } catch (err) {
      console.error("Error fetching user bookings:", err);
      setError("Could not load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEventBookings = async () => {
    setEventLoading(true);
    try {
      console.log("Fetching event bookings for user:", userId);
      const userBookings = await getUserEventBookings(userId);
      console.log("Retrieved event bookings:", userBookings);
      setEventBookings(userBookings);
      setEventError(null);
    } catch (err) {
      console.error("Error fetching user event bookings:", err);
      setEventError(
        "Could not load your event bookings. Please try again later."
      );
    } finally {
      setEventLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancelStatus({ type: "info", message: "Cancelling your booking..." });
    try {
      await cancelBooking(bookingId);
      setCancelStatus({
        type: "success",
        message: "Booking cancelled successfully",
      });
      // Refresh the bookings list
      fetchUserBookings();
      // Notify parent component (to refresh study spaces)
      if (onBookingChange) {
        onBookingChange();
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setCancelStatus(null);
      }, 3000);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setCancelStatus({
        type: "error",
        message: "Could not cancel booking. Please try again.",
      });
    }
  };

  const handleCancelEventBooking = async (bookingId) => {
    setEventCancelStatus({
      type: "info",
      message: "Cancelling your event registration...",
    });
    try {
      await cancelEventBooking(bookingId);
      setEventCancelStatus({
        type: "success",
        message: "Event registration cancelled successfully",
      });
      // Refresh the bookings list
      fetchUserEventBookings();
      // Notify parent component
      if (onBookingChange) {
        onBookingChange();
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setEventCancelStatus(null);
      }, 3000);
    } catch (err) {
      console.error("Error cancelling event registration:", err);
      setEventCancelStatus({
        type: "error",
        message: "Could not cancel registration. Please try again.",
      });
    }
  };

  // Helper function to format the date
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Helper function to determine event type color
  const getEventTypeColor = (type) => {
    switch (type) {
      case "Workshop":
        return "primary";
      case "Party":
        return "secondary";
      case "Seminar/Conference":
        return "info";
      case "Networking":
        return "success";
      default:
        return "default";
    }
  };

  const handleTabChange = (event, newValue) => {
    setBookingTab(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        My Bookings
      </Typography>

      {/* Tabs for Study Spaces vs Events */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={bookingTab} onChange={handleTabChange} variant="fullWidth">
          <Tab
            label="Study Spaces"
            icon={<Group sx={{ mr: 1 }} />}
            iconPosition="start"
          />
          <Tab
            label="Events"
            icon={<EventNote sx={{ mr: 1 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Study Space Bookings Tab */}
      <Box hidden={bookingTab !== 0}>
        {cancelStatus && (
          <Alert severity={cancelStatus.type} sx={{ mb: 3 }}>
            {cancelStatus.message}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : bookings.length === 0 ? (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" align="center">
              You don't have any study space bookings yet
            </Typography>
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              When you book a study space, it will appear here
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={3}>
            <List>
              {bookings.map((booking, index) => (
                <React.Fragment key={booking.bookingId}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="div">
                          {booking.spaceName || booking.spaceId}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <LocationOn
                              fontSize="small"
                              sx={{ mr: 1, color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {booking.building}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <CalendarMonth
                              fontSize="small"
                              sx={{ mr: 1, color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(booking.date)} • {booking.timeSlot}
                            </Typography>
                          </Box>
                          <Chip
                            icon={<Group />}
                            label={`Booking ID: ${booking.bookingId}`}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="cancel booking"
                        onClick={() => handleCancelBooking(booking.bookingId)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="contained"
            onClick={fetchUserBookings}
            startIcon={<CalendarMonth />}
          >
            Refresh Bookings
          </Button>
        </Box>
      </Box>

      {/* Event Bookings Tab */}
      <Box hidden={bookingTab !== 1}>
        {eventCancelStatus && (
          <Alert severity={eventCancelStatus.type} sx={{ mb: 3 }}>
            {eventCancelStatus.message}
          </Alert>
        )}

        {eventLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : eventError ? (
          <Alert severity="error">{eventError}</Alert>
        ) : eventBookings.length === 0 ? (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" align="center">
              You haven't registered for any events yet
            </Typography>
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              When you register for an event, it will appear here
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={3}>
            <List>
              {eventBookings.map((booking, index) => (
                <React.Fragment key={booking.bookingId}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="div">
                          {booking.event.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <LocationOn
                              fontSize="small"
                              sx={{ mr: 1, color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {booking.event.location}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <CalendarMonth
                              fontSize="small"
                              sx={{ mr: 1, color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {booking.event.date},{" "}
                              {booking.event.timeframe
                                .replace("AM", " AM")
                                .replace("PM", " PM")}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Category
                              fontSize="small"
                              sx={{ mr: 1, color: "text.secondary" }}
                            />
                            <Chip
                              label={booking.event.eventType}
                              size="small"
                              color={getEventTypeColor(booking.event.eventType)}
                            />
                          </Box>
                          <Chip
                            icon={<EventNote />}
                            label={`Booking ID: ${booking.bookingId}`}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="cancel registration"
                        onClick={() =>
                          handleCancelEventBooking(booking.bookingId)
                        }
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="contained"
            onClick={fetchUserEventBookings}
            startIcon={<CalendarMonth />}
          >
            Refresh Event Registrations
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UserBookings;
