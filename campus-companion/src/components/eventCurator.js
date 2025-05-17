import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import EventFilterComponent from "./eventFilterComponent";

function EventCurator({ onBookingChange }) {
  return (
    <Box>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Campus Events
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Find events happening across all campus locations. Filter by time,
          location, and event type. Register for events to reserve your spot.
        </Typography>
      </Paper>

      <EventFilterComponent onBookingChange={onBookingChange} />
    </Box>
  );
}

export default EventCurator;
