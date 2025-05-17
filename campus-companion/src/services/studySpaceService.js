import { studySpaces } from "../data/studySpaces";

// Simulated delay to mimic real API
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getStudySpaces = async (filters = {}) => {
  await delay(600); // Simulate network delay

  // Apply filters
  return studySpaces.filter((space) => {
    // Filter by noise level
    if (
      filters.noiseLevel &&
      filters.noiseLevel !== "any" &&
      space.noiseLevel !== filters.noiseLevel
    ) {
      return false;
    }

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

  // Simulate success response
  return {
    success: true,
    bookingId: "book-" + Math.floor(Math.random() * 10000),
    ...bookingDetails,
  };
};

export const getUserBookings = async (userId) => {
  await delay(500);

  // In a real app, this would fetch the user's bookings from a server
  // Here we'll return mock data
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
};
