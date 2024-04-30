fetch("/adminNavbar")
  .then((response) => response.text())
  .then((data) => (document.getElementById("adminNavbar").innerHTML = data));

fetch("/admin_script")
  .then((response) => response.json())
  .then((data) => {
    const usersTableBody = document.getElementById("user-table-body");
    data.users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.phone_no}</td>
                <td>${user.password}</td>
            `;
      usersTableBody.appendChild(row);
    });

<<<<<<< Updated upstream
=======
    const adminsTableBody = document.getElementById("admin-table-body");
    data.admin.forEach((admin) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${admin.username}</td>
                <td>${admin.email}</td>
                <td>${admin.phone_no}</td>
                <td>${admin.password}</td>
            `;
      adminsTableBody.appendChild(row);
    });
>>>>>>> Stashed changes

    const FeedbackTableBody = document.getElementById("feedback-table-body");
    data.feedback.forEach((feedback) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${feedback.username}</td>
                <td>${feedback.email}</td>
                <td>${feedback.phone_no}</td>
                <td>${feedback.message}</td>
            `;
<<<<<<< Updated upstream
            FeedbackTableBody.appendChild(row);
        });
    })
    .catch(error => console.error('Error:', error));

    fetch('/admin_script')
    .then(response => response.json())
    .then(data => {
        const adminsTableBody = document.getElementById('admin-table-body');
        data.admin.forEach(admin => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${admin.username}</td>
                <td>${admin.email}</td>
                <td>${admin.phone_no}</td>
                <td>${admin.password}</td>
            `;
            adminsTableBody.appendChild(row);
        });

    })
    .catch(error => console.error('Error:', error));
    fetch('/admin_script')
    .then(response => response.json())
    .then(data => {
        const FeedbackTableBody = document.getElementById('feedback-table-body');
        data.feedback.forEach(feedback => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${feedback.username}</td>
                <td>${feedback.email}</td>
                <td>${feedback.phone_no}</td>
                <td>${feedback.message}</td>
            `;
            FeedbackTableBody.appendChild(row);
        });

    })
    .catch(error => console.error('Error:', error));
=======
      FeedbackTableBody.appendChild(row);
    });
  })
  .catch((error) => console.error("Error:", error));
>>>>>>> Stashed changes

function fetchTotalCount() {
  fetch("/books/count")
    .then((response) => response.json())
    .then((data) => {
      const totalCountElement = document.getElementById("total-count");
      totalCountElement.textContent = `Total Books: ${data.count}`;
    })
    .catch((error) => console.error("Error:", error));
}

// Call fetchTotalCount when the page loads
document.addEventListener("DOMContentLoaded", fetchTotalCount);

function fetchBooks() {
  const category = document.getElementById("category-select").value;
  let url = "/books";
  if (category !== "All") {
    url += `?category=${category}`;
  }
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.getElementById("book-table-body");
      tableBody.innerHTML = ""; // Clear previous data
      data.forEach((book) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                        <td>${book.name}</td>
                        <td>${book.author}</td>
                        <td>${book.description}</td>
                        <td>${book.price}</td>
                        <td><button onclick="removeBook('${book._id}')">Remove</button></td>
                    `;
        tableBody.appendChild(row);
      });
    })
    .catch((error) => console.error("Error:", error));
}

function removeBook(bookId) {
  fetch(`/books/${bookId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        // Refresh the page after successful deletion
        window.location.reload();
      } else {
        console.error("Failed to delete book");
      }
    })
    .catch((error) => console.error("Error:", error));
}
