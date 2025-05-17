import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  TextField,
  Divider,
  CardActions,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  AccessTime,
  LocationOn,
  Category,
  BookmarkAdd,
  Check,
} from "@mui/icons-material";

export default function EventFilterComponent({ onBookingChange }) {
  const [filters, setFilters] = useState({
    timeframe: "",
    location: "",
    eventType: "",
  });

  const [search, setSearch] = useState("");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);

  // This would come from an API in a real app
  const events = [
    {
      id: 1,
      name: "AI Workshop",
      timeframe: "8AM-10AM",
      location: "Campus 1",
      eventType: "Workshop",
      date: "May 18, 2025",
      description:
        "Learn about the latest advancements in artificial intelligence.",
    },
    {
      id: 2,
      name: "Spring Semester Party",
      timeframe: "8PM-10PM",
      location: "Campus 3",
      eventType: "Party",
      date: "May 20, 2025",
      description:
        "Join us for a fun party to celebrate the end of the semester.",
    },
    {
      id: 3,
      name: "Research Seminar",
      timeframe: "2PM-4PM",
      location: "Campus 2",
      eventType: "Seminar/Conference",
      date: "May 19, 2025",
      description: "Presentations on the latest research in various fields.",
    },
    {
      id: 4,
      name: "Networking Event",
      timeframe: "6PM-8PM",
      location: "Campus 4",
      eventType: "Networking",
      date: "May 22, 2025",
      description: "Meet industry professionals and make valuable connections.",
    },
    {
      id: 5,
      name: "Data Science Workshop",
      timeframe: "10AM-12PM",
      location: "Campus 1",
      eventType: "Workshop",
      date: "May 21, 2025",
      description:
        "Hands-on workshop to learn data science tools and techniques.",
    },
    {
      id: 6,
      name: "Annual Gala",
      timeframe: "8PM-10PM",
      location: "Campus 3",
      eventType: "Party",
      date: "May 23, 2025",
      description: "Formal gala with dinner, dancing, and awards.",
    },
    {
      id: 7,
      name: "Tech Conference",
      timeframe: "12PM-2PM",
      location: "Campus 2",
      eventType: "Seminar/Conference",
      date: "May 24, 2025",
      description: "A conference showcasing the latest in tech innovation.",
    },
    {
      id: 8,
      name: "Career Networking",
      timeframe: "4PM-6PM",
      location: "Campus 4",
      eventType: "Networking",
      date: "May 25, 2025",
      description:
        "Network with recruiters and alumni to find job opportunities.",
    },
  ];

  const timeframes = [
    { value: "8AM-10AM", label: "8:00 AM - 10:00 AM" },
    { value: "10AM-12PM", label: "10:00 AM - 12:00 PM" },
    { value: "12PM-2PM", label: "12:00 PM - 2:00 PM" },
    { value: "2PM-4PM", label: "2:00 PM - 4:00 PM" },
    { value: "4PM-6PM", label: "4:00 PM - 6:00 PM" },
    { value: "6PM-8PM", label: "6:00 PM - 8:00 PM" },
    { value: "8PM-10PM", label: "8:00 PM - 10:00 PM" },
  ];

  const locations = ["Campus 1", "Campus 2", "Campus 3", "Campus 4"];

  const eventTypes = ["Workshop", "Party", "Seminar/Conference", "Networking"];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const resetFilters = () => {
    setFilters({
      timeframe: "",
      location: "",
      eventType: "",
    });
    setSearch("");
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase());
    return (
      matchesSearch &&
      (filters.timeframe === "" || event.timeframe === filters.timeframe) &&
      (filters.location === "" || event.location === filters.location) &&
      (filters.eventType === "" || event.eventType === filters.eventType)
    );
  });

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

  const handleOpenBookingDialog = (event) => {
    setSelectedEvent(event);
    setBookingDialogOpen(true);
  };

  const handleCloseBookingDialog = () => {
    setBookingDialogOpen(false);
    setSelectedEvent(null);
    setBookingStatus(null);
  };

  // This function simulates booking an event
  const bookEvent = async (bookingDetails) => {
    // Simulate API call with a promise
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          bookingId: `EVT-${Math.floor(Math.random() * 10000)}`,
          event: bookingDetails.event,
        });
      }, 1000);
    });
  };

  const handleBooking = async () => {
    setBookingStatus({ severity: "info", message: "Creating your booking..." });

    try {
      const bookingDetails = {
        userId: "demo-user-id", // Would come from authentication in a real app
        event: selectedEvent,
      };

      const response = await bookEvent(bookingDetails);

      if (response.success) {
        setBookingStatus({
          severity: "success",
          message: "Event booked successfully! Added to your calendar.",
        });

        // Save the booking to localStorage for demo purposes
        // In a real app, this would be handled by your API
        try {
          const storedBookings = localStorage.getItem("userEventBookings");
          const bookings = storedBookings ? JSON.parse(storedBookings) : [];

          const newBooking = {
            userId: "demo-user-id",
            bookingId: response.bookingId,
            event: selectedEvent,
            date: new Date().toISOString(),
          };

          bookings.push(newBooking);
          localStorage.setItem("userEventBookings", JSON.stringify(bookings));

          console.log("Event booking saved successfully:", newBooking);
          console.log("Total event bookings:", bookings.length);

          // Call onBookingChange to trigger refresh in parent components
          if (onBookingChange) {
            onBookingChange();
          }

          // Close dialog and show success message after a short delay
          setTimeout(() => {
            setBookingDialogOpen(false);
            setBookingSuccess(true);
            setBookingStatus(null);
          }, 1500);
        } catch (error) {
          console.error("Error saving booking:", error);
          alert("There was an error saving your booking. Please try again."); // Add explicit alert for debugging
        }
      }
    } catch (error) {
      console.error("Error booking event:", error);
      setBookingStatus({
        severity: "error",
        message: "Could not complete booking. Please try again.",
      });
    }
  };

  return (
    <Grid
      container
      spacing={3}
      wrap="nowrap"
      sx={{
        flexDirection: { xs: "column", md: "row" },
        height: 800, // Fixed height for entire page container
      }}
    >
      {/* Sidebar */}
      <Grid
        item
        xs={12}
        md="auto"
        sx={{
          minWidth: 280,
          maxWidth: 320,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #ccc",
            maxHeight: 600, // max height for the whole sidebar
            overflow: "hidden", // contain scroll inside children
          }}
        >
          {/* Filters scrollable box */}
          <Box
            sx={{
              overflowY: "auto",
              maxHeight: 450, // max height for scroll area - adjust as needed
              pr: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Event Filters
            </Typography>

            <TextField
              fullWidth
              label="Search events"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="timeframe-label">Timeframe</InputLabel>
                <Select
                  labelId="timeframe-label"
                  name="timeframe"
                  value={filters.timeframe}
                  onChange={handleFilterChange}
                  label="Timeframe"
                >
                  <MenuItem value="">All Timeframes</MenuItem>
                  {timeframes.map((time) => (
                    <MenuItem key={time.value} value={time.value}>
                      {time.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  label="Location"
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel id="eventType-label">Event Type</InputLabel>
                <Select
                  labelId="eventType-label"
                  name="eventType"
                  value={filters.eventType}
                  onChange={handleFilterChange}
                  label="Event Type"
                >
                  <MenuItem value="">All Event Types</MenuItem>
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Reset Filters button always visible below scroll */}
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={resetFilters} fullWidth>
              Reset Filters
            </Button>
          </Box>

          <Divider sx={{ mt: 2 }} />
        </Paper>
      </Grid>

      {/* Event Results */}
      <Grid
        item
        xs={12}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          pr: 2,
          height: "100%", // fill vertical height
        }}
      >
        <Typography variant="h6" gutterBottom>
          Results ({filteredEvents.length})
        </Typography>

        <Grid container direction="column" spacing={2}>
          {filteredEvents.map((event) => (
            <Grid item key={event.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {event.name}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AccessTime
                      fontSize="small"
                      color="action"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {event.date},{" "}
                      {event.timeframe
                        .replace("AM", " AM")
                        .replace("PM", " PM")}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationOn
                      fontSize="small"
                      color="action"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Category fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Chip
                      label={event.eventType}
                      size="small"
                      color={getEventTypeColor(event.eventType)}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {event.description}
                  </Typography>
                </CardContent>

                {/* Register Button */}
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<BookmarkAdd />}
                    onClick={() => handleOpenBookingDialog(event)}
                    fullWidth
                  >
                    Register for Event
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Event Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => {
          if (bookingStatus?.severity !== "info") {
            handleCloseBookingDialog();
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Book Event</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <Typography variant="h6">{selectedEvent.name}</Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1, mt: 2 }}>
                <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {selectedEvent.location}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <AccessTime fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {selectedEvent.date},{" "}
                  {selectedEvent.timeframe
                    .replace("AM", " AM")
                    .replace("PM", " PM")}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Category fontSize="small" color="action" sx={{ mr: 1 }} />
                <Chip
                  label={selectedEvent.eventType}
                  size="small"
                  color={getEventTypeColor(selectedEvent.eventType)}
                />
              </Box>

              <Typography variant="body2" paragraph>
                {selectedEvent.description}
              </Typography>

              <DialogContentText sx={{ mt: 2 }}>
                Would you like to register for this event?
              </DialogContentText>

              {bookingStatus && (
                <Alert severity={bookingStatus.severity} sx={{ mt: 2 }}>
                  {bookingStatus.message}
                  {bookingStatus.severity === "info" && (
                    <CircularProgress size={20} sx={{ ml: 2 }} />
                  )}
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseBookingDialog}
            disabled={bookingStatus?.severity === "info"}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBooking}
            disabled={
              bookingStatus?.severity === "success" ||
              bookingStatus?.severity === "info"
            }
            startIcon={<Check />}
          >
            Confirm Registration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={bookingSuccess}
        autoHideDuration={5000}
        onClose={() => setBookingSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setBookingSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Event registration successful! Go to 'My Bookings' tab and select
          'Events' to view your registration.
        </Alert>
      </Snackbar>
    </Grid>
  );
}
