# ShroomJam 2026 Field Sheet

The original Field Sheet design, hosted with GitHub Pages. Firebase Anonymous Authentication and Realtime Database provide collaboration. No collaborator registration is required.

Share https://raditsys.github.io/shroomjam-field-sheet/ with your teammates. Choose a name, creature, and colour on the first visit. Profiles and guest sessions persist in the browser. Each tab has its own presence entry.

## Hosting and data

- GitHub Pages: deploy from `main`, `/(root)`. No build step or dependencies.
- Firebase project: `shroomjam-live` (Spark).
- Shared planning fields: `rooms/shroomjam-2026/fields`.
- Presence: `rooms/shroomjam-2026/presence/{anonymousUid}/{tabSession}`.
- `firebase-config.js` contains public web configuration, never administrator credentials.
- `database.rules.json` is the source for the published Realtime Database rules.

Text changes wait 260 ms before saving. Every field saves separately. Unsaved edits and focused fields remain protected from remote updates. For the same field, the last server-accepted write wins; after focus leaves, the field shows that shared value. Different fields do not overwrite one another. An atomic transaction seeds only an empty document. Existing remote data takes precedence over local backups.

Presence uses `onDisconnect()` and re-registers after reconnection. Cursor movement is throttled to about nine updates per second. Idle cursors do not produce writes. Collaborators on other worksheet pages remain online, with cursors hidden until the pages match.

`SAVE FILE` exports the current worksheet JSON. `OPEN` imports a backup into the shared plan after confirmation. `COPY GDD` copies Markdown. Browser storage retains a local backup; export before closing when offline or when a save error appears. Offline edits are retried while the page remains open. Reloading uses the remote plan as the source of truth.

## Disable edits after November 13, 2026

1. Open Firebase Console, project `shroomjam-live`, Realtime Database, Rules.
2. Under both `rooms/shroomjam-2026/fields` and `rooms/shroomjam-2026/drawings`, change each `.write` expression to `false`.
3. Publish. Keep the room `.read` rule and presence rules unchanged to retain guest reading and online indicators.
4. Export a final JSON backup with `SAVE FILE` before archiving the jam.

There is no scheduled shutdown. Changing repository files alone does not publish Firebase rules. To reopen edits, restore the `.write` expression from `database.rules.json` and publish. To block all database access, publish `{"rules":{".read":false,".write":false}}` in this dedicated project.

Any anonymous visitor may edit this intentionally open worksheet. Rules deny unauthenticated access, other rooms, unknown fields, invalid types, oversized strings, and writes to another UID's presence. Do not store private information here.


## Dark mode, drawings, and owner reset

- `DARK MODE` changes only your browser and remembers your choice. Printouts keep the original light palette.
- `DRAW: ON` lets you sketch over the current worksheet page with a mouse, pen, or touch. Turn drawing off to edit text. The pen uses your profile colour, with darker ink on light paper for contrast.
- `HIDE DRAWINGS` hides ink only in your browser; `SHOW DRAWINGS` reveals it again. Drawings remain shared and persist after refresh. Each of the three pages has its own drawing layer.
- `UNDO STROKE` removes your latest stroke from the current browser session. Long strokes are split into bounded segments. Shared ink writes are throttled and save separately from planning fields.
- To reveal the owner button, click the large SHROOM JAM logo five times within three seconds, then enter `bignut`. `RESET DOCUMENT` stays hidden on each fresh page load until unlocked. Reset asks for confirmation and downloads a JSON backup before replacing the shared fields with defaults and clearing all drawings.
- The password is a casual UI lock, as requested. It is visible in public client code and is not server-side owner authorization. The room remains intentionally editable by anonymous visitors.
- JSON exports include drawings. Importing an older backup without drawings clears existing shared drawings after the usual import confirmation.
