document.addEventListener("DOMContentLoaded", function () {
  // Detect if the platform is Android and apply specific styles
  browser.runtime.getPlatformInfo().then((info) => {
    if (info.os === 'android') {
      document.getElementById('dynamicStyles').href = 'mobile.css';
    }
  });

  // Get references to various elements in the DOM
  const createCollectionIcon = document.getElementById("createCollection");
  const modal = document.getElementById("modal");
  const editModal = document.getElementById("editModal");
  const closeModal = document.querySelector(".close");
  const closeEditModal = document.querySelector(".closeEdit");
  const saveCollectionButton = document.getElementById("saveCollection");
  const collectionsDiv = document.getElementById("collections");
  const exportJSONButton = document.getElementById("exportJSON");
  const importJSONButton = document.getElementById("importJSON");

  // Event listener for exporting collections to JSON
  exportJSONButton.addEventListener("click", () => {
    browser.storage.local.get({ collections: [] }, function (result) {
      const collections = result.collections;
      exportCollections(collections);
    });
  });

  // Event listener for importing collections from JSON
  importJSONButton.addEventListener("click", function () {
    browser.tabs.create({ url: browser.runtime.getURL("import.html") });
    showToast("Import Page Opened!", "top", "right");
  });

  // Export collections as a JSON file
  function exportCollections(collections) {
    const content = JSON.stringify(collections, null, 2);
    const filename = 'collections_export.json';
    const filetype = 'application/json';

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = iframe.style.top = '-99px';
    iframe.srcdoc = `<a download="${filename}" target="_blank">${filename}</a>`;

    iframe.onload = function () {
      const blob = new Blob([content], { type: filetype });
      const a = iframe.contentDocument.querySelector('a');
      a.href = iframe.contentWindow.URL.createObjectURL(blob);
      a.click();
      setTimeout(() => iframe.remove(), 2000);
    };

    document.body.appendChild(iframe);
  }

  // Show the modal for creating a new collection
  createCollectionIcon.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Close the create collection modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the edit collection modal
  closeEditModal.addEventListener("click", () => {
    editModal.style.display = "none";
  });

  // Save a new collection to local storage
  saveCollectionButton.addEventListener("click", () => {
    const collectionName = document.getElementById("collectionName").value;
    const collectionLinks = document
      .getElementById("collectionLinks")
      .value.split("\n")
      .map((link) => link.trim())
      .filter((link) => link);

    if (collectionName && collectionLinks.length) {
      const collection = {
        name: collectionName,
        links: collectionLinks,
      };



      // Save the collection to local storage
      browser.storage.local.get({ collections: [] }, function (result) {
        let collections = result.collections;
        collections.push(collection);
        collections = removeDuplicateLinks(collections, collectionName);
        document.getElementById("collectionName").value = "";
        document.getElementById("collectionLinks").value = "";
        browser.storage.local.set({ collections }, function () {
          modal.style.display = "none";
          displayCollections();
        });
      });
    }
  });

  // Display all collections in the UI
  function displayCollections() {
    collectionsDiv.innerHTML = "";
    browser.storage.local.get({ collections: [] }, function (result) {
      const collections = result.collections;
      collections.forEach((collection) => {
        const collectionDiv = document.createElement("div");
        collectionDiv.className = "d-flex col-6 mb-3 justify-content-center col-Button";

        const collectionButton = document.createElement("button");
        collectionButton.type = "button";
        collectionButton.className = "btn btn-secondary col-12";
        const strongElement = document.createElement("strong");
        strongElement.textContent = collection.name;
        collectionButton.appendChild(strongElement);

        collectionDiv.appendChild(collectionButton);
        collectionDiv.addEventListener("click", () => {
          displayLinks(collection);
        });

        collectionsDiv.appendChild(collectionDiv);
      });
    });
  }

  // Display the links in a specific collection
  function displayLinks(collection) {
    const heading = document.createElement('h3');
    heading.textContent = collection.name;
    collectionsDiv.innerHTML = ''
    collectionsDiv.appendChild(heading);
    collectionsDiv.classList.add("animate__animated", "animate__zoomInLeft");

    const bulletElement = document.createElement("ul");
    bulletElement.className = "list-group";
    collectionsDiv.appendChild(bulletElement);

    collection.links.forEach((link) => {
      const bullet = document.createElement("li");
      bullet.className = "list-group-item list-group-item-success d-flex justify-content-between align-items-center linkList mb-2";

      const linkTag = document.createElement("a");
      linkTag.className = "link-underline link-underline-opacity-0 link-underline-opacity-75-hover text-success-emphasis";
      linkTag.href = link;
      linkTag.textContent = link;
      linkTag.target = "_blank";

      // Check if the platform is Android
      const isFirefoxAndroid = navigator.userAgent.includes("Android");

      // Open the link in a new tab and show a toast message if on Android
      linkTag.addEventListener("click", (event) => {
        event.preventDefault();
        browser.tabs.create({ url: link });
        if (isFirefoxAndroid) {
          showToast("Link Opened!", "top", "left");
        }
      });

      bullet.appendChild(linkTag);
      bulletElement.appendChild(bullet);
    });

    // Add buttons for deleting, editing, and going back
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "d-flex justify-content-between";

    // Delete button
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-danger";
    removeButton.textContent = "Delete";
    removeButton.addEventListener("click", () => {
      removeCollection(collection.name);
    });
    buttonsDiv.appendChild(removeButton);

    // Edit button
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-warning";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      editModal.style.display = "block";
      editModalSave(collection);
    });
    buttonsDiv.appendChild(editButton);

    // Back button
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "btn btn-info";
    backButton.textContent = "Back";
    backButton.addEventListener("click", displayCollections);
    buttonsDiv.appendChild(backButton);

    collectionsDiv.appendChild(buttonsDiv);
  }

  // Save edited links in a collection
  function editModalSave(collection) {
    const editLinksTextArea = document.getElementById("editLinks");
    collection.links.forEach((link) => {
      editLinksTextArea.value += `${link}\n\n`;
    });

    document.getElementById("saveEditedCollection").addEventListener("click", () => {
      collection.links = document
        .getElementById("editLinks")
        .value.split("\n")
        .map((link) => link.trim())
        .filter((link) => link);

      browser.storage.local.get({ collections: [] }, function (result) {
        let retrievedCollections = result.collections || [];

        retrievedCollections = retrievedCollections.map((item) => {
          if (item.name === collection.name) {
            return { ...item, links: collection.links };
          }
          return item;
        });

        retrievedCollections = removeDuplicateLinks(retrievedCollections, collection.name);

        // Save the updated collection back to storage
        browser.storage.local.set({ collections: retrievedCollections });
        editModal.style.display = "none";
        displayLinks(collection);
      });
    });
  }

  // Remove a collection from local storage
  function removeCollection(collectionName) {
    browser.storage.local.get({ collections: [] }, function (result) {
      const collections = result.collections;
      const index = collections.findIndex((collection) => collection.name === collectionName);
      collections.splice(index, 1);
      browser.storage.local.set({ collections }, function () {
        displayCollections();
      });
    });
  }

  // Remove duplicate links within a collection
  function removeDuplicateLinks(collectionArray, collectionName) {
    const collection = collectionArray.find(c => c.name === collectionName);
    if (!collection) {
      console.error('Collection not found');
      return collectionArray;
    }

    collection.links = [...new Set(collection.links)];
    return collectionArray;
  }

  // Show a toast message with customizable options
  function showToast(message, gravity, position) {
    Toastify({
      text: message,
      duration: 2000,
      close: true,
      gravity: gravity, // `top` or `bottom`
      position: position, // `left`, `center` or `right`
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #4caf50, #4caf50)",
      },
    }).showToast();
  }

  // Initial display of collections on page load
  displayCollections();

  document.getElementById('exportDrive').addEventListener('click', () => {
    browser.tabs.create({ url: browser.runtime.getURL("import.html") });
    showToast("Export Page Opened!", "top", "right");
  });

  document.getElementById('importDrive').addEventListener('click', () => {
    browser.tabs.create({ url: browser.runtime.getURL("import.html") });
    showToast("Import Page Opened!", "top", "right");
  });



});
