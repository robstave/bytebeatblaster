import "./hud.css";

/** Owns the basic overlay HUD shell. */
export class HUDManager {
  public mount(): void {
    const root = document.createElement("div");
    root.id = "hud-root";
    root.innerHTML = `
      <div class="hud-top">
        <div>Score: 0</div>
        <div>Best: 0</div>
        <div>Health: 100</div>
      </div>
      <div class="hud-center">
        <div class="crosshair">+</div>
        <div class="state-text">Click to start later</div>
      </div>
    `;
    document.body.appendChild(root);
  }
}
