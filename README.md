# save-tab-collections

Work in progess...

Issue found:

- [x] ~~Show toast when opening import page or any link in background in android.~~
- [x] ~~Export not working in android.~~ - This was due to a Firefox Android limitation. I used a workaround by looking at how other extension developers worked around it. To do it, I created a temporary `<a>` element, setting its href to a data URL, and programmatically clicking it. However, the comments suggest this method doesn't work well in Firefox panels.

TODO:

- [x] Load a popup on extension click.
- [x] Modal to take user input.
- [x] View entire list of collections when clicking the addon.
- [x] Fix incomplete design
- [x] Create new collection in homepage when clicking the Submit button.
- [x] Design page to show list of sites in collection. Should have Remove collection button.
- [x] Ability to edit saved collections.
- [x] See individual links and open link in new tab upon clicking.
- [x] Show alert only on mobile to indicate a new tab has been opened.
- [x] Create Settings page with Backup/Restore options.
- [x] Export, import data with JSON.
- [x] Error on wrong structure JSON file import
- [x] Remove duplicate links on adding a new collecton or editing collection
- [ ] Implement sync with Google authentication and Google Drive, Guess i will do this after publishing.
- [ ] Auto sync, with custom time intervals. Will only sync if edited. Check edited with boolean.
- [ ] Parse links to show Tab title, and website link in a group for each site, like how its shown in Firefox Android collections.
- [ ] Let user choose which method of separator to use: comma, space, \*, with space as default.
- [x] Right-clicking anywhere on the page should show a "Copy all tabs" option to copy all open tabs automatically.
