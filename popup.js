document.addEventListener("DOMContentLoaded", function () {
  const createCollectionIcon = document.getElementById("createCollection");
  const modal = document.getElementById("modal");
  const closeModal = document.querySelector(".close");
  const saveCollectionButton = document.getElementById("saveCollection");
  const collectionsDiv = document.getElementById("collections");

  // Show modal
  createCollectionIcon.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
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
        const collections = result.collections;
        collections.push(collection);
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
    collectionsDiv.innerHTML = `<h3>${collection.name}</h3>`;
    collectionsDiv.className += "animate__animated animate__zoomInLeft";
    const bulletElement = document.createElement("ul");
    bulletElement.className = "list-group";
    collectionsDiv.appendChild(bulletElement);
    collection.links.forEach((link) => {
      const bullet = document.createElement("li");
      bullet.className =
        "list-group-item list-group-item-success d-flex justify-content-between align-items-center text-success-emphasis linkList mb-2";
      bullet.href = link;
      bullet.textContent = link;
      bullet.target = "_blank";

      bulletElement.appendChild(bullet);
    });

    const buttonsDiv = document.createElement("div");

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-danger";
    removeButton.textContent = "Delete";
    removeButton.addEventListener("click", () => {
      removeCollection(collection.name);
    });
    buttonsDiv.appendChild(removeButton);

    buttonsDiv.className = "d-flex justify-content-between";
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "btn btn-info";
    backButton.textContent = "Back";
    backButton.addEventListener("click", displayCollections);
    buttonsDiv.appendChild(backButton);

    collectionsDiv.appendChild(buttonsDiv);
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

  // Initial display
  displayCollections();
});
