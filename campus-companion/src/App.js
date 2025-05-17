import React, { useState, useEffect } from "react";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  ThemeProvider,
  createTheme,
  Box,
  Badge,
} from "@mui/material";
import { SmartToy, Map, BookmarkBorder, Event } from "@mui/icons-material";
import RobotAssistant from "./components/robotAssistant";
import StudySpaceFinder from "./components/studySpaceFinder";
import UserBookings from "./components/userBookings";
import EventCurator from "./components/eventCurator";

// Create a theme with Material Design colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [studySpaceFilters, setStudySpaceFilters] = useState({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);

  // Demo user ID - in a real app this would come from authentication
  const userId = "demo-user-id";

  const handleStudySpaceSearch = (filters) => {
    setStudySpaceFilters(filters);
    setActiveTab(1); // Switch to study spaces tab
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBookingChange = () => {
    // Increment counter to trigger refreshes in components
    setRefreshCounter((prev) => prev + 1);

    // Force refresh bookings count after a short delay
    setTimeout(() => {
      updateBookingsCount();
    }, 500);
  };

  // Function to update the bookings count badge
  const updateBookingsCount = async () => {
    try {
      // Import dynamically to avoid circular dependencies
      const { getUserBookings } = await import("./services/studySpaceService");
      const bookings = await getUserBookings(userId);
      setBookingsCount(bookings.length);
    } catch (error) {
      console.error("Error fetching bookings count:", error);
    }
  };

  // Update bookings count when component mounts
  useEffect(() => {
    updateBookingsCount();
  }, [refreshCounter]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <SmartToy sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Campus Companion
            </Typography>
          </Toolbar>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
            aria-label="navigation tabs"
          >
            <Tab icon={<SmartToy />} label="Robot Assistant" />
            <Tab icon={<Map />} label="Study Spaces" />
            <Tab
              icon={
                <Badge badgeContent={bookingsCount} color="secondary">
                  <BookmarkBorder />
                </Badge>
              }
              label="My Bookings"
            />
            <Tab icon={<Event />} label="Events" />
          </Tabs>
        </AppBar>

        <Container sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <RobotAssistant
              onStudySpaceSearch={handleStudySpaceSearch}
              onShowBookings={() => setActiveTab(2)}
              onShowEvents={() => setActiveTab(3)}
            />
          )}

          {activeTab === 1 && (
            <StudySpaceFinder
              initialFilters={studySpaceFilters}
              onBookingSuccess={handleBookingChange}
              key={`study-finder-${refreshCounter}`}
            />
          )}

          {activeTab === 2 && (
            <UserBookings
              userId={userId}
              onBookingChange={handleBookingChange}
              key={`user-bookings-${refreshCounter}`}
            />
          )}

          {activeTab === 3 && <EventCurator />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
