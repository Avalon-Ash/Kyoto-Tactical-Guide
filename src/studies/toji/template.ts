// The cabinet stage: everything mountBunko() needs, and nothing else.
// Static, trusted markup; all ward text is written later with textContent.
export const BUNKO_STAGE = `<div class="stage" id="stage">
    <canvas id="scene" tabindex="0" role="button"></canvas>
    <div class="loading" id="loading" role="status"></div>
    <div class="seal" aria-hidden="true">京<br>洛</div>
    <p id="cabinet-verse" class="cabinet-verse" aria-hidden="true"></p>
    <div class="stage-caption"><small id="cabinet-context" aria-live="polite" aria-atomic="true"></small><span id="cabinet-place"></span><small id="cabinet-landmark"></small></div>
    <button id="zoom-reset" class="zoom-reset" type="button" hidden><span aria-hidden="true">⤡</span></button>
  </div>`;
