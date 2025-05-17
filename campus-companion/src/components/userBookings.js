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
} from "@mui/material";
import { Delete, CalendarMonth, LocationOn, Group } from "@mui/icons-material";
import { getUserBookings } from "../services/studySpaceService";

// New import for canceling bookings
import { cancelBooking } from "../services/studySpaceService";

const UserBookings = ({ userId = "demo-user-id", onBookingChange }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelStatus, setCancelStatus] = useState(null);

  useEffect(() => {
    fetchUserBookings();
  }, [userId]);

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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        My Bookings
      </Typography>

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
            You don't have any bookings yet
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
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
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
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
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
    </Container>
  );
};

export default UserBookings;
