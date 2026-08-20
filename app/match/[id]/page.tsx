"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  CloudSun,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";

type Data = {
  match: any;
  teams: any[];
  squads?: Record<string, any[]>;
  innings: any[];
  balls: any[];
  odds: any[];
  fancy: any[];
  ai: any[];
  insight: any;
};

function getState(match: any, insight: any) {
  const state = insight?.state || match?.status || "Upcoming";
  const value = String(state).toLowerCase();

  if (
    value.includes("live") ||
    value.includes("inplay") ||
    value.includes("in play") ||
    value.includes("started")
  ) {
    return "Live";
  }

  if (
    value.includes("finished") ||
    value.includes("complete") ||
    value.includes("result") ||
    value.includes("abandoned") ||
    value.includes("draw") ||
    value.includes("tied")
  ) {
    return "Recent";
  }

  return "Upcoming";
}

function Countdown({ startTime }: { startTime?: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!startTime) return null;

  const target = new Date(startTime).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return (
      <div className="panel" style={{ marginTop: 18, textAlign: "center" }}>
        <div className="subtle">Match starting / live</div>
      </div>
    );
  }

  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);

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

function PlayerRow({ player }: { player: any }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 0",
        borderBottom: "1px solid rgba(255,255,255,.08)",
      }}
    >
      {player.photo_url ? (
        <img
          src={player.photo_url}
          alt={player.name || "Player"}
          width={38}
          height={38}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            objectFit: "cover",
            background: "rgba(255,255,255,.06)",
          }}
        />
      ) : (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(255,255,255,.08)",
            flexShrink: 0,
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {player.name || "Unknown player"}
        </div>

        <div className="subtle">
          {player.role || "Player"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 5,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {player.is_captain && (
          <span className="subtle">C</span>
        )}

        {player.is_wicketkeeper && (
          <span className="subtle">WK</span>
        )}

        {player.is_playing_xi && (
          <span className="subtle">XI</span>
        )}
      </div>
    </div>
  );
}

