import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Container, Typography } from "@mui/material";
import StudySpaceFinder from "./studySpaceFinder";
import UserBookings from "./userBookings";
import EventCurator from "./eventCurator";

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
    console.log("Booking change detected, refreshing components...");
    setRefreshTrigger((prev) => prev + 1);

    // If we're not already on the bookings tab, we can optionally
    // switch to it to show the user their new booking
    // Uncomment this if you want this behavior
    // setActiveTab(2);
  };

  return (
    <Container maxWidth="xl">
      <Typography
        variant="h3"
        component="h1"
        sx={{ my: 4, textAlign: "center" }}
      >
        Campus Resources
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Find a Study Space" />
          <Tab label="Campus Events" />
          <Tab label="My Bookings" />
        </Tabs>
      </Box>

      {/* Study Space Finder Tab */}
      <Box hidden={activeTab !== 0}>
        {activeTab === 0 && (
          <StudySpaceFinder
            key={`study-${refreshTrigger}`} // Force re-render when bookings change
            onBookingSuccess={handleBookingChange}
          />
        )}
      </Box>

      {/* Campus Events Tab */}
      <Box hidden={activeTab !== 1}>
        {activeTab === 1 && (
          <EventCurator
            key={`events-${refreshTrigger}`} // Force re-render when bookings change
            onBookingChange={handleBookingChange}
          />
        )}
      </Box>

      {/* My Bookings Tab */}
      <Box hidden={activeTab !== 2}>
        {activeTab === 2 && (
          <UserBookings
            userId={userId}
            onBookingChange={handleBookingChange}
            refreshTrigger={refreshTrigger} // Pass refreshTrigger explicitly
            key={`bookings-${refreshTrigger}`} // Force re-render when bookings change
          />
        )}
      </Box>
    </Container>
  );
};

export default StudyApp;
