"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  BarChart3,
  Bot,
  CalendarDays,
  ChevronRight,
  Clock3,
  Home,
  RefreshCw,
  Trophy,
} from "lucide-react";
import Link from "next/link";

type Match = {
  id: string;
  name?: string;
  status?: string;
  state?: string;
  venue?: string;
  venue_city?: string;
  venue_name?: string;
  teams?: any[];
  score?: any[];
  start_time?: string;
  format?: string;
  matchStarted?: boolean;
  matchEnded?: boolean;
  series?: any;
  squads?: Record<string, any[]>;
  squad_count?: number;
};

const tabs = [
  ["home", "Home", Home],
  ["live", "Live", Activity],
  ["series", "Series", Trophy],
  ["ai", "AI", Bot],
] as const;

function normalizedState(m: Match) {
  const state = String(m.state || "").toLowerCase();
  const status = String(m.status || "").toLowerCase();

  if (
    state === "live" ||
    status.includes("live") ||
    status.includes("inplay") ||
    status.includes("in play") ||
    status.includes("started")
  ) {
    return "Live";
  }

  if (
    state === "recent" ||
    status.includes("finished") ||
    status.includes("completed") ||
    status.includes("abandoned") ||
    status.includes("result")
  ) {
    return "Recent";
  }

  if (m.start_time) {
    const start = new Date(m.start_time).getTime();

    if (!Number.isNaN(start) && start > Date.now()) {
      return "Upcoming";
    }
  }

  if (state === "upcoming") {
    return "Upcoming";
  }

  return state
    ? state.charAt(0).toUpperCase() +
        state.slice(1)
    : "Upcoming";
}

