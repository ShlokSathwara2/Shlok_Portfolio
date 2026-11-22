export function ParkBackdrop() {
  return (
    <div className="park-backdrop" aria-hidden>
      {/* Volumetric cyber aurora streamer */}
      <div className="park-aurora-streamer" />

      {/* Layered cinematic city skyline */}
      <div className="park-skyline park-skyline-distant" />
      <div className="park-skyline park-skyline-mid" />
      <div className="park-city" />

      {/* Pulsing cyber skyscraper beacons */}
      <div className="park-beacons">
        <span className="park-beacon-dot" style={{ top: "42%", left: "15%", animationDelay: "0.2s" }} />
        <span className="park-beacon-dot" style={{ top: "36%", left: "28%", animationDelay: "1.4s" }} />
        <span className="park-beacon-dot" style={{ top: "48%", left: "52%", animationDelay: "0.8s" }} />
        <span className="park-beacon-dot" style={{ top: "38%", left: "68%", animationDelay: "2.1s" }} />
        <span className="park-beacon-dot" style={{ top: "44%", left: "84%", animationDelay: "1.0s" }} />
      </div>

      {/* Horizon atmospheric mist */}
      <div className="park-horizon-glow" />
    </div>
  );
}
