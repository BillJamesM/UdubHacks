import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Box,
  CircularProgress,
  Badge,
  Snackbar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  People,
  Event,
  Check,
  BookmarkAdd,
  Assignment,
  Refresh,
} from "@mui/icons-material";
import { getStudySpaces, bookStudySpace } from "../services/studySpaceService";

const StudySpaceFinder = ({ initialFilters = {}, onBookingSuccess }) => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minCapacity: initialFilters.minCapacity || 1,
    features: initialFilters.features || [],
    date: "2025-05-17", // Default to today for demo
    time: initialFilters.time || "",
  });
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);

  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchSpaces();
  }, [filters]);

  // Show success notification when a booking is made
  useEffect(() => {
    if (bookingSuccess) {
      const timer = setTimeout(() => {
        setBookingSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bookingSuccess]);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const data = await getStudySpaces(filters);
      setSpaces(data);
    } catch (error) {
      console.error("Error fetching study spaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (spaceId, timeSlot) => {
    if (!timeSlot) {
      setBookingStatus({
        severity: "error",
        message: "Please select a time slot",
      });
      return;
    }

    setBookingStatus({ severity: "info", message: "Creating your booking..." });

    try {
      const bookingDetails = {
        userId: "demo-user-id", // In a real app, this would be the current user's ID
        spaceId: spaceId,
        date: filters.date,
        timeSlot: timeSlot,
      };

      const response = await bookStudySpace(bookingDetails);

      if (response.success) {
        setBookingStatus({
          severity: "success",
          message: "Study space booked successfully! Added to your calendar.",
        });

        // Refresh the spaces to reflect the booking immediately
        setTimeout(() => {
          setBookingDialogOpen(false);
          setBookingStatus(null);
          fetchSpaces(); // This now should show updated availability

          // Notify parent component if provided
          if (onBookingSuccess) {
            onBookingSuccess();
          }

          // Set success flag for snackbar notification
          setBookingSuccess(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Error booking space:", error);
      setBookingStatus({
        severity: "error",
        message: "Could not complete booking. Please try again.",
      });
    }
  };

  const handleFeatureToggle = (feature) => {
    setFilters((prev) => {
      const features = [...prev.features];
      if (features.includes(feature)) {
        return { ...prev, features: features.filter((f) => f !== feature) };
      } else {
        return { ...prev, features: [...features, feature] };
      }
    });
  };

  // Map feature IDs from the filter to actual feature names in the data
  const mapFeatureId = (featureId) => {
    const featureMap = {
      whiteboard: "whiteboard",
      monitors: "monitors",
      power_outlets: "power outlets",
      natural_light: "natural light",
      quiet: "soundproofing", // Mapping "quiet" filter to "soundproofing" feature
    };
    return featureMap[featureId] || featureId;
  };

  const allFeatures = [
    { id: "whiteboard", label: "Whiteboard" },
    { id: "monitors", label: "Monitors/Displays" },
    { id: "power_outlets", label: "Power Outlets" },
    { id: "natural_light", label: "Natural Light" },
    { id: "quiet", label: "Quiet" },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Find a Study Space
      </Typography>

      <Grid container spacing={3}>
        {/* Filters Column */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, position: "sticky", top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Minimum Capacity</InputLabel>
              <Select
                value={filters.minCapacity}
                label="Minimum Capacity"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minCapacity: parseInt(e.target.value),
                  })
                }
              >
                <MenuItem value={1}>1+ People</MenuItem>
                <MenuItem value={2}>2+ People</MenuItem>
                <MenuItem value={4}>4+ People</MenuItem>
                <MenuItem value={8}>8+ People</MenuItem>
                <MenuItem value={20}>20+ People</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Time</InputLabel>
              <Select
                value={filters.time}
                label="Time"
                onChange={(e) =>
                  setFilters({ ...filters, time: e.target.value })
                }
              >
                <MenuItem value="">Any Time</MenuItem>
                <MenuItem value="08:00">8:00 AM</MenuItem>
                <MenuItem value="10:00">10:00 AM</MenuItem>
                <MenuItem value="12:00">12:00 PM</MenuItem>
                <MenuItem value="14:00">2:00 PM</MenuItem>
                <MenuItem value="16:00">4:00 PM</MenuItem>
                <MenuItem value="18:00">6:00 PM</MenuItem>
                <MenuItem value="20:00">8:00 PM</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Features
            </Typography>
            <FormGroup>
              {allFeatures.map((feature) => (
                <FormControlLabel
                  key={feature.id}
                  control={
                    <Checkbox
                      checked={filters.features.includes(feature.id)}
                      onChange={() => handleFeatureToggle(feature.id)}
                    />
                  }
                  label={feature.label}
                />
              ))}
            </FormGroup>

            {/* Add a refresh button */}
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={fetchSpaces}
              startIcon={<Refresh />}
            >
              Refresh Results
            </Button>
          </Paper>
        </Grid>

        {/* List Column */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 5,
              }}
            >
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 3 }}>
                Finding the perfect study space for you...
              </Typography>
            </Box>
          ) : spaces.length === 0 ? (
            <Alert severity="info">
              No study spaces match your criteria. Try adjusting your filters.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {spaces.map((space) => (
                <Grid item xs={12} sm={6} md={4} key={space.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={space.imageUrl}
                      alt={space.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {space.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {space.building}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          icon={<People />}
                          label={`Capacity: ${space.capacity}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box sx={{ mb: 2, minHeight: "70px" }}>
                        {space.features.map((feature) => (
                          <Chip
                            key={feature}
                            label={feature}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Available Times:
                      </Typography>
                      <Box sx={{ mb: 1, minHeight: "80px" }}>
                        {space.availability[0].slots
                          .filter((slot) => slot.available)
                          .map((slot) => (
                            <Chip
                              key={slot.time}
                              label={slot.time}
                              size="small"
                              onClick={() => {
                                setSelectedSpace({
                                  ...space,
                                  selectedSlot: slot.time,
                                });
                                setBookingDialogOpen(true);
                              }}
                              sx={{ mr: 0.5, mb: 0.5 }}
                              clickable
                            />
                          ))}
                        {space.availability[0].slots.filter(
                          (slot) => slot.available
                        ).length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No available times for today
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ mt: "auto", px: 2, pb: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<BookmarkAdd />}
                        onClick={() => {
                          setSelectedSpace(space);
                          setBookingDialogOpen(true);
                        }}
                        fullWidth
                        disabled={
                          space.availability[0].slots.filter(
                            (slot) => slot.available
                          ).length === 0
                        }
                      >
                        Book This Space
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => {
          setBookingDialogOpen(false);
          setBookingStatus(null);
        }}
      >
        <DialogTitle>Book Study Space</DialogTitle>
        <DialogContent>
          {selectedSpace && (
            <>
              <Typography variant="h6">{selectedSpace.name}</Typography>
              <Typography variant="body2" paragraph>
                {selectedSpace.building}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Chip
                  icon={<People />}
                  label={`Capacity: ${selectedSpace.capacity}`}
                />
              </Box>

              {(!selectedSpace.selectedSlot ||
                !selectedSpace.availability[0].slots.find(
                  (slot) => slot.time === selectedSpace.selectedSlot
                )?.available) && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Select a Time Slot:
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                  >
                    {selectedSpace.availability[0].slots
                      .filter((slot) => slot.available)
                      .map((slot) => (
                        <Chip
                          key={slot.time}
                          label={slot.time}
                          onClick={() =>
                            setSelectedSpace({
                              ...selectedSpace,
                              selectedSlot: slot.time,
                            })
                          }
                          clickable
                          variant={
                            selectedSpace.selectedSlot === slot.time
                              ? "filled"
                              : "outlined"
                          }
                          color={
                            selectedSpace.selectedSlot === slot.time
                              ? "primary"
                              : "default"
                          }
                        />
                      ))}
                    {selectedSpace.availability[0].slots.filter(
                      (slot) => slot.available
                    ).length === 0 && (
                      <Typography variant="body2" color="error">
                        No available times for this space today
                      </Typography>
                    )}
                  </Box>
                </>
              )}

              {selectedSpace.selectedSlot &&
                selectedSpace.availability[0].slots.find(
                  (slot) => slot.time === selectedSpace.selectedSlot
                )?.available && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Event sx={{ mr: 1 }} />
                      <Typography>
                        Selected Time:{" "}
                        <strong>{selectedSpace.selectedSlot}</strong>
                      </Typography>
                    </Box>
                    <DialogContentText>
                      Confirm your booking for this space?
                    </DialogContentText>
                  </>
                )}

              {bookingStatus && (
                <Alert severity={bookingStatus.severity} sx={{ mt: 2 }}>
                  {bookingStatus.message}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setBookingDialogOpen(false);
              setBookingStatus(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              handleBooking(selectedSpace.id, selectedSpace.selectedSlot)
            }
            disabled={
              !selectedSpace?.selectedSlot ||
              !selectedSpace?.availability[0].slots.find(
                (slot) => slot.time === selectedSpace.selectedSlot
              )?.available ||
              bookingStatus?.severity === "success"
            }
            startIcon={<Check />}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={bookingSuccess}
        autoHideDuration={5000}
        onClose={() => setBookingSuccess(false)}
        message="Room booked successfully! View in 'My Bookings' tab."
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  );
};

export default StudySpaceFinder;