export default function HomePage() {
  const [matches, setMatches] =
    useState<Match[]>([]);

  const [tab, setTab] =
    useState("home");

  const [loading, setLoading] =
    useState(true);

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [asking, setAsking] =
    useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/matches",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load matches"
        );
      }

      setMatches(
        Array.isArray(data.matches)
          ? data.matches
          : []
      );
    } catch (error) {
      console.error(
        "CricAI matches error:",
        error
      );

      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const timer = setInterval(
      load,
      15000
    );

    return () =>
      clearInterval(timer);
  }, []);

  const live = useMemo(
    () =>
      matches.filter(
        (match) =>
          normalizedState(match) ===
          "Live"
      ),
    [matches]
  );

  const upcoming = useMemo(
    () =>
      matches
        .filter(
          (match) =>
            normalizedState(match) ===
            "Upcoming"
        )
        .sort((a, b) => {
          const aTime = a.start_time
            ? new Date(
                a.start_time
              ).getTime()
            : Infinity;

          const bTime = b.start_time
            ? new Date(
                b.start_time
              ).getTime()
            : Infinity;

          return aTime - bTime;
        }),
    [matches]
  );

  async function ask() {
    if (!question.trim()) return;

    setAsking(true);

    try {
      const response =
        await fetch(
          "/api/chat",
          {
            method: "POST",
            headers: {
              "content-type":
                "application/json",
            },
            body: JSON.stringify({
              message:
                question,
            }),
          }
        );

      const data =
        await response.json();

      setAnswer(
        data.answer ||
          data.error ||
          "No answer"
      );
    } catch {
      setAnswer(
        "Unable to contact CricAI right now."
      );
    } finally {
      setAsking(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div
          className="container"
          style={{ padding: "0" }}
        >
          <div className="brand">
            <span className="brandmark">
              🏏
            </span>

            CricAI{" "}
            <span className="subtle">
              LIVE INTELLIGENCE
            </span>
          </div>
        </div>
      </header>

      <div className="container">
        {/* HERO */}
        <section className="hero">
          <div
            className="subtle"
            style={{
              color: "#a5b4fc",
            }}
          >
            YOUR CRICKET CENTRE
          </div>

          <h1>
            Every ball. Smarter.
          </h1>

          <p>
            Live scores, ball-by-ball,
            odds, fancy and AI-powered
            match analysis.
          </p>

          <div className="chips">
            <button
              className={`chip ${
                tab === "home"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setTab("home")
              }
            >
              All
            </button>

            <button
              className={`chip ${
                tab === "live"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setTab("live")
              }
            >
              🔴 Live{" "}
              {live.length
                ? live.length
                : ""}
            </button>

            <button
              className="chip"
              onClick={load}
            >
              <RefreshCw
                size={14}
                style={{
                  verticalAlign:
                    "-2px",
                }}
              />{" "}
              Refresh
            </button>
          </div>
        </section>

        {/* AI */}
        {tab === "ai" ? (
          <section className="section">
            <div className="sectionhead">
              <h2>
                Ask CricAI
              </h2>

              <Bot size={19} />
            </div>

            <div className="panel">
              <p className="subtle">
                Ask about current
                matches, scores,
                team momentum,
                player information
                or match trends.
              </p>

              <div className="chat">
                <input
                  value={question}
                  onChange={(e) =>
                    setQuestion(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      ask();
                    }
                  }}
                  placeholder="e.g. Who has momentum right now?"
                />

                <button
                  onClick={ask}
                  disabled={asking}
                >
                  {asking
                    ? "…"
                    : "Ask"}
                </button>
              </div>

              {answer && (
                <div
                  className="panel"
                  style={{
                    marginTop: 12,
                    background:
                      "transparent",
                  }}
                >
                  {answer}
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* LIVE */}
            <section className="section">
              <div className="sectionhead">
                <h2>
                  {tab === "live"
                    ? "Live matches"
                    : "Live now"}
                </h2>

                <span className="subtle">
                  {live.length}{" "}
                  matches
                </span>
              </div>

              <div className="cards">
                {loading ? (
                  <div className="empty">
                    Loading live
                    cricket…
                  </div>
                ) : live.length ? (
                  live.map((match) => (
                    <MatchCard
                      key={match.id}
                      m={match}
                    />
                  ))
                ) : (
                  <div className="empty">
                    <Activity
                      size={28}
                    />
                    <br />
                    No live matches
                    right now.
                  </div>
                )}
              </div>
            </section>

            {/* UPCOMING */}
            {tab !== "live" && (
              <section className="section">
                <div className="sectionhead">
                  <div>
                    <h2>
                      Upcoming
                    </h2>

                    <div className="subtle">
                      Next scheduled
                      matches
                    </div>
                  </div>

                  <span className="subtle">
                    {upcoming.length}{" "}
                    matches
                  </span>
                </div>

                <div className="cards">
                  {loading ? (
                    <div className="empty">
                      Loading upcoming
                      fixtures…
                    </div>
                  ) : upcoming.length ? (
                    upcoming
                      .slice(0, 8)
                      .map(
                        (match) => (
                          <MatchCard
                            key={
                              match.id
                            }
                            m={match}
                          />
                        )
                      )
                  ) : (
                    <div className="empty">
                      <CalendarDays
                        size={28}
                      />
                      <br />
                      No upcoming
                      matches found.
                      <div
                        className="subtle"
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Pull down /
                        refresh to
                        check for new
                        fixtures.
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* APP FEATURES */}
            {tab !== "live" && (
              <section className="section">
                <div className="grid2">
                  <div className="panel">
                    <BarChart3
                      size={20}
                    />

                    <div className="metric">
                      Live Odds
                    </div>

                    <div className="subtle">
                      Match odds and
                      market snapshots
                      when available.
                    </div>
                  </div>

                  <div className="panel">
                    <Bot size={20} />

                    <div className="metric">
                      AI Match IQ
                    </div>

                    <div className="subtle">
                      Momentum, wickets,
                      pitch and player
                      insights.
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* BOTTOM NAV */}
      <nav className="bottom">
        <div className="nav">
          {tabs.map(
            ([
              id,
              label,
              Icon,
            ]) => (
              <button
                key={id}
                className={
                  tab === id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setTab(id)
                }
              >
                <Icon size={18} />
                <br />
                {label}
              </button>
            )
          )}
        </div>
      </nav>
    </main>
  );
}

function MatchCard({
  m,
}: {
  m: Match;
}) {
  const state =
    normalizedState(m);

  const isLive =
    state === "Live";

  const teams = Array.isArray(
    m.teams
  )
    ? m.teams
    : [];

  const teamNames = teams.map(
    (team: any) =>
      typeof team === "string"
        ? team
        : team?.name ||
          "Team"
  );

  const venue =
    m.venue ||
    m.venue_name ||
    "Venue TBC";

  const venueCity =
    m.venue_city || "";

  const series =
    typeof m.series === "string"
      ? m.series
      : m.series?.name || "";

  return (
    <Link
      href={`/match/${m.id}`}
      className="match"
    >
      <div className="matchtop">
        <div>
          <b>
            {m.format ||
              "Cricket"}
          </b>

          {series && (
            <div className="subtle">
              🏆 {series}
            </div>
          )}

          <div className="subtle">
            📍 {venue}
            {venueCity
              ? ` · ${venueCity}`
              : ""}
          </div>
        </div>

        <span
          className={`status ${
            isLive
              ? "live"
              : ""
          }`}
        >
          {isLive
            ? "● LIVE"
            : state}
        </span>
      </div>

      <div className="teams">
        {(teamNames.length
          ? teamNames
          : [
              "Team A",
              "Team B",
            ]
        )
          .slice(0, 2)
          .map(
            (
              team,
              index
            ) => (
              <div
                className="teamrow"
                key={`${team}-${index}`}
              >
                <span className="teamname">
                  {team}
                </span>

                <span className="score">
                  {m.score?.[
                    index
                  ]?.runs !=
                  null
                    ? `${m.score[index].runs}/${m.score[index].wickets || 0}`
                    : "—"}
                </span>
              </div>
            )
          )}
      </div>

      <div className="meta">
        <span>
          <Clock3
            size={12}
            style={{
              verticalAlign:
                "-2px",
            }}
          />{" "}
          {m.start_time
            ? new Date(
                m.start_time
              ).toLocaleString()
            : "Time TBC"}
        </span>

        <span>
          Match Centre{" "}
          <ChevronRight
            size={13}
            style={{
              verticalAlign:
                "-2px",
            }}
          />
        </span>
      </div>
    </Link>
  );
}
