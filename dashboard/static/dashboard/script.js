let ytPlayers = {};
let mainMusicPlayer;

function onYouTubeIframeAPIReady() {
    // Initialize Main Music Player Safely
    const mainPlayerNode = document.getElementById('main-music-player');
    if (mainPlayerNode && mainPlayerNode.tagName !== 'IFRAME') {
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
                    event.target.setVolume(100);
                },
                'onStateChange': (event) => {
                    const btn = document.getElementById('music-play-btn');
                    const playSVG = '<svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
                    const pauseSVG = '<svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                    if (event.data === YT.PlayerState.PLAYING) {
                        if (btn) btn.innerHTML = pauseSVG;
                        const videoData = event.target.getVideoData();
                        if (videoData && videoData.title) {
                            document.getElementById('music-title').innerText = videoData.title;
                        }
                    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                        if (btn) btn.innerHTML = playSVG;
                    }
                }
            }
        });
    }

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
                const playerNode = document.getElementById(`yt-player-${soundId}`);
                if (playerNode && playerNode.tagName !== 'IFRAME') {
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
                                event.target.setVolume(100);
                            }
                        }
                    });
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Theme Switcher Logic
    const themeSelector = document.getElementById('theme-selector');
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeSelector) {
            themeSelector.value = theme;
        }
        localStorage.setItem('ambient_theme', theme);
    }
    
    // Initialize Theme
    const savedTheme = localStorage.getItem('ambient_theme') || 'midnight';
    applyTheme(savedTheme);

    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }

    // Clock Update
    function updateClock() {
        const clock = document.getElementById('clock-display');
        if (clock) {
            const now = new Date();
            clock.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

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

            if (mainMusicPlayer && typeof mainMusicPlayer.cuePlaylist === 'function') {
                if (listId) {
                    mainMusicPlayer.cuePlaylist({list: listId, listType: 'playlist'});
                } else if (videoId) {
                    mainMusicPlayer.cueVideoById(videoId);
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
                const playSVG = '<svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
                const pauseSVG = '<svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
                    mainMusicPlayer.pauseVideo();
                    musicPlayBtn.innerHTML = playSVG;
                } else {
                    mainMusicPlayer.playVideo();
                    musicPlayBtn.innerHTML = pauseSVG;
                }
            }
        });
    }

    if (musicPrevBtn) {
        musicPrevBtn.addEventListener('click', () => {
            if (mainMusicPlayer && typeof mainMusicPlayer.previousVideo === 'function') {
                mainMusicPlayer.previousVideo();
                const pauseSVG = '<svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                musicPlayBtn.innerHTML = pauseSVG;
            }
        });
    }

    if (musicNextBtn) {
        musicNextBtn.addEventListener('click', () => {
            if (mainMusicPlayer && typeof mainMusicPlayer.nextVideo === 'function') {
                mainMusicPlayer.nextVideo();
                const pauseSVG = '<svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                musicPlayBtn.innerHTML = pauseSVG;
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

    function attachMediaListeners() {
        const playToggles = document.querySelectorAll('.play-toggle');
        const volumeSliders = document.querySelectorAll('.volume-slider');

        // Handle Play/Pause
        playToggles.forEach(button => {
            // Remove previous listener by replacing node if necessary, but since these are freshly injected DOM elements, we can just attach.
            // But to be safe, clone the button to strip any existing listeners:
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            newButton.addEventListener('click', () => {
                const soundId = newButton.getAttribute('data-id');
                const card = document.querySelector(`.sound-card[data-id="${soundId}"]`);
                if (!card) return;
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
                    if (audio && audio.paused) {
                        audio.play();
                        card.classList.add('active');
                        if (bubble) bubble.classList.add('active');
                    } else if (audio) {
                        audio.pause();
                        card.classList.remove('active');
                        if (bubble) bubble.classList.remove('active');
                    }
                }
                
                updateBackgroundBlending();
            });
        });

        // Handle Volume
        volumeSliders.forEach(slider => {
            const newSlider = slider.cloneNode(true);
            if (slider.parentNode) {
                slider.parentNode.replaceChild(newSlider, slider);
            }
            
            const soundId = newSlider.getAttribute('data-id');
            const card = document.querySelector(`.sound-card[data-id="${soundId}"]`);
            if (!card) return;
            const url = card.getAttribute('data-url');
            const isYT = url.includes('youtube.com') || url.includes('youtu.be');
            
            if (!isYT) {
                const audioEl = document.getElementById(`audio-${soundId}`);
                if (audioEl) audioEl.volume = newSlider.value;
            }

            newSlider.addEventListener('input', (e) => {
                if (isYT) {
                    const player = ytPlayers[soundId];
                    if (player && typeof player.setVolume === 'function') {
                        player.setVolume(e.target.value * 100);
                    }
                } else {
                    const audioEl = document.getElementById(`audio-${soundId}`);
                    if (audioEl) audioEl.volume = e.target.value;
                }
            });
        });
    }

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

    attachMediaListeners();

    // ----------------------------------------------------
    // AJAX & Modal Logic (Seamless SPA Editing)
    // ----------------------------------------------------
    const modal = document.getElementById('global-modal');
    const modalContent = document.getElementById('global-modal-content');

    window.openModal = async function(url) {
        if (!modal) return;
        modalContent.innerHTML = '<div style="text-align:center; padding: 20px;">Loading...</div>';
        modal.classList.add('active');
        
        try {
            const resp = await fetch(url);
            const text = await resp.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            // Extract the main container (which is what edit forms use)
            const mainContent = doc.querySelector('.music-player-card') || doc.querySelector('main') || doc.body;
            
            modalContent.innerHTML = `
                <button class="modal-close-btn" onclick="closeModal()">×</button>
                ${mainContent.innerHTML}
            `;
            
            // Attach AJAX submit to the modal form
            const forms = modalContent.querySelectorAll('form');
            forms.forEach(f => f.addEventListener('submit', submitAJAX));
        } catch (e) {
            modalContent.innerHTML = `<button class="modal-close-btn" onclick="closeModal()">×</button><p>Error loading content.</p>`;
        }
    };

    window.closeModal = function() {
        if (modal) modal.classList.remove('active');
    };

    // Close modal if clicked outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    window.submitAJAX = async function(e) {
        e.preventDefault();
        
        const form = e.target;
        if(form.action && form.action.includes('delete') && !confirm("Are you sure?")) {
            return;
        }

        const formData = new FormData(form);
        const actionUrl = form.action || window.location.href;
        
        // Add submit button value if clicked (for forms with multiple submit buttons like action=add vs action=set_default)
        if (e.submitter && e.submitter.name) {
            formData.append(e.submitter.name, e.submitter.value);
        }
        
        try {
            const response = await fetch(actionUrl, {
                method: form.method || 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            
            if (response.ok) {
                closeModal();
                
                // Fetch updated dashboard
                const pageResp = await fetch(window.location.href);
                const text = await pageResp.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                
                // Seamlessly swap out UI components
                const ambienceSection = document.getElementById('ambience-section');
                const playlistSection = document.getElementById('playlist-section');
                const bubbleContainer = document.querySelector('.ambience-bubbles-container');
                const selectElement = document.getElementById('playlist-select');
                
                if (ambienceSection && doc.getElementById('ambience-section')) {
                    ambienceSection.innerHTML = doc.getElementById('ambience-section').innerHTML;
                }
                if (playlistSection && doc.getElementById('playlist-section')) {
                    playlistSection.innerHTML = doc.getElementById('playlist-section').innerHTML;
                }
                if (bubbleContainer && doc.querySelector('.ambience-bubbles-container')) {
                    bubbleContainer.innerHTML = doc.querySelector('.ambience-bubbles-container').innerHTML;
                }
                if (selectElement && doc.getElementById('playlist-select')) {
                    selectElement.innerHTML = doc.getElementById('playlist-select').innerHTML;
                }
                
                // Re-bind logic
                bindForms();
                
                // Minor hack: if they added a new sound, the iframe wasn't created yet.
                // Re-running onYouTubeIframeAPIReady will safely initialize any NEW iframes!
                if (typeof onYouTubeIframeAPIReady === 'function') {
                    onYouTubeIframeAPIReady();
                }
            }
        } catch(err) {
            console.error('AJAX Error:', err);
        }
    };

    function bindForms() {
        // Bind forms on the main page
        document.querySelectorAll('#ambience-section form, #playlist-section form').forEach(f => {
            f.removeEventListener('submit', submitAJAX);
            f.addEventListener('submit', submitAJAX);
        });
        
        // Bind Edit Links
        document.querySelectorAll('a[href*="/edit/"]').forEach(link => {
            // Remove previous event listeners by cloning
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                openModal(this.href);
            });
        });
        
        // Rebind play toggles (since the HTML got replaced)
        attachMediaListeners();
    }

    bindForms();
});
