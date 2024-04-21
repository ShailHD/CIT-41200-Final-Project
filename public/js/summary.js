document.getElementById('userDetailsForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    try {
        const response = await fetch('/submit-summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formProps),
        });

        if (response.ok) {
            window.location.href = '/result.html';
        } else {
            alert('Failed to submit details. Please try again.');
        }
    } catch (error) {
        alert('Error submitting details: ' + error.message);
    }
});
