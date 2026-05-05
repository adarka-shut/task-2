export const isLoggedIn = false;

export type Event = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  timezone: string;
  venue: string;
  online: boolean;
  capacity: number;
  going: number;
  cover: string;
  hostId: string;
  status: "draft" | "published";
  past: boolean;
};

export type Host = {
  id: string;
  name: string;
  logo: string;
  bio: string;
  email: string;
};

export const hosts: Host[] = [
  {
    id: "h1",
    name: "Code & Coffee",
    logo: "https://placehold.co/120x120?text=C%26C",
    bio: "A friendly community of developers meeting weekly to share ideas and code.",
    email: "hello@codeandcoffee.dev",
  },
  {
    id: "h2",
    name: "Urban Gardeners",
    logo: "https://placehold.co/120x120?text=UG",
    bio: "Bringing greenery to the city, one balcony at a time.",
    email: "team@urbangardeners.org",
  },
];

export const events: Event[] = [
  {
    id: "e1",
    title: "React Meetup: Server Components Deep Dive",
    description:
      "Join us for an evening exploring React Server Components — patterns, pitfalls, and real-world demos.",
    start: "2026-06-12T18:30",
    end: "2026-06-12T21:00",
    timezone: "Europe/Berlin",
    venue: "Tech Hub, Berlin",
    online: false,
    capacity: 80,
    going: 47,
    cover: "https://placehold.co/1200x600?text=React+Meetup",
    hostId: "h1",
    status: "published",
    past: false,
  },
  {
    id: "e2",
    title: "Spring Balcony Garden Workshop",
    description:
      "Hands-on workshop on growing herbs and vegetables in small urban spaces. Beginners welcome!",
    start: "2026-05-20T10:00",
    end: "2026-05-20T13:00",
    timezone: "Europe/Berlin",
    venue: "Community Garden, Kreuzberg",
    online: false,
    capacity: 25,
    going: 18,
    cover: "https://placehold.co/1200x600?text=Garden+Workshop",
    hostId: "h2",
    status: "published",
    past: false,
  },
  {
    id: "e3",
    title: "Online: Intro to TypeScript",
    description: "A beginner-friendly online session covering TypeScript fundamentals.",
    start: "2026-06-01T19:00",
    end: "2026-06-01T20:30",
    timezone: "UTC",
    venue: "",
    online: true,
    capacity: 200,
    going: 132,
    cover: "https://placehold.co/1200x600?text=TypeScript+101",
    hostId: "h1",
    status: "published",
    past: false,
  },
  {
    id: "e4",
    title: "Winter Hackathon 2025",
    description: "Our annual community hackathon — past event recap available.",
    start: "2025-12-05T09:00",
    end: "2025-12-06T18:00",
    timezone: "Europe/Berlin",
    venue: "Tech Hub, Berlin",
    online: false,
    capacity: 100,
    going: 92,
    cover: "https://placehold.co/1200x600?text=Hackathon",
    hostId: "h1",
    status: "published",
    past: true,
  },
  {
    id: "e5",
    title: "Composting 101",
    description: "Learn how to start composting at home with minimal setup.",
    start: "2025-11-10T11:00",
    end: "2025-11-10T13:00",
    timezone: "Europe/Berlin",
    venue: "Community Garden, Kreuzberg",
    online: false,
    capacity: 30,
    going: 28,
    cover: "https://placehold.co/1200x600?text=Composting",
    hostId: "h2",
    status: "published",
    past: true,
  },
  {
    id: "e6",
    title: "Design Systems Roundtable",
    description: "An open discussion about scaling design systems across teams.",
    start: "2026-07-08T17:00",
    end: "2026-07-08T19:00",
    timezone: "Europe/Berlin",
    venue: "",
    online: true,
    capacity: 150,
    going: 41,
    cover: "https://placehold.co/1200x600?text=Design+Systems",
    hostId: "h1",
    status: "published",
    past: false,
  },
];

export const tickets = [
  { id: "t1", code: "TICK-A1B2", eventId: "e1" },
  { id: "t2", code: "TICK-C3D4", eventId: "e3" },
];

export const getEvent = (id: string) => events.find((e) => e.id === id) ?? events[0];
export const getHost = (id: string) => hosts.find((h) => h.id === id) ?? hosts[0];
export const eventsByHost = (id: string) => events.filter((e) => e.hostId === id);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
