document.addEventListener("DOMContentLoaded", function () {
  const createCollectionIcon = document.getElementById("createCollection");
  const modal = document.getElementById("modal");
  const editModal = document.getElementById("editModal");
  const closeModal = document.querySelector(".close");
  const closeEditModal = document.querySelector(".closeEdit");
  const saveCollectionButton = document.getElementById("saveCollection");
  const collectionsDiv = document.getElementById("collections");
  const exportJSONButton = document.getElementById("exportJSON");
  const importJSONButton = document.getElementById("importJSON");

  exportJSONButton.addEventListener("click", () => {
    browser.storage.local.get({ collections: [] }, function (result) {
      const collections = result.collections;
      exportCollections(collections);
    });
  });

  importJSONButton.addEventListener("click", function () {
    // Open import.html in a new tab
    browser.tabs.create({ url: browser.runtime.getURL("import.html") });
  });

  function exportCollections(collections) {
    const dataStr = JSON.stringify(collections, null, 2); // Convert collections array to JSON string
    const blob = new Blob([dataStr], { type: "application/json" }); // Create a Blob from the JSON string
    const url = URL.createObjectURL(blob); // Create a URL for the Blob
    const a = document.createElement("a");
    a.href = url;
    a.download = "collections.json"; // Set the file name for the download
    a.click(); // Trigger the download
    URL.revokeObjectURL(url); // Clean up
  }

  // Show modal
  createCollectionIcon.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  closeEditModal.addEventListener("click", () => {
    editModal.style.display = "none";
  });

  // Save collection
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



      // Save to storage
      browser.storage.local.get({ collections: [] }, function (result) {
        let collections = result.collections;
        collections.push(collection);
        collections = removeDuplicateLinks(collections, collectionName);
        browser.storage.local.set({ collections }, function () {
          modal.style.display = "none";
          displayCollections();
        });
      });
    }
  });

  // Display collections
  function displayCollections() {
    collectionsDiv.innerHTML = "";
    browser.storage.local.get({ collections: [] }, function (result) {
      const collections = result.collections;
      collections.forEach((collection, index) => {
        const collectionDiv = document.createElement("div");
        collectionDiv.className =
          "d-flex col-6 mb-3 justify-content-center col-Button";
        const collectionButton = document.createElement("button");
        collectionButton.type = "button";
        collectionButton.className = "btn btn-secondary col-12";
        collectionButton.innerHTML = `<strong>${collection.name}</strong>`;
        collectionDiv.appendChild(collectionButton);
        collectionDiv.addEventListener("click", () => {
          displayLinks(collection);
        });
        collectionsDiv.appendChild(collectionDiv);
      });
    });
  }

  // Display links
  function displayLinks(collection) {
    // currentCollection = collection;
    console.log(collection.links);
    collectionsDiv.innerHTML = `<h3>${collection.name}</h3>`;
    collectionsDiv.className += "animate__animated animate__zoomInLeft";
    const bulletElement = document.createElement("ul");
    bulletElement.className = "list-group";
    collectionsDiv.appendChild(bulletElement);
    collection.links.forEach((link) => {
      const bullet = document.createElement("li");
      bullet.className =
        "list-group-item list-group-item-success d-flex justify-content-between align-items-center linkList mb-2";

      const linkTag = document.createElement("a");
      linkTag.className =
        "link-underline link-underline-opacity-0 link-underline-opacity-75-hover text-success-emphasis";
      linkTag.href = link;
      linkTag.textContent = link;
      linkTag.target = "_blank";

      const isFirefoxAndroid = navigator.userAgent.includes("Android");
      linkTag.addEventListener("click", (event) => {
        event.preventDefault();
        browser.tabs.create({
          url: link,
        });
        if (isFirefoxAndroid) {
          window.alert("Tab created!");
        }
      });

      bullet.appendChild(linkTag);
      bulletElement.appendChild(bullet);
    });

    const buttonsDiv = document.createElement("div");

    buttonsDiv.className = "d-flex justify-content-between";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-danger";
    removeButton.textContent = "Delete";
    removeButton.addEventListener("click", () => {
      removeCollection(collection.name);
    });
    buttonsDiv.appendChild(removeButton);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-warning";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      editModal.style.display = "block";
      editModalSave(collection);
    });
    buttonsDiv.appendChild(editButton);

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "btn btn-info";
    backButton.textContent = "Back";
    backButton.addEventListener("click", displayCollections);
    buttonsDiv.appendChild(backButton);

    collectionsDiv.appendChild(buttonsDiv);
  }

  function editModalSave(collection) {
    const editLinksTextArea = document.getElementById("editLinks");
    collection.links.forEach((link) => {
      editLinksTextArea.value += `${link}\n\n`;
    });

    document
      .getElementById("saveEditedCollection")
      .addEventListener("click", () => {
        collection.links = document
          .getElementById("editLinks")
          .value.split("\n")
          .map((link) => link.trim())
          .filter((link) => link);

        browser.storage.local.get({ collections: [] }, function (result) {
          let retrievedCollections = result.collections || [];

          retrievedCollections = retrievedCollections.map((item) => {
            if (item.name === collection.name) {
              return { ...item, links: collection.links }; // Modify the links as needed
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

  function removeCollection(collectionName) {
    browser.storage.local.get({ collections: [] }, function (result) {
      const collections = result.collections;
      const index = collections.findIndex(
        (collection) => collection.name === collectionName
      );
      collections.splice(index, 1);
      browser.storage.local.set({ collections }, function () {
        displayCollections();
      });
    });
  }

  function removeDuplicateLinks(collectionArray, collectionName) {
    // Find the collection by name
    const collection = collectionArray.find(c => c.name === collectionName);

    if (!collection) {
      console.error('Collection not found');
      return collectionArray; // Return the original array if collection not found
    }

    // Remove duplicates from the links array
    const uniqueLinks = [...new Set(collection.links)];

    // Update the collection's links with the unique links
    collection.links = uniqueLinks;

    return collectionArray; // Return the modified array
  }

  // Initial display
  displayCollections();
});
