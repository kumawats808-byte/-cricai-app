"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CloudSun,
  Target,
  TrendingUp,
  CalendarDays,
  Clock,
} from "lucide-react";

type Data = {
  match: any;
  teams: any[];
  innings: any[];
  balls: any[];
  odds: any[];
  fancy: any[];
  ai: any[];
  insight: any;
};

function getState(m: any, insight: any) {
  return insight?.state || m?.status || "Upcoming";
}

function Countdown({ startTime }: { startTime?: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!startTime) return null;

  const target = new Date(startTime).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return (
      <div className="subtle" style={{ marginTop: 8 }}>
        Match starting / live
      </div>
    );
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return (
    <div
      className="panel"
      style={{
        marginTop: 18,
        textAlign: "center",
        padding: 18,
      }}
    >
      <div className="subtle">Match starts in</div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          marginTop: 6,
          letterSpacing: 1,
        }}
      >
        {days > 0 && `${days}d `}
        {String(hours).padStart(2, "0")}:
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </div>
    </div>
  );
}

export default function MatchPage({
  params,
}: {
  params: { id: string };
}) {
  const [d, setD] = useState<Data | null>(null);
  const [e, setE] = useState("");

  useEffect(() => {
    let live = true;

    const load = async () => {
      try {
        const r = await fetch(`/api/match/${params.id}`, {
          cache: "no-store",
        });

        const x = await r.json();

        if (!r.ok) {
          throw new Error(x.error || "Unable to load");
        }

        if (live) setD(x);
      } catch (x: any) {
        if (live) setE(x.message || "Unable to load match");
      }
    };

    load();

    const t = setInterval(load, 10000);

    return () => {
      live = false;
      clearInterval(t);
    };
  }, [params.id]);

  if (e) {
    return (
      <div className="container">
        <Link href="/" className="back">
          ← Back
        </Link>
        <div className="empty">{e}</div>
      </div>
    );
  }

  if (!d) {
    return (
      <div className="container">
        <div className="empty">Loading Match Centre…</div>
      </div>
    );
  }

  const m = d.match;
  const teams = d.teams || [];
  const state = getState(m, d.insight);
  const isUpcoming = state === "Upcoming";
  const isLive = state === "Live";

  const teamA = teams[0]?.name || "Team A";
  const teamB = teams[1]?.name || "Team B";

  const formattedDate = m.start_time
    ? new Date(m.start_time).toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date unavailable";

  const formattedTime = m.start_time
    ? new Date(m.start_time).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <main className="shell">
      <header className="topbar">
        <div className="container" style={{ padding: "0" }}>
          <Link href="/" className="back">
            <ArrowLeft
              size={18}
              style={{ verticalAlign: "-4px" }}
            />{" "}
            Back to CricAI
          </Link>
        </div>
      </header>

      <div className="container">
        {/* MATCH HERO */}
        <section className="hero">
          <div
            className="subtle"
            style={{
              color: "#a5b4fc",
              fontWeight: 700,
            }}
          >
            {m.format || "MATCH"} · {state}
          </div>

          <h1>
            {teamA}{" "}
            <span style={{ opacity: 0.5 }}>vs</span>{" "}
            {teamB}
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 12,
            }}
          >
            <div className="subtle">
              <CalendarDays
                size={16}
                style={{ verticalAlign: "-3px" }}
              />{" "}
              {formattedDate}
            </div>

            <div className="subtle">
              <Clock
                size={16}
                style={{ verticalAlign: "-3px" }}
              />{" "}
              {formattedTime}
            </div>
          </div>

          <p>
            {m.venue ||
              m.venue_name ||
              "Venue information unavailable"}
          </p>

          {isUpcoming && (
            <Countdown startTime={m.start_time} />
          )}
        </section>

        {/* PRE-MATCH */}
        {isUpcoming && (
          <section className="section">
            <div className="sectionhead">
              <h2>Pre-Match Intelligence</h2>
              <Bot size={18} />
            </div>

            <div className="grid2">
              <Panel
                icon={<TrendingUp />}
                title="Match Status"
                value="Upcoming"
              />

              <Panel
                icon={<CalendarDays />}
                title="Format"
                value={m.format || "Cricket"}
              />
            </div>

            <div
              className="panel"
              style={{ marginTop: 14 }}
            >
              <div className="subtle">
                CricAI will automatically switch to live
                intelligence when match data begins arriving.
              </div>

              <div
                style={{
                  fontWeight: 750,
                  marginTop: 8,
                }}
              >
                Live score, momentum, ball-by-ball,
                odds and AI analysis will appear here
                during the match.
              </div>
            </div>
          </section>
        )}

        {/* LIVE INTELLIGENCE */}
        <section className="section">
          <div className="grid2">
            <Panel
              icon={<TrendingUp />}
              title="AI Momentum"
              value={
                d.ai?.[0]?.momentum_score != null
                  ? `${d.ai[0].momentum_score}/100`
                  : isLive
                    ? "Awaiting live data"
                    : "Available during live play"
              }
            />

            <Panel
              icon={<CloudSun />}
              title="Pitch & Conditions"
              value={
                d.ai?.[0]?.pitch_notes
                  ? JSON.stringify(
                      d.ai[0].pitch_notes
                    )
                  : "AI report will appear when analysis is generated."
              }
            />
          </div>
        </section>

        {/* SCORECARD */}
        <section className="section">
          <div className="sectionhead">
            <h2>Scorecard</h2>
          </div>

          <div className="cards">
            {d.innings?.length ? (
              d.innings.map((i: any) => (
                <div className="match" key={i.id}>
                  <div className="row">
                    <b>
                      Innings {i.innings_number}
                    </b>

                    <b>
                      {i.runs}/{i.wickets || 0}
                    </b>
                  </div>

                  <div className="meta">
                    {i.overs} overs · RR{" "}
                    {i.run_rate || "—"}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">
                {isUpcoming
                  ? "Scorecard will appear when the match begins."
                  : "Ball-by-ball and innings data will appear once the live sync receives deliveries."}
              </div>
            )}
          </div>
        </section>

        {/* LIVE ODDS */}
        <section className="section">
          <div className="sectionhead">
            <h2>Live Odds</h2>
            <Target size={18} />
          </div>

          {d.odds?.length ? (
            <div className="odds">
              {d.odds.slice(0, 12).map((o: any) => (
                <div className="odd" key={o.id}>
                  <span>{o.selection}</span>
                  <b>{o.back_odds ?? "—"}</b>
                  <span className="subtle">
                    Back · {o.source || "market"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              {isUpcoming
                ? "Odds will appear when the provider feed becomes available."
                : "Odds snapshots will appear when the provider feed is available."}
            </div>
          )}
        </section>

        {/* FANCY */}
        <section className="section">
          <div className="sectionhead">
            <h2>Over Fancy</h2>
            <Target size={18} />
          </div>

          {d.fancy?.length ? (
            <div className="fancy">
              <div>
                <b>Market</b>
              </div>

              <div>
                <b>Over</b>
              </div>

              <div>
                <b>Line</b>
              </div>

              {d.fancy.slice(0, 20).map((f: any) => (
                <>
                  <div>
                    {f.market_name ||
                      f.market_type}
                  </div>

                  <div>
                    {f.over_value ?? "—"}
                  </div>

                  <div>
                    {f.line ?? "—"}
                  </div>
                </>
              ))}
            </div>
          ) : (
            <div className="empty">
              {isUpcoming
                ? "Fancy markets will appear when the live provider feed is available."
                : "Fancy markets will appear here when the live feed supplies them."}
            </div>
          )}
        </section>

        {/* AI ANALYSIS */}
        <section className="section">
          <div className="sectionhead">
            <h2>AI Analysis</h2>
            <Bot size={18} />
          </div>

          {d.ai?.length ? (
            d.ai.map((a: any) => (
              <div className="panel" key={a.id}>
                <b>
                  {a.title || a.analysis_type}
                </b>

                <p>{a.summary}</p>
              </div>
            ))
          ) : (
            <div className="empty">
              {isUpcoming
                ? "Pre-match AI analysis will appear when analysis is generated."
                : "AI analysis will populate after match data is available."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Panel({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="panel">
      {icon}

      <div className="subtle">
        {title}
      </div>

      <div
        style={{
          fontWeight: 750,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}
