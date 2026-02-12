import React, { useEffect, useState } from 'react';

/**
 * AlumniDashboard
 * - Minimal, production-minded React component (Vite-ready)
 * - Uses Tailwind CSS classes for layout
 * - Fetches several backend endpoints (expects JWT stored in localStorage under `token`)
 *
 * Expected server endpoints (examples):
 * - GET /api/auth/me                      -> returns current user
 * - GET /api/mentorship/incoming         -> mentorship requests to this alumni
 * - GET /api/jobs?postedBy=me             -> jobs posted by this alumni
 * - GET /api/events?organizer=me          -> events organized by this alumni
 * - GET /api/users/connections            -> connections list
 *
 * The component is intentionally simple and focused on layout and data flow.
 */
export default function AlumniDashboard({ useMock = false }) {
  const [me, setMe] = useState(null);
  const [mentorships, setMentorships] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // helper: attach JWT if available
  function authHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Mock data to allow the component to render without a backend.
  const MOCK = {
    me: { _id: 'mock-alumni-1', name: 'Alice Alumni', role: 'alumni', email: 'alumni@example.com' },
    mentorships: [
      { _id: 'm1', studentSnapshot: { name: 'Student One' }, tags: ['data science'], createdAt: new Date().toISOString() },
      { _id: 'm2', studentSnapshot: { name: 'Student Two' }, tags: ['python'], createdAt: new Date().toISOString() }
    ],
    jobs: [
      { _id: 'j1', title: 'Data Scientist', company: 'Acme', location: 'Remote', skillsRequired: ['python','ml'] },
      { _id: 'j2', title: 'ML Engineer', company: 'BetaCorp', location: 'NYC', skillsRequired: ['ml','cloud'] }
    ],
    events: [
      { _id: 'e1', title: 'Alumni Meetup', startAt: new Date().toISOString(), attendees: ['u1','u2'] }
    ],
    connections: [{ _id: 'c1' }, { _id: 'c2' }, { _id: 'c3' }]
  };

  // Fetch matches for a given studentId (prompts user if none provided)
  async function fetchMatchesForStudent(studentId) {
    if (useMock || !localStorage.getItem('token')) {
      setMatches([
        { _id: 'm-alice', name: 'Alice Alumni', score: 58 },
        { _id: 'm-bob', name: 'Bob Mentor', score: 13 },
      ]);
      return;
    }

    const id = studentId || window.prompt('Enter student id to match (or leave blank)');
    if (!id) return;
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ studentId: id, limit: 10 }),
      });
      if (!res.ok) throw new Error('Failed to fetch matches');
      const json = await res.json();
      setMatches(json.results || json || []);
    } catch (err) {
      setError(err.message || 'Match fetch failed');
    }
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (useMock || !localStorage.getItem('token')) {
          // Use mock data to render UI immediately without backend
          if (!mounted) return;
          setMe({ user: MOCK.me });
          setMentorships(MOCK.mentorships);
          setJobs(MOCK.jobs);
          setEvents(MOCK.events);
          setConnections(MOCK.connections);
        } else {
          const [meRes, mentorshipRes, jobsRes, eventsRes, connsRes] = await Promise.all([
            fetch('/api/auth/me', { headers: authHeaders() }),
            fetch('/api/mentorship/incoming', { headers: authHeaders() }),
            fetch('/api/jobs?postedBy=me', { headers: authHeaders() }),
            fetch('/api/events?organizer=me', { headers: authHeaders() }),
            fetch('/api/users/connections', { headers: authHeaders() }),
          ]);

          // Basic status handling; each endpoint may return different payload formats
          if (!meRes.ok) throw new Error('Failed to fetch user');
          const meJson = await meRes.json();
          const mentorshipJson = mentorshipRes.ok ? await mentorshipRes.json() : [];
          const jobsJson = jobsRes.ok ? await jobsRes.json() : [];
          const eventsJson = eventsRes.ok ? await eventsRes.json() : [];
          const connsJson = connsRes.ok ? await connsRes.json() : [];

          if (!mounted) return;
          setMe(meJson);
          // If the backend returns objects with `results` keys, handle that conservatively
          setMentorships(mentorshipJson.results || mentorshipJson || []);
          setJobs(jobsJson.results || jobsJson || []);
          setEvents(eventsJson.results || eventsJson || []);
          setConnections(connsJson.results || connsJson || []);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  // Ensure this dashboard is shown only to Alumni users (mock or real)
  const role = me?.user?.role || me?.role;
  if (role && role.toLowerCase() !== 'alumni') {
    return <div className="p-6">This dashboard is for Alumni users only.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {me?.user?.name || me?.name || 'Alumni'}</h1>
          <p className="text-sm text-gray-500">Alumni Dashboard — quick overview</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Connections</div>
          <div className="text-xl font-medium">{connections.length}</div>
        </div>
      </header>

      {/* Stats Cards: using explicit grid-cols-3 and Tailwind visual classes */}
      <section className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-medium">Mentorship Requests</h2>
          <div className="mt-2 text-3xl font-bold">{mentorships.length}</div>
          <div className="mt-4 text-sm text-gray-600">Recent requests</div>
          <ul className="mt-2 space-y-2">
            {mentorships.slice(0, 5).map((m) => (
              <li key={m._id} className="flex items-start">
                <div className="flex-1">
                  <div className="font-medium">{m.studentSnapshot?.name || m.fromName || 'Student'}</div>
                  <div className="text-xs text-gray-500">{m.tags?.join(', ')}</div>
                </div>
                <div className="text-sm text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</div>
              </li>
            ))}
            {mentorships.length === 0 && <li className="text-sm text-gray-500">No requests</li>}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-medium">Jobs Posted</h2>
          <div className="mt-2 text-3xl font-bold">{jobs.length}</div>
          <div className="mt-4 text-sm text-gray-600">Latest openings</div>
          <ul className="mt-2 space-y-2">
            {jobs.slice(0, 5).map((j) => (
              <li key={j._id} className="flex items-start">
                <div className="flex-1">
                  <div className="font-medium">{j.title}</div>
                  <div className="text-xs text-gray-500">{j.company} • {j.location || 'Remote'}</div>
                </div>
                <div className="text-sm text-gray-400">{j.skillsRequired?.slice(0,2).join(', ')}</div>
              </li>
            ))}
            {jobs.length === 0 && <li className="text-sm text-gray-500">No jobs</li>}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-medium">Upcoming Events</h2>
          <div className="mt-2 text-3xl font-bold">{events.length}</div>
          <div className="mt-4 text-sm text-gray-600">Your events</div>
          <ul className="mt-2 space-y-2">
            {events.slice(0,5).map(ev => (
              <li key={ev._id} className="flex items-start">
                <div className="flex-1">
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-xs text-gray-500">{new Date(ev.startAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-400">{ev.attendees?.length || 0}</div>
              </li>
            ))}
            {events.length === 0 && <li className="text-sm text-gray-500">No events</li>}
          </ul>
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-medium">Quick actions</h2>
        <div className="mt-3 flex gap-3">
          {/* Use explicit Tailwind visual classes as requested */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Post a Job</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Create Event</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Open Mentorship Inbox</button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => fetchMatchesForStudent()}
          >
            Run Matchmaker
          </button>
        </div>
      </section>

      {/* Match results */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-medium">Match Results</h2>
        <div className="mt-2 text-sm text-gray-600">Suggested matches (use Run Matchmaker)</div>
        <ul className="mt-2 space-y-2">
          {matches.map((m) => (
            <li key={m._id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{m.name || m.displayName || m._id}</div>
                <div className="text-xs text-gray-500">Score: {m.score ?? '-'}</div>
              </div>
              <div>
                <button className="px-3 py-1 bg-gray-100 rounded text-sm">View</button>
              </div>
            </li>
          ))}
          {matches.length === 0 && <li className="text-sm text-gray-500">No matches yet</li>}
        </ul>
      </section>
    </div>
  );
}