function SquadCard({
  team,
  players,
}: {
  team: any;
  players: any[];
}) {
  return (
    <div className="panel">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        {team?.logo_url ? (
          <img
            src={team.logo_url}
            alt={team.name || "Team"}
            width={42}
            height={42}
            style={{
              width: 42,
              height: 42,
              objectFit: "contain",
            }}
          />
        ) : (
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "rgba(255,255,255,.08)",
            }}
          />
        )}

        <div>
          <div style={{ fontWeight: 800 }}>
            {team?.name || "Team"}
          </div>

          <div className="subtle">
            {players.length
              ? `${players.length} players`
              : "Squad not available yet"}
          </div>
        </div>
      </div>

      {players.length > 0 ? (
        <div>
          {players.map((player: any) => (
            <PlayerRow
              key={`${player.id}-${player.name}`}
              player={player}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          Official squad information will appear when
          supplied by the provider.
        </div>
      )}
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
        const response = await fetch(
          `/api/match/${params.id}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load match"
          );
        }

        if (live) {
          setD(data);
          setE("");
        }
      } catch (error: any) {
        if (live) {
          setE(
            error?.message ||
              "Unable to load match"
          );
        }
      }
    };

    load();

    const timer = setInterval(load, 10000);

    return () => {
      live = false;
      clearInterval(timer);
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
        <div className="empty">
          Loading Match Centre…
        </div>
      </div>
    );
  }

  const m = d.match;
  const teams = d.teams || [];
  const squads = d.squads || {};

  const state = getState(m, d.insight);

  const isUpcoming = state === "Upcoming";
  const isLive = state === "Live";

  const teamA = teams[0] || {
    id: "team-a",
    name: "Team A",
  };

  const teamB = teams[1] || {
    id: "team-b",
    name: "Team B",
  };

  const teamAPlayers =
    squads[String(teamA.id)] || [];

  const teamBPlayers =
    squads[String(teamB.id)] || [];

  const formattedDate = m.start_time
    ? new Date(m.start_time).toLocaleDateString(
        undefined,
        {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "Date unavailable";

  const formattedTime = m.start_time
    ? new Date(m.start_time).toLocaleTimeString(
        undefined,
        {
          hour: "numeric",
          minute: "2-digit",
        }
      )
    : "";

  const seriesName =
    m.series?.name ||
    d.insight?.series ||
    "";

  const venueName =
    m.venue ||
    m.venue_name ||
    m.venue_details?.name ||
    "Venue information unavailable";

  const venueCity =
    m.venue_city ||
    m.venue_details?.city ||
    "";

  return (
    <main className="shell">
      {/* TOP BAR */}
      <header className="topbar">
        <div
          className="container"
          style={{ padding: "0" }}
        >
          <Link
            href="/"
            className="back"
          >
            <ArrowLeft
              size={18}
              style={{
                verticalAlign: "-4px",
              }}
            />{" "}
            Back to CricAI
          </Link>
        </div>
      </header>

      <div className="container">
        {/* MATCH HEADER */}
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
            {teamA.name}{" "}
            <span style={{ opacity: 0.5 }}>
              vs
            </span>{" "}
            {teamB.name}
          </h1>

          {seriesName && (
            <div
              className="subtle"
              style={{
                marginTop: 8,
                fontWeight: 650,
              }}
            >
              🏆 {seriesName}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 14,
            }}
          >
            <div className="subtle">
              <CalendarDays
                size={16}
                style={{
                  verticalAlign: "-3px",
                }}
              />{" "}
              {formattedDate}
            </div>

            <div className="subtle">
              <Clock
                size={16}
                style={{
                  verticalAlign: "-3px",
                }}
              />{" "}
              {formattedTime}
            </div>
          </div>

          <p>
            📍 {venueName}
            {venueCity
              ? ` · ${venueCity}`
              : ""}
          </p>

          {isUpcoming && (
            <Countdown
              startTime={m.start_time}
            />
          )}
        </section>

        {/* PRE-MATCH */}
        {isUpcoming && (
          <section className="section">
            <div className="sectionhead">
              <h2>
                Pre-Match Intelligence
              </h2>

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
                value={
                  m.format ||
                  "Cricket"
                }
              />
            </div>

            <div
              className="panel"
              style={{ marginTop: 14 }}
            >
              <div className="subtle">
                CricAI will automatically
                switch to live intelligence
                when match data begins
                arriving.
              </div>

              <div
                style={{
                  fontWeight: 750,
                  marginTop: 8,
                }}
              >
                Live score, momentum,
                ball-by-ball, odds and AI
                analysis will appear during
                the match.
              </div>
            </div>
          </section>
        )}

        {/* SQUADS */}
        <section className="section">
          <div className="sectionhead">
            <h2>Squads</h2>
          </div>

          <div className="grid2">
            <SquadCard
              team={teamA}
              players={teamAPlayers}
            />

            <SquadCard
              team={teamB}
              players={teamBPlayers}
            />
          </div>
        </section>

        {/* AI MOMENTUM + CONDITIONS */}
        <section className="section">
          <div className="grid2">
            <Panel
              icon={<TrendingUp />}
              title="AI Momentum"
              value={
                d.ai?.[0]
                  ?.momentum_score != null
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
                  ? typeof d.ai[0]
                      .pitch_notes ===
                    "string"
                    ? d.ai[0].pitch_notes
                    : JSON.stringify(
                        d.ai[0]
                          .pitch_notes
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
              d.innings.map(
                (inning: any) => (
                  <div
                    className="match"
                    key={inning.id}
                  >
                    <div className="row">
                      <b>
                        Innings{" "}
                        {
                          inning.innings_number
                        }
                      </b>

                      <b>
                        {inning.runs}/
                        {inning.wickets ||
                          0}
                      </b>
                    </div>

                    <div className="meta">
                      {inning.overs} overs ·
                      RR{" "}
                      {inning.run_rate ||
                        "—"}
                    </div>
                  </div>
                )
              )
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
              {d.odds
                .slice(0, 12)
                .map(
                  (odd: any) => (
                    <div
                      className="odd"
                      key={odd.id}
                    >
                      <span>
                        {odd.selection}
                      </span>

                      <b>
                        {odd.back_odds ??
                          "—"}
                      </b>

                      <span className="subtle">
                        Back ·{" "}
                        {odd.source ||
                          "market"}
                      </span>
                    </div>
                  )
                )}
            </div>
          ) : (
            <div className="empty">
              {isUpcoming
                ? "Odds will appear when the provider feed becomes available."
                : "Odds snapshots will appear when the provider feed is available."}
            </div>
          )}
        </section>

        {/* OVER FANCY */}
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

              {d.fancy
                .slice(0, 20)
                .map(
                  (
                    fancy: any,
                    index: number
                  ) => (
                    <div
                      key={
                        fancy.id ||
                        index
                      }
                      style={{
                        display:
                          "contents",
                      }}
                    >
                      <div>
                        {fancy.market_name ||
                          fancy.market_type}
                      </div>

                      <div>
                        {fancy.over_value ??
                          "—"}
                      </div>

                      <div>
                        {fancy.line ??
                          "—"}
                      </div>
                    </div>
                  )
                )}
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
            d.ai.map(
              (analysis: any) => (
                <div
                  className="panel"
                  key={analysis.id}
                  style={{
                    marginBottom: 12,
                  }}
                >
                  <b>
                    {analysis.title ||
                      analysis.analysis_type}
                  </b>

                  <p>
                    {analysis.summary}
                  </p>
                </div>
              )
            )
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
