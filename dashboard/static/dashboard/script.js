let ytPlayers = {};
let mainMusicPlayer;

function onYouTubeIframeAPIReady() {
    // Initialize Main Music Player
    mainMusicPlayer = new YT.Player('main-music-player', {
        height: '0',
        width: '0',
        videoId: 'jfKfPfyJRdk', 
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'showinfo': 0,
            'origin': window.location.origin
        },
        events: {
            'onReady': (event) => {
                event.target.setVolume(50);
                document.getElementById('music-title').innerText = "Lofi Girl - beats to relax/study to";
            },
            'onStateChange': (event) => {
                const btn = document.getElementById('music-play-btn');
                if (event.data === YT.PlayerState.PLAYING) {
                    if (btn) btn.textContent = '⏸';
                    const videoData = event.target.getVideoData();
                    if (videoData && videoData.title) {
                        document.getElementById('music-title').innerText = videoData.title;
                    }
                } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                    if (btn) btn.textContent = '▶';
                }
            }
        }
    });

    const soundCards = document.querySelectorAll('.sound-card');
    
    soundCards.forEach(card => {
        const soundId = card.getAttribute('data-id');
        const url = card.getAttribute('data-url');
        
        if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
            // Extract video ID
            let videoId = '';
            if (url.includes('v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            }

            if (videoId) {
                ytPlayers[soundId] = new YT.Player(`yt-player-${soundId}`, {
                    height: '0',
                    width: '0',
                    videoId: videoId,
                    playerVars: {
                        'autoplay': 0,
                        'controls': 0,
                        'showinfo': 0,
                        'rel': 0,
                        'loop': 1,
                        'origin': window.location.origin,
                        'playlist': videoId // required for looping single video
                    },
                    events: {
                        'onReady': (event) => {
                            event.target.setVolume(50);
                        }
                    }
                });
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Time-based Greeting
    const greetingText = document.getElementById('greeting-text');
    if (greetingText) {
        const hour = new Date().getHours();
        let greeting = 'Hello';
        if (hour >= 5 && hour < 12) {
            greeting = 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good afternoon';
        } else if (hour >= 17 && hour < 21) {
            greeting = 'Good evening';
        } else {
            greeting = 'Good night';
        }
        
        // Keep the username part intact by replacing just the first word
        const usernameHtml = greetingText.innerHTML.split(',')[1];
        if (usernameHtml) {
            greetingText.innerHTML = `${greeting}, ${usernameHtml.trim()}`;
        }
    }

    // Nav Tab Switching
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabSections = document.querySelectorAll('.tab-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons and hide all sections
            navBtns.forEach(b => b.classList.remove('active'));
            tabSections.forEach(sec => sec.style.display = 'none');

            // Add active to clicked button and show target section
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // Playlist Selector Logic
    const playlistSelect = document.getElementById('playlist-select');
    const container = document.getElementById('main-music-player-container');
    const controlsContainer = document.getElementById('music-controls-container');
    const title = document.getElementById('music-title');

    const spotifyContainer = document.getElementById('spotify-container');
    const youtubeContainer = document.getElementById('youtube-container');

    function loadPlaylist(url, name) {
        title.innerText = name;
        if (url.includes('spotify.com')) {
            const parts = url.split('spotify.com/')[1].split('?')[0].split('/');
            const type = parts[0];
            const id = parts[1];
            
            controlsContainer.style.display = 'none';
            youtubeContainer.style.display = 'none';
            spotifyContainer.style.display = 'block';
            
            spotifyContainer.innerHTML = `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
            
            if (mainMusicPlayer && typeof mainMusicPlayer.stopVideo === 'function') {
                mainMusicPlayer.stopVideo();
            }
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            controlsContainer.style.display = 'flex';
            spotifyContainer.style.display = 'none';
            youtubeContainer.style.display = 'block';
            spotifyContainer.innerHTML = '';
            
            let videoId = '';
            let listId = '';
            
            if (url.includes('list=')) {
                listId = url.split('list=')[1].split('&')[0];
            } else if (url.includes('v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            }

            if (mainMusicPlayer && typeof mainMusicPlayer.loadPlaylist === 'function') {
                if (listId) {
                    mainMusicPlayer.loadPlaylist({list: listId, listType: 'playlist'});
                } else if (videoId) {
                    mainMusicPlayer.loadVideoById(videoId);
                }
            } else {
                // If mainMusicPlayer isn't ready yet, we can set default values in the global scope
                // but since it initializes to Lofi Girl by default, it's safer to wait.
                setTimeout(() => loadPlaylist(url, name), 500);
            }
        }
    }

    if (playlistSelect) {
        playlistSelect.addEventListener('change', (e) => {
            const selectedOpt = playlistSelect.options[playlistSelect.selectedIndex];
            loadPlaylist(e.target.value, selectedOpt.text);
        });
        // Initial load
        const selectedOpt = playlistSelect.options[playlistSelect.selectedIndex];
        if (selectedOpt && selectedOpt.value) {
            // Delay slightly to let YT API initialize if it's a YT link
            setTimeout(() => loadPlaylist(selectedOpt.value, selectedOpt.text), 1000);
        }
    }

    // Main Music Player Controls
    const musicPlayBtn = document.getElementById('music-play-btn');
    const musicPrevBtn = document.getElementById('music-prev-btn');
    const musicNextBtn = document.getElementById('music-next-btn');
    const musicVolume = document.getElementById('music-volume');

    if (musicPlayBtn) {
        musicPlayBtn.addEventListener('click', () => {
            if (mainMusicPlayer && typeof mainMusicPlayer.getPlayerState === 'function') {
                const state = mainMusicPlayer.getPlayerState();
                if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
                    mainMusicPlayer.pauseVideo();
                    musicPlayBtn.textContent = '▶';
                } else {
                    mainMusicPlayer.playVideo();
                    musicPlayBtn.textContent = '⏸';
                }
            }
        });
    }

    if (musicPrevBtn) {
        musicPrevBtn.addEventListener('click', () => {
            if (mainMusicPlayer && typeof mainMusicPlayer.previousVideo === 'function') {
                mainMusicPlayer.previousVideo();
                musicPlayBtn.textContent = '⏸';
            }
        });
    }

    if (musicNextBtn) {
        musicNextBtn.addEventListener('click', () => {
            if (mainMusicPlayer && typeof mainMusicPlayer.nextVideo === 'function') {
                mainMusicPlayer.nextVideo();
                musicPlayBtn.textContent = '⏸';
            }
        });
    }

    if (musicVolume) {
        musicVolume.addEventListener('input', (e) => {
            if (mainMusicPlayer && typeof mainMusicPlayer.setVolume === 'function') {
                mainMusicPlayer.setVolume(e.target.value * 100);
            }
        });
    }

    const playToggles = document.querySelectorAll('.play-toggle');
    const volumeSliders = document.querySelectorAll('.volume-slider');

    // Handle Play/Pause
    playToggles.forEach(button => {
        button.addEventListener('click', () => {
            const soundId = button.getAttribute('data-id');
            const card = document.querySelector(`.sound-card[data-id="${soundId}"]`);
            const url = card.getAttribute('data-url');
            
            const isYT = url.includes('youtube.com') || url.includes('youtu.be');
            const bubble = document.querySelector(`.bubble-${soundId}`);
            const bgVideo = document.getElementById(`yt-player-${soundId}`);

            if (isYT) {
                const player = ytPlayers[soundId];
                if (player && typeof player.getPlayerState === 'function') {
                    const state = player.getPlayerState();
                    if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
                        player.pauseVideo();
                        card.classList.remove('active');
                        if (bubble) bubble.classList.remove('active');
                        if (bgVideo) bgVideo.classList.remove('active-bg');
                    } else {
                        player.playVideo();
                        card.classList.add('active');
                        if (bubble) bubble.classList.add('active');
                        if (bgVideo) bgVideo.classList.add('active-bg');
                    }
                }
            } else {
                const audio = document.getElementById(`audio-${soundId}`);
                if (audio.paused) {
                    audio.play();
                    card.classList.add('active');
                    if (bubble) bubble.classList.add('active');
                } else {
                    audio.pause();
                    card.classList.remove('active');
                    if (bubble) bubble.classList.remove('active');
                }
            }
            
            updateBackgroundBlending();
        });
    });

    function updateBackgroundBlending() {
        const activeBgs = document.querySelectorAll('.bg-video.active-bg');
        const count = activeBgs.length;
        
        // Hide all first
        document.querySelectorAll('.bg-video').forEach(v => {
            if (!v.classList.contains('active-bg')) {
                v.style.opacity = '0';
            }
        });

        if (count === 0) return;

        // Apply equal fractional opacity
        activeBgs.forEach((v, index) => {
            v.style.opacity = (1 / (index + 1)).toString();
        });
    }

    // Handle Volume
    volumeSliders.forEach(slider => {
        const soundId = slider.getAttribute('data-id');
        const card = document.querySelector(`.sound-card[data-id="${soundId}"]`);
        const url = card.getAttribute('data-url');
        const isYT = url.includes('youtube.com') || url.includes('youtu.be');
        
        if (!isYT) {
            const audioEl = document.getElementById(`audio-${soundId}`);
            audioEl.volume = slider.value;
        }

        slider.addEventListener('input', (e) => {
            if (isYT) {
                const player = ytPlayers[soundId];
                if (player && typeof player.setVolume === 'function') {
                    player.setVolume(e.target.value * 100);
                }
            } else {
                const audioEl = document.getElementById(`audio-${soundId}`);
                audioEl.volume = e.target.value;
            }
        });
    });
});
