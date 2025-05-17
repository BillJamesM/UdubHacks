export const studySpaces = [
  {
    id: "CP-324A",
    name: "CP-324A",
    building: "Main Library",
    capacity: 4,
    features: ["whiteboard", "monitors", "power outlets"],
    hours: { open: "08:00", close: "23:00" },
    availability: [
      {
        date: "2025-05-17",
        slots: [
          { time: "08:00-10:00", available: false },
          { time: "10:00-12:00", available: true },
          { time: "12:00-14:00", available: true },
          { time: "14:00-16:00", available: true },
          { time: "16:00-18:00", available: false },
          { time: "18:00-20:00", available: true },
          { time: "20:00-22:00", available: true },
        ],
      },
    ],
    coordinates: { lat: 40.7128, lng: -74.006 },
    imageUrl:
      "https://25live.collegenet.com/25live/data/washington/run/image?image_id=1035",
  },
  {
    id: "CP-324B",
    name: "CP-324B",
    building: "Cherry Parks",
    capacity: 8,
    features: [
      "whiteboard",
      "large screen",
      "power outlets",
      "conference phone",
    ],
    hours: { open: "07:00", close: "22:00" },
    availability: [
      {
        date: "2025-05-17",
        slots: [
          { time: "08:00-10:00", available: true },
          { time: "10:00-12:00", available: false },
          { time: "12:00-14:00", available: false },
          { time: "14:00-16:00", available: true },
          { time: "16:00-18:00", available: true },
          { time: "18:00-20:00", available: true },
          { time: "20:00-22:00", available: true },
        ],
      },
    ],
    coordinates: { lat: 40.7138, lng: -74.008 },
    imageUrl:
      "https://25live.collegenet.com/25live/data/washington/run/image?image_id=1035",
  },
  {
    id: "CP-324C",
    name: "CP-324C",
    building: "Student Union",
    capacity: 20,
    features: [
      "comfortable seating",
      "natural light",
      "power outlets",
      "coffee shop nearby",
    ],
    hours: { open: "06:00", close: "00:00" },
    availability: [
      {
        date: "2025-05-17",
        slots: [
          { time: "08:00-10:00", available: true },
          { time: "10:00-12:00", available: true },
          { time: "12:00-14:00", available: true },
          { time: "14:00-16:00", available: true },
          { time: "16:00-18:00", available: true },
          { time: "18:00-20:00", available: true },
          { time: "20:00-22:00", available: true },
        ],
      },
    ],
    coordinates: { lat: 40.712, lng: -74.005 },
    imageUrl:
      "https://25live.collegenet.com/25live/data/washington/run/image?image_id=41",
  },
  {
    id: "MDS-302",
    name: "MDS-302",
    building: "Engineering Building",
    capacity: 2,
    features: ["desk", "ergonomic chairs", "power outlets", "soundproofing"],
    hours: { open: "08:00", close: "23:00" },
    availability: [
      {
        date: "2025-05-17",
        slots: [
          { time: "08:00-10:00", available: false },
          { time: "10:00-12:00", available: false },
          { time: "12:00-14:00", available: true },
          { time: "14:00-16:00", available: true },
          { time: "16:00-18:00", available: false },
          { time: "18:00-20:00", available: false },
          { time: "20:00-22:00", available: true },
        ],
      },
    ],
    coordinates: { lat: 40.7145, lng: -74.004 },
    imageUrl:
      "https://25live.collegenet.com/25live/data/washington/run/image?image_id=41",
  },
  {
    id: "lib-commons",
    name: "Library Commons",
    building: "Main Library",
    capacity: 50,
    features: ["group tables", "power outlets", "printers", "reference desk"],
    hours: { open: "07:00", close: "01:00" },
    availability: [
      {
        date: "2025-05-17",
        slots: [
          { time: "08:00-10:00", available: true },
          { time: "10:00-12:00", available: true },
          { time: "12:00-14:00", available: true },
          { time: "14:00-16:00", available: true },
          { time: "16:00-18:00", available: true },
          { time: "18:00-20:00", available: true },
          { time: "20:00-22:00", available: true },
        ],
      },
    ],
    coordinates: { lat: 40.7128, lng: -74.0065 },
    imageUrl:
      "https://25live.collegenet.com/25live/data/washington/run/image?image_id=988",
  },
];
