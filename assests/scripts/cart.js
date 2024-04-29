

function removeFromCart(bookId){
    fetch(`/removeFromCart/${bookId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                // Refresh the page after successful deletion
                window.location.reload();
            } else {
                console.error('Failed to delete book');
            }
        })
        .catch(error => console.error('Error:', error));
}
