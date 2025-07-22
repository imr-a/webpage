function searchEpisodes() {
    const input = document.getElementById('search').value.toLowerCase();
    const episodes = document.querySelectorAll('.episode');
    episodes.forEach(episode => {
        const title = episode.querySelector('h3').textContent.toLowerCase();
        episode.style.display = title.includes(input) ? 'block' : 'none';
    });
}

// Add click event to each episode card to open modal
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.episode').forEach((episode, idx) => {
        episode.addEventListener('click', function(e) {
            // Prevent double trigger if button is clicked
            if (e.target.tagName.toLowerCase() === 'button') return;
            // Episode numbers are 1-based in episodeData
            showEpisodeModal(idx + 1);
        });
    });
});
