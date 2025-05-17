import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
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
  ToggleButtonGroup,
  ToggleButton,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  Map as MapIcon,
  List as ListIcon,
  LocationOn,
  People,
  VolumeUp,
  Event,
  Check,
  BookmarkAdd,
} from "@mui/icons-material";
import { Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LeafletMap from "./LeafletMap"; // Import the new helper component
import { getStudySpaces, bookStudySpace } from "../services/studySpaceService";

const StudySpaceFinder = ({ initialFilters = {} }) => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    noiseLevel: initialFilters.noiseLevel || "any",
    minCapacity: initialFilters.minCapacity || 1,
    features: initialFilters.features || [],
    date: "2025-05-17", // Default to today for demo
    time: initialFilters.time || "",
  });
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [map, setMap] = useState(null);
  const [view, setView] = useState("map"); // 'map' or 'list'
  const mapRef = useRef();

  useEffect(() => {
    fetchSpaces();
  }, [filters]);

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

        // In a real app, update the UI to reflect the new booking
        // For demo, we'll just close the dialog after a delay
        setTimeout(() => {
          setBookingDialogOpen(false);
          setBookingStatus(null);
          fetchSpaces(); // Refresh the spaces to reflect the booking
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

  const allFeatures = [
    { id: "whiteboard", label: "Whiteboard" },
    { id: "monitors", label: "Monitors/Displays" },
    { id: "power_outlets", label: "Power Outlets" },
    { id: "natural_light", label: "Natural Light" },
    { id: "quiet", label: "Quiet" },
  ];

  const flyToSpace = (coordinates) => {
    if (map) {
      map.flyTo([coordinates.lat, coordinates.lng], 18);
    }
  };

  const getNoiseLevelColor = (level) => {
    switch (level) {
      case "quiet":
        return "success";
      case "moderate":
        return "warning";
      case "collaborative":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Find a Study Space
      </Typography>

      {/* View Toggle */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(e, newView) => newView && setView(newView)}
          aria-label="view mode"
        >
          <ToggleButton value="map" aria-label="map view">
            <MapIcon sx={{ mr: 1 }} />
            Map View
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ListIcon sx={{ mr: 1 }} />
            List View
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Filters Column */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, position: "sticky", top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Noise Level</InputLabel>
              <Select
                value={filters.noiseLevel}
                label="Noise Level"
                onChange={(e) =>
                  setFilters({ ...filters, noiseLevel: e.target.value })
                }
              >
                <MenuItem value="any">Any</MenuItem>
                <MenuItem value="quiet">Quiet</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="collaborative">Collaborative</MenuItem>
              </Select>
            </FormControl>

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
          </Paper>
        </Grid>

        {/* Map/List Column */}
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
          ) : view === "map" ? (
            <Paper
              elevation={3}
              sx={{ height: 500, borderRadius: 2, overflow: "hidden" }}
            >
              {/* Use the LeafletMap component instead of MapContainer */}
              <LeafletMap
                center={[40.7128, -74.006]}
                zoom={15}
                onMapCreated={setMap}
              >
                {spaces.map((space) => (
                  <Marker
                    key={space.id}
                    position={[space.coordinates.lat, space.coordinates.lng]}
                    eventHandlers={{
                      click: () => setSelectedSpace(space),
                    }}
                  >
                    <Popup>
                      <div>
                        <Typography variant="h6">{space.name}</Typography>
                        <Typography variant="body2">
                          {space.building}
                        </Typography>
                        <Typography variant="body2">
                          Capacity: {space.capacity}
                        </Typography>
                        <Typography variant="body2">
                          Noise Level: {space.noiseLevel}
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ mt: 1 }}
                          onClick={() => {
                            setSelectedSpace(space);
                            setBookingDialogOpen(true);
                          }}
                        >
                          Book This Space
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LeafletMap>
            </Paper>
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
                      height="140"
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
                          label={space.noiseLevel}
                          color={getNoiseLevelColor(space.noiseLevel)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
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
                      </Box>
                    </CardContent>
                    <CardActions
                      sx={{
                        mt: "auto",
                        justifyContent: "space-between",
                        px: 2,
                        pb: 2,
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<BookmarkAdd />}
                        onClick={() => {
                          setSelectedSpace(space);
                          setBookingDialogOpen(true);
                        }}
                      >
                        Book
                      </Button>
                      {view === "list" && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LocationOn />}
                          onClick={() => {
                            setView("map");
                            setTimeout(() => {
                              flyToSpace(space.coordinates);
                            }, 100);
                          }}
                        >
                          Map
                        </Button>
                      )}
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
                <Chip
                  icon={<VolumeUp />}
                  label={`Noise Level: ${selectedSpace.noiseLevel}`}
                  color={getNoiseLevelColor(selectedSpace.noiseLevel)}
                />
              </Box>

              {!selectedSpace.selectedSlot && (
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
                  </Box>
                </>
              )}

              {selectedSpace.selectedSlot && (
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
              bookingStatus?.severity === "success"
            }
            startIcon={<Check />}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudySpaceFinder;
