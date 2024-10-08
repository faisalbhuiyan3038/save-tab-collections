# save-tab-collections

## About this addon:
**Save Link Collections** is a powerful Firefox add-on designed to help users manage and organize their online browsing experience more efficiently. Whether you're researching, curating content, or just keeping track of your favorite websites, this extension allows you to easily save, organize, and access your collections of links across multiple devices.

## Key Features:
- **Seamless Collection Management:** Create, edit, and delete collections effortlessly. View all your collections with just a click and access individual links with ease.
- **Enhanced Mobile Experience**: Optimized for Firefox Android, including a custom solution for exporting data, even with existing platform limitations.
- **Backup and Restore**: Secure your data with JSON-based backup and restore options, ensuring your collections are always safe.
- **Flexible Import/Export**: Import and export your link collections in JSON format, with safeguards against invalid structures and duplicate entries.
- **Contextual Menus**: Right-click on the extension to copy all open tabs, saving you time and effort.
- **Future Enhancements**: Upcoming features include Google Drive sync with Google authentication, automatic synchronization, customizable time intervals, and more.

**Save Link Collections** is the ultimate tool for anyone looking to take control of their online bookmarks and browsing sessions. With user-friendly design and robust functionality, managing your web links has never been easier.

Stay tuned for future updates as we continue to enhance the add-on with new features, including advanced link parsing and personalized syncing options.

### Issue found:

- [x] ~~Show toast when opening import page or any link in background in android.~~
- [x] ~~Export not working in android.~~ - This was due to a Firefox Android limitation. I used a workaround by looking at how other extension developers worked around it. To do it, I created a temporary `<a>` element, setting its href to a data URL, and programmatically clicking it. However, the comments suggest this method doesn't work well in Firefox panels.
- [ ] Google Import Export buttons not doing anything in android but works perfectly in desktop

### TODO:

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
- [ ] Auto sync, with custom time intervals. Will only sync if edited. Check edited with boolean. Or sync after adding a collection, or editing a collection only. Along with manual sync.
- [ ] Parse links to show Tab title, and website link in a group for each site, like how its shown in Firefox Android collections.
- [ ] Let user choose which method of separator to use: comma, space, \*, with space as default.
- [x] Right-clicking anywhere on the page should show a "Copy all tabs" option to copy all open tabs automatically.
