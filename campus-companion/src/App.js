import React, { useState } from "react";
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
} from "@mui/material";
import { SmartToy, Map, Event } from "@mui/icons-material";
import RobotAssistant from "./components/robotAssistant";
import StudySpaceFinder from "./components/studySpaceFinder";
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

  const handleStudySpaceSearch = (filters) => {
    setStudySpaceFilters(filters);
    setActiveTab(1); // Switch to study spaces tab
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
            <Tab icon={<Event />} label="Event Curator" />
          </Tabs>
        </AppBar>

        <Container sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <RobotAssistant onStudySpaceSearch={handleStudySpaceSearch} />
          )}

          {activeTab === 1 && (
            <StudySpaceFinder initialFilters={studySpaceFilters} />
          )}
          {activeTab === 2 && (
            <EventCurator  />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
