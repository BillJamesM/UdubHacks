import { studySpaces } from "../data/studySpaces";

// Simulated delay to mimic real API
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory cache of bookings for the demo
let bookingsCache = [];

export const getStudySpaces = async (filters = {}) => {
  await delay(600); // Simulate network delay

  // Create a deep copy of study spaces to work with
  const spacesWithUpdatedAvailability = JSON.parse(JSON.stringify(studySpaces));

  // Apply booking cache to update availability
  bookingsCache.forEach((booking) => {
    const space = spacesWithUpdatedAvailability.find(
      (s) => s.id === booking.spaceId
    );
    if (space) {
      const dateAvailability = space.availability.find(
        (a) => a.date === booking.date
      );
      if (dateAvailability) {
        const [startTime] = booking.timeSlot.split("-");
        const timeSlot = dateAvailability.slots.find((slot) =>
          slot.time.startsWith(startTime)
        );
        if (timeSlot) {
          timeSlot.available = false;
        }
      }
    }
  });

  // Now apply filters to the updated spaces
  return spacesWithUpdatedAvailability.filter((space) => {
    // Filter by minimum capacity
    if (filters.minCapacity && space.capacity < filters.minCapacity) {
      return false;
    }

    // Filter by features
    if (filters.features && filters.features.length > 0) {
      const hasAllFeatures = filters.features.every((feature) =>
        space.features.includes(feature)
      );
      if (!hasAllFeatures) return false;
    }

    // Filter by availability
    if (filters.date && filters.time) {
      const dateAvailability = space.availability.find(
        (a) => a.date === filters.date
      );
      if (!dateAvailability) return false;

      const timeSlot = dateAvailability.slots.find((slot) =>
        slot.time.startsWith(filters.time)
      );
      if (!timeSlot || !timeSlot.available) return false;
    }

    return true;
  });
};

export const bookStudySpace = async (bookingDetails) => {
  await delay(800); // Simulate network delay

  // In a real app, this would send the booking to a server
  console.log("Booking created:", bookingDetails);

  // Generate a booking ID
  const bookingId = "book-" + Math.floor(Math.random() * 10000);

  // Add to our in-memory bookings cache
  const newBooking = {
    bookingId,
    ...bookingDetails,
  };

  bookingsCache.push(newBooking);

  // Simulate success response
  return {
    success: true,
    bookingId,
    ...bookingDetails,
  };
};

export const getUserBookings = async (userId) => {
  await delay(500);

  // Return bookings from our cache for this user
  const userBookings = bookingsCache.filter(
    (booking) => booking.userId === userId
  );

  // If empty, return a mock booking for the demo
  if (userBookings.length === 0) {
    return [
      {
        bookingId: "book-1234",
        userId: userId,
        spaceId: "lib-202",
        spaceName: "Library Study Room 202",
        building: "Main Library",
        date: "2025-05-18",
        timeSlot: "14:00-16:00",
      },
    ];
  }

  return userBookings;
};
