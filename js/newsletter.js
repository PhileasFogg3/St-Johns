fetch('/api/newsletter')
    .then(res => res.json())
    .then(data => {
    if (data.archiveUrl) {
        document.getElementById('newsletterFrame').src = data.archiveUrl;
    } else {
        document.getElementById('newsletterFrame').outerHTML = '<p>No newsletter found.</p>';
    }
    })
    .catch(err => {
    console.error('Newsletter fetch error:', err);
    document.getElementById('newsletterFrame').outerHTML = '<p>Error loading newsletter.</p>';
    });