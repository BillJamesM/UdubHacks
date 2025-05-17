import { studySpaces } from "../data/studySpaces";

// Simulated delay to mimic real API
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory cache of bookings for the demo
let bookingsCache = [];

// Load bookings from localStorage if available
const loadBookingsFromStorage = () => {
  try {
    const storedBookings = localStorage.getItem("studySpaceBookings");
    if (storedBookings) {
      bookingsCache = JSON.parse(storedBookings);
    }
  } catch (error) {
    console.error("Failed to load bookings from storage:", error);
  }
};

// Save bookings to localStorage
const saveBookingsToStorage = () => {
  try {
    localStorage.setItem("studySpaceBookings", JSON.stringify(bookingsCache));
  } catch (error) {
    console.error("Failed to save bookings to storage:", error);
  }
};

// Load bookings when the module initializes
loadBookingsFromStorage();

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

  // Generate a booking ID
  const bookingId = "book-" + Math.floor(Math.random() * 10000);

  // Find the space to get more details
  const space = studySpaces.find((s) => s.id === bookingDetails.spaceId);
  const spaceName = space ? space.name : bookingDetails.spaceId;
  const building = space ? space.building : "Unknown";

  // Add to our in-memory bookings cache
  const newBooking = {
    bookingId,
    spaceName,
    building,
    ...bookingDetails,
  };

  bookingsCache.push(newBooking);

  // Save to localStorage
  saveBookingsToStorage();

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

  // Return the user's bookings (may be empty array)
  return userBookings;
};

export const cancelBooking = async (bookingId) => {
  await delay(700); // Simulate network delay

  // Find index of booking to remove
  const bookingIndex = bookingsCache.findIndex(
    (booking) => booking.bookingId === bookingId
  );

  if (bookingIndex !== -1) {
    // Remove from array
    bookingsCache.splice(bookingIndex, 1);

    // Save to localStorage
    saveBookingsToStorage();

    return { success: true, message: "Booking cancelled successfully" };
  } else {
    throw new Error("Booking not found");
  }
};

export const getChatResponse = async (message) => {
  await delay(400); // Stimulate response delay

  const lowerMsg = message.toLowerCase();

  // 1. General study space inquiry
  if (lowerMsg.includes("availabe") || lowerMsg.includes("study space")) {
    const names = studySpaces.map((space) => space.name).join(", ");
    return `Sure! Here are some available study spaces: ${names}`;
  }

  // 2. Match by name
  const matchByName = studySpaces.find((space) =>
    lowerMsg.includes(space.name.toLowerCase())
  );
  if (matchByName) {
    return `The ${matchByName.name} in the ${
      matchByName.building
    }. It has a capacity of ${
      matchByName.capacity
    } and includes: ${matchByName.features.join(", ")}.`;
  }

  // 3. Match by feature keyword
  const keywords = [
    "white boards",
    "whiteboards",
    "moniter",
    "printer",
    "ergonomic",
    "power outlets",
    "desk",
  ];
  const foundKeyword = keywords.find((kw) => lowerMsg.includes(kw));
  if (foundKeyword) {
    const matching = studySpaces.filter((space) =>
      space.features.some((f) => f.toLowerCase().includes(foundKeyword))
    );
    if (matching.length > 0) {
      const result = matching.map((s) => s.name).join(", ");
      return `Rooms with ${foundKeyword}s: ${result}`;
    }
  }

  return `I'm not sure how to help with that.`;
};
