import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Container, Typography } from "@mui/material";
import StudySpaceFinder from "./studySpaceFinder";
import UserBookings from "./userBookings";

const StudyApp = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Demo user ID, in a real app this would come from authentication
  const userId = "demo-user-id";

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBookingChange = () => {
    // Trigger a refresh when bookings change (either new booking or cancellation)
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Container maxWidth="xl">
      <Typography
        variant="h3"
        component="h1"
        sx={{ my: 4, textAlign: "center" }}
      >
        Campus Study Spaces
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Find a Space" />
          <Tab label="My Bookings" />
        </Tabs>
      </Box>

      <Box hidden={activeTab !== 0}>
        {activeTab === 0 && (
          <StudySpaceFinder
            key={refreshTrigger} // Force re-render when bookings change
            onBookingSuccess={handleBookingChange}
          />
        )}
      </Box>

      <Box hidden={activeTab !== 1}>
        {activeTab === 1 && (
          <UserBookings userId={userId} onBookingChange={handleBookingChange} />
        )}
      </Box>
    </Container>
  );
};

export default StudyApp;
