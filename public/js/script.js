// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    var uploadForm = document.getElementById('upload-form');
    uploadForm.addEventListener('submit', function(event) {
        event.preventDefault();
        uploadForm.querySelector('button').innerText = 'Uploading...';

        var formData = new FormData(uploadForm);

        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (response.redirected) {
                window.location.replace(response.url); // If redirected, navigate to the redirect URL
            } else if (response.ok) {
                window.location.href = '/summary.html'; // If response is OK, navigate to summary.html
            } else {
                uploadForm.querySelector('button').innerText = 'Upload'; // Reset button text if there was an error
                throw new Error('Network response was not ok.');
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            alert('Error: Upload failed.');
            uploadForm.querySelector('button').innerText = 'Upload'; // Reset button text on error
        });
    });
});
