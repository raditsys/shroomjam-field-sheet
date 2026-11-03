# Codex directive: add one focused build-details tab

## Objective

Extend the current ShroomJam Field Sheet with one tab that helps three people turn their selected concept into the same playable game during a one-week jam.

The existing sheet already handles concept selection, a pitch, the core loop, discovery moments, scope, and a seven-day delivery plan. Fill the gap between those decisions and implementation: exact player behaviour, feedback, intended feel, the first playable sequence, and the assets required to build it.

Implement this brief only when the user asks to implement it. This file is a specification, not authorization to change or deploy the website.

## What the references contribute

- **Monaco:** Andy Schatz's original design connects its film and game references to particular interactions and pacing decisions. It specifies player actions, mission phases, interface flow, and basic content needs. Borrow that connection between inspiration, behaviour, and production. Do not copy the proposed game's feature count. Relevant areas: PDF pages 3–6, 9–11, and 13–16. [Archived original design](https://gamescrye.com/wp-content/uploads/2023/02/Monaco-GDD.pdf).
- **Grand Theft Auto / Race'n'Chase:** the March 1995 document specifies game objectives, available actions, controls, world elements, graphical behaviour, implementation limits, and delivery milestones. Borrow its precision about what the player does and what the game must support. Relevant printed sections: 5, Specification; 6, Gameplay; 7, Front End; 10, Time. The scan places printed page 5 after printed page 8. [Provided document](https://gamescrye.com/wp-content/uploads/2023/02/Grand-Theft-Auto-GDD.pdf).
- **Silent Hill 2:** this is Oliver James Cooke's academic reconstruction, not an original Konami production document. Its preface explicitly explains that distinction. Its useful structure separates mechanics, controls, interface, art direction, audio direction, and content. Borrow how sensory choices support the intended experience. Relevant pages: 2–3, 11–12, and 25–35. [Provided Drive file](https://drive.google.com/file/d/1nxvdXasP-HsRCt62cHK3wF_pIrJpYx5T/view), [accessible mirror](https://jolineblais.net/nmd443/wp-content/uploads/silent-hill-design-document.pdf). The downloaded Drive file and mirror have identical SHA-256 hashes.

The supplied Monaco URL is a PCGamingWiki game page, not the design document. That wiki blocked direct retrieval. The study instead used the archived original design linked above.

The design recommendation below is a synthesis for this jam's constraints. The references do not prescribe this exact layout or these limits.

## Preserve the existing site

- Modify the current `index.html` and extend `sheet-tools.js` only where necessary. The original `ShroomJam_Live_Anonymous_Field_Sheet.html` is a historical visual reference; copying it over the deployed file would remove newer features.
- Keep existing fonts, paper treatment, dark palette, green accents, thin rules, typography, spacing language, and restrained editorial layout.
- Keep all existing planning content and the current three tabs in their existing order, with their existing IDs and data meanings.
- Preserve anonymous collaboration, profiles, cursors, presence, drawing tools, dark mode, hidden owner reset, exports, imports, and local backups.
- Add no framework, package dependency, new service, login, dashboard, kanban board, or rich-text editor.

## Navigation and layout

Append one top-level tab: **04 BUILD THE DETAILS**. Use page index `3`; do not renumber existing pages.

Page title: **Make it concrete.**

Short introduction: “Agree on how it plays, how it feels, and what we need to make.”

Use the same main-column/sidebar pattern as the current design page. Put playable behaviour and mechanics in the main column, feel and references in the sidebar, and the compact asset list below. Use native `<details>` for the asset list if needed to keep the initial view short. On mobile, stack content and use a tidy two-by-two tab layout with the existing order preserved.

Avoid large new cards, a separate visual language, modal-based editing, or a second navigation system. Use short prompts and multiline inputs that grow enough for useful answers. All new fields start empty; examples belong in placeholders, never saved values.

## 04A — The playable contract

Add four short fields:

1. **Camera & controls:** perspective, main input bindings, and important movement or interaction constraints. Include platform/player count here when relevant.
2. **Player goal:** the concrete state that counts as success.
3. **Failure & retry:** what causes failure and what happens next. “No failure state” is a valid explicit answer.
4. **First playable minute:** a short sequence of up to five beats: what the player sees, tries, learns, struggles with, and completes. Describe one small representative slice that can be built and tested.

Do not duplicate the existing pitch or core-loop fields. The new sequence should make those existing ideas concrete, including any start, end, and restart screens actually needed.

## 04B — Mechanics we can test

Provide three fixed mechanic slots. Blank slots are allowed. Each slot has:

- **Name** — one player verb or system.
- **Input / trigger** — what the player does and when it is allowed.
- **Rule / limit** — the actual response, including one important constraint or edge case. Include tuning numbers only when they help.
- **Feedback** — what the player sees, hears, or feels to understand the response.
- **Test** — an observable result that proves the mechanic works.

Use one short example in helper text to show the desired specificity: “Press interact near a door; it opens only while the switch is held; the latch clicks and the light turns green; test that releasing the switch closes it.” Do not assume this is the team's chosen mechanic.

Keep these as three simple editable groups. Do not add priorities, assignment workflows, dependencies, or task tracking here. If a mechanic is cut, clear the slot or record the cut in the existing scope section.

## 04C — Feel and references

Add:

- **Three feel words:** the intended moment-to-moment experience, such as “nimble, tense, mischievous.”
- **Visual direction:** readable shapes, palette/lighting, camera presentation, and animation treatment that matter to the playable slice.
- **Audio & response:** sound, silence, animation timing, impact cues, and other feedback that support the feel. Accessibility-sensitive effects should remain optional in the actual game.
- **Avoid:** one short statement about a direction that would undermine the intended experience.

Provide three fixed reference rows with **title**, **URL**, and **what we borrow / why**. References can be games, films, images, or audio. A link without an explanation is incomplete inspiration.

Use clickable HTTP/HTTPS links. Render labels and notes as text; reject executable URL schemes. Do not add uploads, scraping, media embeds, automatic previews, or an asset browser. Existing shared drawing mode supplies space for rough diagrams on this page.

## 04D — Assets to ship

Provide eight fixed rows in a compact list/table. Support these fields:

| Field | Purpose |
| --- | --- |
| Asset / purpose | Name, quantity if useful, and which mechanic or playable beat needs it |
| Kind | Art, animation, VFX, audio, UI, or level |
| Approach | Make or reuse |
| Owner | Free text for one of the three teammates |
| State | Needed, making, ready, or cut |
| Source / credit | Optional link or attribution note; particularly useful for reused material |

Keep the source/credit field on a secondary line so the table remains narrow. Stack each row on mobile. Empty rows must look quiet. Do not add drag-and-drop, due dates, comments, time estimates, notifications, or a separate backlog.

Helper text: “List only what the first playable and final jam build need. Reuse before making another asset.”

The fixed capacities are deliberate jam limits, not a general project-management system.

## Collaboration and compatibility requirements

1. Keep `rooms/shroomjam-2026/fields` as the shared planning path. Give every new input a stable individual key, for example `build_goal`, `build_mechanic_0_rule`, or `build_asset_0_state`. Do not save the entire new tab or asset list as one object after every keystroke.
2. Extend the existing state defaults, normalization, flattening, input-to-key mapping, remote application, debounced saves, and dirty-field protection. Do not replace them with another synchronization system.
3. Treat new keys as optional in existing remote documents. Opening the new version must not overwrite the current plan, import a stale local plan, or require all new keys to exist. Use empty defaults for missing values. If initialization is necessary, initialize only missing keys safely.
4. Extend the strict Firebase field whitelist and validation. Keep bounded strings, validate the new enumerated values, and keep unrelated paths denied. Do not require the new keys in the existing `hasChildren` list in a way that breaks older clients or backups.
5. Audit every three-page assumption. Update navigation, tab keyboard behaviour, counters, local page restoration, page validation, print rules, and screen-reader labels. Preserve existing per-page completion logic; no new completion score is needed.
6. In particular, update the allowed `step` range from `0..2` to `0..3` in both presence and drawing rules. Update corresponding client checks. Verify that drawings on page 3 persist and that cursors appear only when collaborators view the same page.
7. Include all new planning fields in JSON export/import and local backups. New exports may use version 2; continue importing version 1 with empty defaults for added fields. Continue accepting existing drawings and profiles.
8. Extend `COPY GDD` with meaningful filled sections from this tab. Omit empty mechanic, reference, and asset rows. Preserve the existing document sections.
9. Extend owner reset to clear the new fields as well as existing planning fields and drawings. Keep password reveal, confirmation, and automatic backup behaviour intact. Do not make the reset button visible by default.
10. Keep GitHub Pages as the only host. Publish the new Firebase rules as well as code, and verify the final Pages deployment. Back up the current worksheet before testing destructive operations and restore exact contents afterward.

## Acceptance checks

- Compare desktop and narrow-screen light/dark screenshots: the original pages keep their visual identity; new content looks native to the sheet.
- Load an existing room and import an old version-1 JSON backup. Existing content stays intact and new fields receive sensible empty defaults.
- In two sessions, edit different mechanics and different asset rows simultaneously. No unrelated values are lost; focused unsaved text remains protected.
- Refresh, disconnect, and rejoin. New fields, asset states, references, and new-page drawings remain correct.
- On page index 3, verify anonymous writes, presence, matching-page cursors, drawing, hide/show, undo, and persistence. Verify that page-3 cursors/drawings do not appear on another page.
- Verify that invalid enums, unknown field keys, oversized values, unauthenticated writes, and writes to unrelated paths remain denied.
- Round-trip a JSON backup containing the new fields and drawings. Verify `COPY GDD` output and print output include the added information cleanly.
- Test owner reset with a backup and restore the original plan. Verify that new fields clear, drawings clear, and the button re-hides on refresh.
- Report only observed test results. Provide the deployed URL, commit, and any remaining limitations.

## Definition of done

A teammate can open the fourth tab and understand what inputs to implement, how the core interactions behave, what a representative minute of play contains, what the game should feel like, and which small set of assets is needed. The team can answer those questions without writing a long production document or changing the character of the current website.
