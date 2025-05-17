import React, { useState } from 'react';
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
} from '@mui/material';
import { AccessTime, LocationOn, Category } from '@mui/icons-material';

export default function EventFilterComponent() {
  const [filters, setFilters] = useState({
    timeframe: '',
    location: '',
    eventType: '',
  });

  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const events = [
    {
      id: 0,
      name: 'UWT LEBRON Hackathon',
      timeframe: '10AM-6PM',
      location: 'SNO',
      eventType: 'Workshop',
      date: '2025-05-17',
      description: 'LEBRON JAMES MY GOAT MY KING!',
    },
    {
      id: 1,
      name: 'AI Workshop',
      timeframe: '8AM-10AM',
      location: 'MAT',
      eventType: 'Workshop',
      date: '2025-05-18',
      description: 'Learn about the latest advancements in artificial intelligence.',
    },
    {
      id: 2,
      name: 'End of Semester Party',
      timeframe: '8PM-10PM',
      location: 'WPH',
      eventType: 'Party',
      date: '2025-05-25',
      description: 'Join us for a fun party to celebrate the end of the semester.',
    },
    {
      id: 3,
      name: 'Research Seminar',
      timeframe: '2PM-4PM',
      location: 'MLG',
      eventType: 'Seminar/Conference',
      date: '2025-05-19',
      description: 'Presentations on the latest research in various fields.',
    },
    {
      id: 4,
      name: 'Networking Event',
      timeframe: '6PM-8PM',
      location: 'TLC',
      eventType: 'Networking',
      date: '2025-05-22',
      description: 'Meet industry professionals and make valuable connections.',
    },
    {
      id: 5,
      name: 'Data Science Workshop',
      timeframe: '10AM-12PM',
      location: 'TPS',
      eventType: 'Workshop',
      date: '2025-05-21',
      description: 'Hands-on workshop to learn data science tools and techniques.',
    },
    {
      id: 6,
      name: 'Annual Gala',
      timeframe: '8PM-10PM',
      location: 'KEY',
      eventType: 'Party',
      date: '2025-05-23',
      description: 'Formal gala with dinner, dancing, and awards.',
    },
    {
      id: 7,
      name: 'Tech Conference',
      timeframe: '12PM-2PM',
      location: 'CP',
      eventType: 'Seminar/Conference',
      date: '2025-05-24',
      description: 'A conference showcasing the latest in tech innovation.',
    },
    {
      id: 8,
      name: 'Career Networking',
      timeframe: '4PM-6PM',
      location: 'SCI',
      eventType: 'Networking',
      date: '2025-05-25',
      description: 'Network with recruiters and alumni to find job opportunities.',
    },
  ];

  const timeframes = [
    { value: '8AM-10AM', label: '8:00 AM - 10:00 AM' },
    { value: '10AM-12PM', label: '10:00 AM - 12:00 PM' },
    { value: '12PM-2PM', label: '12:00 PM - 2:00 PM' },
    { value: '2PM-4PM', label: '2:00 PM - 4:00 PM' },
    { value: '4PM-6PM', label: '4:00 PM - 6:00 PM' },
    { value: '6PM-8PM', label: '6:00 PM - 8:00 PM' },
    { value: '8PM-10PM', label: '8:00 PM - 10:00 PM' },
    { value: '5PM-9PM', label: '5:00 PM - 9:00 PM' }, // added for UWT Block Party
  ];

  const locations = ['SNO', 'MAT', 'WPH', 'MLG', 'TLC', 'TPS', 'KEY', 'CP', 'SCI'];

  const eventTypes = ['Workshop', 'Party', 'Seminar/Conference', 'Networking'];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const resetFilters = () => {
    setFilters({
      timeframe: '',
      location: '',
      eventType: '',
    });
    setSearch('');
    setSelectedDate(null);
  };

  // Format today's date as yyyy-mm-dd
  const todayDateString = new Date().toISOString().slice(0, 10);

  // Get ongoing event (matching today's date)
  const ongoingEvent = events.find((event) => event.date === todayDateString);

  // Filter events by search, filters, and date filter if selectedDate set,
  // Exclude ongoing event from upcoming events
  const filteredEvents = events
    .filter((event) => event.id !== (ongoingEvent?.id ?? -1)) // exclude ongoing
    .filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase());

      const matchesDate = selectedDate
        ? event.date === selectedDate.toISOString().slice(0, 10)
        : true;

      return (
        matchesSearch &&
        (filters.timeframe === '' || event.timeframe === filters.timeframe) &&
        (filters.location === '' || event.location === filters.location) &&
        (filters.eventType === '' || event.eventType === filters.eventType) &&
        matchesDate
      );
    })
    // Sort events by date ascending
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'Workshop':
        return 'primary';
      case 'Party':
        return 'secondary';
      case 'Seminar/Conference':
        return 'info';
      case 'Networking':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Grid
      container
      spacing={3}
      wrap="nowrap"
      sx={{
        flexDirection: { xs: 'column', md: 'row' },
        height: 800, // fixed height for whole container
      }}
    >
      {/* Sidebar */}
      <Grid
        item
        xs={12}
        md={3}
        sx={{
          minWidth: 280,
          maxWidth: 320,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #ccc',
            maxHeight: 700,
            overflow: 'hidden',
          }}
        >
          {/* Filters scrollable box */}
          <Box
            sx={{
              overflowY: 'auto',
              maxHeight: 540,
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

              {/* Date filter using native input */}
              <TextField
                label="Filter by Date"
                type="date"
                value={selectedDate ? selectedDate.toISOString().slice(0, 10) : ''}
                onChange={(e) =>
                  setSelectedDate(e.target.value ? new Date(e.target.value) : null)
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Button variant="outlined" onClick={resetFilters}>
            Reset Filters
          </Button>
        </Paper>
      </Grid>

      {/* Main content */}
      <Grid
        item
        xs
        md={9}
        sx={{
          p: 3,
          overflowY: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Ongoing Event Section */}
        <Box
          sx={{
            mb: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Ongoing Event
          </Typography>

          {ongoingEvent ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {ongoingEvent.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                  <AccessTime fontSize="small" />
                  <Typography>{ongoingEvent.timeframe}</Typography>
                  <LocationOn fontSize="small" />
                  <Typography>{ongoingEvent.location}</Typography>
                  <Category fontSize="small" />
                  <Chip
                    label={ongoingEvent.eventType}
                    color={getEventTypeColor(ongoingEvent.eventType)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2">{ongoingEvent.description}</Typography>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Date: {ongoingEvent.date}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Typography>No ongoing events today.</Typography>
          )}
        </Box>

        {/* Upcoming Events Section */}
        <Box
          sx={{
            flexGrow: 1,
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            overflowY: 'auto',
          }}
        >
          <Typography variant="h5" sx={{ width: '100%', mb: 2 }}>
            Upcoming Events
          </Typography>

          {filteredEvents.length === 0 ? (
            <Typography>No events found.</Typography>
          ) : (
            filteredEvents.map((event) => (
              <Card
                key={event.id}
                sx={{
                  flex: '1 1 300px',
                  minWidth: 300,
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {event.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                    <AccessTime fontSize="small" />
                    <Typography>{event.timeframe}</Typography>
                    <LocationOn fontSize="small" />
                    <Typography>{event.location}</Typography>
                    <Category fontSize="small" />
                    <Chip
                      label={event.eventType}
                      color={getEventTypeColor(event.eventType)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">{event.description}</Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Date: {event.date}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
