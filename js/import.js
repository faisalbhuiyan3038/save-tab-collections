document.getElementById("submitButton").addEventListener("click", function () {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedCollections = JSON.parse(e.target.result);

        if (isValidStructure(importedCollections)) {
          browser.storage.local.get({ collections: [] }, function (result) {
            const collections = result.collections;
            collections.length = 0;
            collections.push(...importedCollections);
            browser.storage.local.set(
              { collections: collections },
              function () {
                Toastify({
                  text: "Success! Collections Imported",
                  duration: 3000,
                  close: true,
                  gravity: "top", // `top` or `bottom`
                  position: "right", // `left`, `center` or `right`
                  stopOnFocus: true, // Prevents dismissing of toast on hover
                  style: {
                    background: "linear-gradient(to right, #4caf50, #4caf50)",
                  },
                }).showToast();
              }
            );
          });

          // Handle the valid data, e.g., save it or process further
        } else {
          Toastify({
            text: "Error: Invalid file structure. Please check the file and try again.",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #f44336, #f44336)",
            },
          }).showToast();
        }
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        Toastify({
          text: "Error: Unable to parse JSON. Please check the file and try again.",
          duration: 3000,
          close: true,
          gravity: "top", // `top` or `bottom`
          position: "right", // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "linear-gradient(to right, #f44336, #f44336)",
          },
        }).showToast();
      }
    };
    reader.readAsText(file);
  } else {
    Toastify({
      text: "Error: Please select a file first.",
      duration: 3000,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "linear-gradient(to right, #f44336, #f44336)",
      },
    }).showToast();
  }
});

function isValidStructure(collections) {
  // Ensure the imported data is an array and not empty
  if (!Array.isArray(collections) || collections.length === 0) return false;

  const firstCollection = collections[0];

  // Ensure the first item is an object and has the necessary properties
  if (typeof firstCollection !== "object" || firstCollection === null)
    return false;

  return (
    firstCollection.hasOwnProperty("name") &&
    firstCollection.hasOwnProperty("links") &&
    Array.isArray(firstCollection.links)
  );
}

document.getElementById('exportDrive').addEventListener('click', () => {
  console.log('i am clicked');
  const fileName = 'collections.json';
  async function getCollections() {
    let result = await browser.storage.local.get({ collections: [] });
    return result.collections;
  }

  (async () => {
    let retrievedCollections = await getCollections();

    const fileContent = JSON.stringify(retrievedCollections);

    browser.runtime.sendMessage({
      action: 'exportDrive',
      fileContent,
      fileName
    }).then(response => {
      if (response.success) {
        Toastify({
          text: "Success! Collections Imported",
          duration: 3000,
          close: true,
          gravity: "top", // `top` or `bottom`
          position: "right", // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "linear-gradient(to right, #4caf50, #4caf50)",
          },
        }).showToast();
      } else {
        alert('Backup failed: ' + response.error);
      }
    });
  })();

});

document.getElementById('importDrive').addEventListener('click', () => {
  const fileName = 'collections.json';

  browser.runtime.sendMessage({
    action: 'importDrive',
    fileName
  }).then(response => {
    if (response.success) {
      // Store the restored data in local storage
      browser.storage.local.set({ collections: response.fileContent })
        .then(() => {
          Toastify({
            text: "Success! Collections Imported",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #4caf50, #4caf50)",
            },
          }).showToast();
        })
        .catch(error => {
          alert('Failed to save restored data: ' + error.message);
          console.error('Error saving data to local storage:', error);
        });
    } else {
      Toastify({
        text: "Error: Restore failed.",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #f44336, #f44336)",
        },
      }).showToast();
    }
  });
});
