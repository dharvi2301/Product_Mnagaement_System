function openAddProductPage() {
    window.open("addProduct.html","_blank")
}

function saveProduct() {
  let isValid = true;

  const productIdInput = document.getElementById("productId");
  const productId = productIdInput.value.trim();
  const productName = document.getElementById("productName").value.trim();
  const imageUrl = document.getElementById("image").value.trim();
  const price = document.getElementById("price").value.trim();
  const description = document.getElementById("description").value.trim();

  document.querySelectorAll(".error").forEach(e => e.remove());

  function showError(inputId, message) {
      const inputField = document.getElementById(inputId);
      const errorDiv = document.createElement("div");
      errorDiv.className = "error text-danger small mt-1";
      errorDiv.innerText = message;
      inputField.parentNode.appendChild(errorDiv);
      isValid = false;
  }

  if (productId === "") {
      showError("productId", "Product ID is required.");
  } else if (!/^\d+$/.test(productId)) {
      showError("productId", "Product ID must be numeric.");
  }

  if (productName === "") {
      showError("productName", "Product Name is required.");
  }

  if (imageUrl === "") {
      showError("image", "Please enter a valid Image URL.");
  }

  if (price === "" || isNaN(price) || parseFloat(price) <= 0) {
      showError("price", "Please enter a valid price greater than zero.");
  }

  if (description === "") {
      showError("description", "Description is required.");
  }

  if (isValid) {
      let products = JSON.parse(localStorage.getItem("productDetails")) || [];

      if (!Array.isArray(products)) {
          products = [];
      }

      let existingProductIndex = products.findIndex(p => p.productId === productId);

      if (existingProductIndex !== -1) {
          products[existingProductIndex] = {
              productId,
              productName,
              imageUrl,
              price: parseFloat(price),
              description,
          };
      } else {
          products.push({
              productId,
              productName,
              imageUrl,
              price: parseFloat(price),
              description,
          });
      }

      localStorage.setItem("productDetails", JSON.stringify(products));

      alert(existingProductIndex !== -1 ? "Product updated successfully!" : "Product saved successfully!");

      window.location.href = "viewProduct.html";
  }
}

function appendProductToTable(product) {
  const tableBody = document.querySelector("#productTable tbody");

  const row = document.createElement("tr");
  row.innerHTML = `
      <td>${product.productId}</td>
      <td>${product.productName}</td>
      <td><img src="${product.imageUrl}" alt="Product Image" width="80" height="80"></td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${product.description}</td>
      <td>
          <span class="edit-icon text-primary" style="cursor: pointer; margin-right: 10px;">&#9998;</span> 
          <span class="delete-icon text-danger" style="cursor: pointer;">&#128465;</span>
      </td>
  `;
  tableBody.appendChild(row);
}

document.addEventListener("DOMContentLoaded", function () {
  let products = JSON.parse(localStorage.getItem("productDetails")) || [];
  renderTable(products);
});

// Sorting Logic
let currentSort = { column: null, order: "asc" };

document.querySelectorAll(".sortable").forEach(header => {
  header.addEventListener("click", function () {
      const column = this.dataset.column;
      let products = JSON.parse(localStorage.getItem("productDetails")) || [];

      if (currentSort.column === column) {
          currentSort.order = currentSort.order === "asc" ? "desc" : "asc";
      } else {
          currentSort.column = column;
          currentSort.order = "asc";
      }

      products.sort((a, b) => {
          let valA = a[column];
          let valB = b[column];

          if (column === "price") {
              valA = parseFloat(valA);
              valB = parseFloat(valB);
          }

          if (valA < valB) return currentSort.order === "asc" ? -1 : 1;
          if (valA > valB) return currentSort.order === "asc" ? 1 : -1;
          return 0;
      });

      renderTable(products);
  });
});

function renderTable(products) {
  const tableBody = document.querySelector("#productTable tbody");
  tableBody.innerHTML = "";

  products.forEach(product => appendProductToTable(product));

  localStorage.setItem("productDetails", JSON.stringify(products));

  updateSortIcons();
}

function updateSortIcons() {
  document.querySelectorAll(".sortable").forEach(header => {
      if (header.dataset.column === currentSort.column) {
          header.innerHTML = `${header.dataset.label} ${currentSort.order === "asc" ? "⬆" : "⬇"}`;
      } else {
          header.innerHTML = `${header.dataset.label} ⬆⬇`; // Default arrows
      }
  });
}


// Delete Product
document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#productTable tbody");

  if (tableBody) {
      tableBody.addEventListener("click", function (event) {
          if (!event.target.classList.contains("delete-icon")) return;

          const row = event.target.closest("tr");
          const productId = row.cells[0].textContent.trim();

          let products = JSON.parse(localStorage.getItem("productDetails")) || [];

          const updatedProducts = products.filter(product => product.productId !== productId);

          localStorage.setItem("productDetails", JSON.stringify(updatedProducts));

          row.remove();

          alert("Product deleted successfully!");
      });
  }
});

// Edit Product
document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#productTable tbody");

  if (tableBody) {
      tableBody.addEventListener("click", function (event) {
          if (event.target.classList.contains("edit-icon")) {
              const row = event.target.closest("tr");
              const productId = row.cells[0].textContent.trim();

              window.location.href = `addProduct.html?productId=${productId}`;
          }
      });
  }
});

// Load Product Data for Editing
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("productId");

  if (productId) {
      let products = JSON.parse(localStorage.getItem("productDetails")) || [];
      let product = products.find(p => p.productId === productId);

      if (product) {
          document.getElementById("productId").value = product.productId;
          document.getElementById("productName").value = product.productName;
          document.getElementById("image").value = product.imageUrl;
          document.getElementById("price").value = product.price;
          document.getElementById("description").value = product.description;

          document.getElementById("productId").setAttribute("disabled", "true");
      }
  }
});


document.getElementById("filterProductId").addEventListener("input", function () {
  const filterValue = this.value.trim();
  const tableBody = document.querySelector("#productTable tbody");
  const products = JSON.parse(localStorage.getItem("productDetails")) || [];

  // Clear existing rows
  tableBody.innerHTML = "";

  // Filter products by Product ID
  const filteredProducts = products.filter(product => 
      product.productId.includes(filterValue) // Checks if input matches part of Product ID
  );

  // Re-render the table with filtered results
  filteredProducts.forEach(product => appendProductToTable(product));
});
