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
        collectionDiv.className = "col-6 mb-3";
        const collectionButton = document.createElement("button");
        collectionButton.type = "button";
        collectionButton.className = "btn btn-secondary";
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
    collectionsDiv.innerHTML = `<h2>${collection.name}</h2>`;
    collectionsDiv.className += "animate__animated animate__zoomInLeft";
    collection.links.forEach((link) => {
      const linkElement = document.createElement("a");
      linkElement.href = link;
      linkElement.textContent = link;
      linkElement.target = "_blank";
      collectionsDiv.appendChild(linkElement);
      collectionsDiv.appendChild(document.createElement("br"));
    });

    const backButton = document.createElement("button");
    backButton.textContent = "Back";
    backButton.addEventListener("click", displayCollections);
    collectionsDiv.appendChild(backButton);
  }

  // Initial display
  displayCollections();
});
