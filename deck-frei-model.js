(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./capture-physics.js'));
  } else {
    root.DeckMission = factory(root.CapturePhysics);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (physics) {
  'use strict';

  const passMs = 8000;
  const fallMs = 560;
  const retryMs = 2200;
  const epsilonMs = 0.0000001;
  const fork = 0.40;
  const catchAt = 0.83;
  // Distances are measured along a lane in fractions of a full pass.
  const netWidth = 0.185;
  const bodyRadius = 0.035;

  function create() {
    let phase = 'ready';
    let mirrored = false;
    let paused = false;
    let attempt = 0;
    let elapsed = 0;
    let retryElapsed = 0;
    let gate = 'right';
    let lane = null;
    let shot = null;
    let result = null;
    let feedback = null;

    function validLane(value) {
      return value === 'left' || value === 'right';
    }

    function beginPass() {
      phase = 'run';
      attempt += 1;
      elapsed = 0;
      retryElapsed = 0;
      lane = null;
      shot = null;
      result = null;
      feedback = null;
    }

    function start() {
      if (phase === 'ready') beginPass();
    }

    function replay() {
      if (phase !== 'won') return;
      mirrored = !mirrored;
      attempt = 0;
      gate = mirrored ? 'left' : 'right';
      beginPass();
    }

    function setGate(value) {
      if (phase === 'run' && !paused && lane === null && validLane(value)) gate = value;
    }

    function drop(value) {
      if (phase === 'run' && !paused && shot === null && validLane(value)) {
        shot = { lane: value, startMs: elapsed };
      }
    }

    function togglePause() {
      if (phase === 'run' || phase === 'retry') paused = !paused;
    }

    function position(ms) {
      return Math.min(ms / passMs, 1);
    }

    function projectedHit(startMs) {
      // Both the visual cue and the actual hit use the existing game's torso-coverage rule.
      return physics.crossing(
        { x: catchAt, y: 0 }, { x: catchAt, y: 1 },
        position(startMs), position(startMs + fallMs), 1, netWidth, bodyRadius
      );
    }

    function finishPass() {
      if (!shot) {
        result = 'miss';
        feedback = 'no-drop';
      } else if (lane !== null && shot.lane !== lane) {
        result = 'miss';
        feedback = 'wrong-lane';
      } else {
        const hit = projectedHit(shot.startMs);
        result = hit.kind;
        feedback = result === 'catch' ? 'caught' : hit.bodyX < catchAt ? 'early' : 'late';
      }
      phase = result === 'catch' ? 'won' : 'retry';
      retryElapsed = 0;
    }

    function step(ms) {
      if (!Number.isFinite(ms) || ms <= 0 || paused) return;
      let remaining = ms;
      while (remaining > 0 && (phase === 'run' || phase === 'retry')) {
        if (phase === 'retry') {
          const amount = Math.min(remaining, retryMs - retryElapsed);
          remaining -= amount;
          retryElapsed += amount;
          if (retryElapsed >= retryMs - epsilonMs) {
            beginPass();
            // No controls can arrive in the middle of this update. Skip unattended passes.
            const cycle = passMs + retryMs;
            const skipped = Math.floor(remaining / cycle);
            attempt += skipped;
            remaining %= cycle;
          }
        } else {
          const end = shot ? shot.startMs + fallMs : passMs;
          const amount = Math.min(remaining, end - elapsed);
          remaining -= amount;
          elapsed += amount;
          if (lane === null && elapsed >= fork * passMs - epsilonMs) lane = gate;
          if (elapsed >= end - epsilonMs) {
            elapsed = end;
            finishPass();
          }
        }
      }
    }

    function snapshot() {
      return {
        phase, paused, progress: position(elapsed), fork, catchAt, attempt, mirrored,
        approachingFrom: mirrored ? 'right' : 'left',
        gate, lane, result, feedback,
        armed: shot && { lane: shot.lane, progress: Math.min((elapsed - shot.startMs) / fallMs, 1) },
        inWindow: phase === 'run' && !paused && !shot && lane !== null && projectedHit(elapsed).kind === 'catch'
      };
    }

    return { get state() { return snapshot(); }, start, reset: replay, replay, setGate, drop, togglePause, step };
  }

  return { create };
});
