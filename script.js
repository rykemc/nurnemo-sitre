const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const discordButton = document.querySelector('#discord-button');
const toast = document.querySelector('.toast');
const privacyModal = document.querySelector('#privacy-modal');
const privacyOpen = document.querySelector('#privacy-open');
const headerPrivacyOpen = document.querySelector('#header-privacy-open');
const mobilePrivacyOpen = document.querySelector('#mobile-privacy-open');
const privacyClose = document.querySelector('#privacy-close');
const liveLabel = document.querySelector('.live-label');
const streamCategory = document.querySelector('#stream-category');

document.querySelectorAll('.brand-mark img').forEach((logo) => {
  logo.addEventListener('error', () => {
    const logoParent = logo.parentElement;
    logo.remove();
    logoParent.classList.add('logo-fallback');
    logoParent.textContent = 'N';
  }, { once: true });
});

let twitchPlayer;

function updateTwitchEmbeds(channel) {
  const parent = window.location.hostname || 'localhost';
  const chat = document.querySelector('#twitch-chat');
  chat.src = `https://www.twitch.tv/embed/${channel}/chat?parent=${encodeURIComponent(parent)}&darkpopout`;
  if (!window.Twitch || !window.Twitch.Player) return;

  twitchPlayer = new Twitch.Player('twitch-player-container', {
    channel,
    width: '100%',
    height: '100%',
    parent: [parent]
  });
  twitchPlayer.addEventListener(Twitch.Player.ONLINE, () => {
    liveLabel.classList.add('is-live');
    streamCategory.textContent = 'LIVE AUF TWITCH';
  });
  twitchPlayer.addEventListener(Twitch.Player.OFFLINE, () => {
    liveLabel.classList.remove('is-live');
    streamCategory.textContent = 'OFFLINE — SCHAU DIR DIE CLIPS AN';
  });
}

menuButton.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen ? 'Schließen' : 'Menü';
});

document.addEventListener('click', (event) => {
  if (!mobileNav.classList.contains('open') || mobileNav.contains(event.target) || menuButton.contains(event.target)) return;
  mobileNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menü';
});

document.querySelectorAll('.mobile-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = 'Menü';
  });
});

discordButton.addEventListener('click', () => {
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 2600);
});

async function loadStreamerData() {
  const response = await fetch('data.json');
  const { streamer } = await response.json();
  const twitchUrl = streamer.social_media.twitch.main_channel;
  const youtubeUrl = streamer.social_media.youtube.main_channel.url;

  document.title = `${streamer.name} — live auf Twitch`;
  document.querySelectorAll('.brand span:last-child').forEach((brandName) => {
    brandName.textContent = streamer.name;
  });
  const logo = document.querySelector('#brand-logo');
  logo.src = new URL(streamer.logo, document.baseURI).href;
  document.querySelector('.eyebrow').lastChild.textContent = ` ${twitchUrl.replace('https://www.twitch.tv/', 'twitch.tv/')}`;
  document.querySelector('#hero-description').textContent = `${streamer.primary_game}, Multiplayer-Projekte und die Sorte Abende, aus denen Clips entstehen.`;
  document.querySelector('#hero-language').textContent = streamer.language === 'de-DE' ? 'DE' : streamer.language;
  document.querySelector('#hero-game').textContent = streamer.primary_game;
  document.querySelector('#stream-category').textContent = `${streamer.primary_game.toUpperCase()} / ONLINE`;
  document.querySelector('#hero-twitch').href = twitchUrl;
  document.querySelector('#hero-youtube').href = youtubeUrl;
  document.querySelector('#schedule-twitch').href = twitchUrl;
  document.querySelector('#secondary-twitch').href = streamer.social_media.twitch.secondary_channel_24_7;

  const focusTicker = document.querySelector('#focus-ticker');
  focusTicker.innerHTML = '';
  [...streamer.content_focus, ...streamer.content_focus].forEach((focus, index, items) => {
    const label = document.createElement('span');
    label.textContent = focus.replace('Minecraft ', '');
    focusTicker.appendChild(label);
    if (index < items.length - 1) {
      const separator = document.createElement('i');
      separator.textContent = '✦';
      focusTicker.appendChild(separator);
    }
  });

  const projectGrid = document.querySelector('#project-grid');
  projectGrid.innerHTML = '';
  streamer.known_projects.forEach((project, index) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.innerHTML = `<span class="project-number">0${index + 1}</span><strong></strong><span class="project-type">${project.toLowerCase().includes('bewerbung') ? 'application / upcoming' : 'minecraft / project'}</span>`;
    card.querySelector('strong').textContent = project;
    projectGrid.appendChild(card);
  });

  const collabList = document.querySelector('#collab-list');
  collabList.innerHTML = '';
  streamer.frequent_collaborators.forEach((collaborator) => {
    const tag = document.createElement('span');
    tag.className = 'collab-tag';
    tag.textContent = collaborator;
    collabList.appendChild(tag);
  });

  const gearGrid = document.querySelector('#gear-grid');
  gearGrid.innerHTML = '';
  Object.entries(streamer.setup).forEach(([label, value], index) => {
    const card = document.createElement('article');
    card.className = 'gear-card';
    card.innerHTML = `<span class="gear-number">0${index + 1}</span><span class="gear-label"></span><strong class="gear-value"></strong>`;
    card.querySelector('.gear-label').textContent = label;
    card.querySelector('.gear-value').textContent = value;
    gearGrid.appendChild(card);
  });

  const teamList = document.querySelector('#team-list');
  teamList.innerHTML = '';
  Object.entries(streamer.team).forEach(([role, person]) => {
    const row = document.createElement('div');
    row.className = 'team-row';
    row.innerHTML = '<span></span><strong></strong>';
    row.querySelector('span').textContent = role;
    row.querySelector('strong').textContent = person;
    teamList.appendChild(row);
  });

  const faqList = document.querySelector('#faq-list');
  faqList.innerHTML = '';
  streamer.faq.forEach((item, index) => {
    const details = document.createElement('details');
    details.className = 'faq-item';
    details.innerHTML = `<summary><span>0${index + 1}</span><strong></strong><b>+</b></summary><p></p>`;
    details.querySelector('strong').textContent = item.question;
    details.querySelector('p').textContent = item.answer;
    faqList.appendChild(details);
  });

  clips = streamer.clips || [];
  renderClips();

  updateTwitchEmbeds(twitchUrl.split('/').filter(Boolean).pop() || 'nurnemo');
}

loadStreamerData().catch(() => {
  document.querySelector('#project-grid').innerHTML = '<p class="data-error">JSON-Daten konnten nicht geladen werden.</p>';
});

document.querySelectorAll('.stream-mode').forEach((button) => {
  button.addEventListener('click', () => {
    const mode = button.dataset.mode;
    document.querySelectorAll('.stream-mode').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelector('#stream-media').classList.toggle('show-chat', mode === 'chat');
  });
});

let clips = [];

const clipsGrid = document.querySelector('#clips-grid');
const clipModal = document.querySelector('#clip-modal');
const clipFrame = document.querySelector('#clip-frame');
const clipModalTitle = document.querySelector('#clip-modal-title');

function getClipHost() {
  return window.location.hostname || 'localhost';
}

function getYouTubeEmbedUrl(source) {
  try {
    const url = new URL(source);
    if (!url.hostname.includes('youtube.com') && !url.hostname.includes('youtu.be')) return source;
    const shortsMatch = url.pathname.match(/\/shorts\/([^/]+)/);
    const embedMatch = url.pathname.match(/\/embed\/([^/]+)/);
    const watchId = url.searchParams.get('v');
    const videoId = shortsMatch?.[1] || embedMatch?.[1] || watchId || (url.hostname === 'youtu.be' ? url.pathname.slice(1) : '');
    if (!videoId) return source;
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  } catch {
    return source;
  }
}

function getClipEmbedUrl(source) {
  const normalizedSource = getYouTubeEmbedUrl(source || '');
  if (!normalizedSource.includes('twitch.tv')) return normalizedSource;
  try {
    const url = new URL(normalizedSource);
    const clipMatch = url.pathname.match(/\/clip\/([^/]+)/) || url.hostname === 'clips.twitch.tv' && url.pathname.match(/\/([^/]+)/);
    const clipSlug = url.searchParams.get('clip') || clipMatch?.[1];
    if (!clipSlug) return normalizedSource;
    return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(clipSlug)}&parent=${encodeURIComponent(getClipHost())}`;
  } catch {
    return normalizedSource;
  }
}

function getFallbackEmbedUrl(clip) {
  return getYouTubeEmbedUrl(clip.fallback_embed_url || clip.youtube_shorts_url || clip.youtube_url || '');
}

function setClipAspect(element, source) {
  element.classList.toggle('is-vertical', /youtube\.com\/shorts\//.test(source) || element.dataset.vertical === 'true');
}

function loadClipFrame(frame, clip, source, allowFallback = true) {
  const fallbackUrl = getFallbackEmbedUrl(clip);
  const embedUrl = getClipEmbedUrl(source);
  const useFallback = !fallbackUrl || embedUrl === fallbackUrl;
  const isTwitchClip = embedUrl.includes('clips.twitch.tv/embed');
  let fallbackTimer;
  frame.parentElement.dataset.vertical = String(clip.format === 'vertical' || clip.is_short === true);
  frame.onerror = () => {
    if (allowFallback && fallbackUrl && !useFallback) {
      window.clearTimeout(fallbackTimer);
      frame.classList.add('is-fallback');
      setClipAspect(frame.parentElement, fallbackUrl);
      frame.src = fallbackUrl;
    }
  };
  if (isTwitchClip && allowFallback && fallbackUrl && !useFallback) {
    fallbackTimer = window.setTimeout(() => {
      frame.dispatchEvent(new Event('error'));
    }, 10000);
  }
  setClipAspect(frame.parentElement, source);
  frame.src = embedUrl;
}

function renderClips(filter = 'popular') {
  clipsGrid.innerHTML = '';
  clips.filter((clip) => filter === 'popular' || clip.platform.toLowerCase() === 'youtube').forEach((clip) => {
    const card = document.createElement('article');
    card.className = 'clip-card';
    card.innerHTML = `<div class="clip-embed"><iframe class="clip-player" title="" src="" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="clip-card-copy"><strong></strong><small></small></div>`;
    const frame = card.querySelector('iframe');
    frame.title = clip.title;
    loadClipFrame(frame, clip, clip.twitch_embed_url || clip.embed_url);
    card.querySelector('strong').textContent = clip.title;
    card.querySelector('small').textContent = clip.platform;
    clipsGrid.appendChild(card);
  });
}

function openClip(clip) {
  clipModalTitle.textContent = clip.title;
  clipFrame.classList.remove('is-fallback');
  loadClipFrame(clipFrame, clip, clip.twitch_embed_url || clip.embed_url);
  clipModal.classList.add('open');
  clipModal.setAttribute('aria-hidden', 'false');
}

function closeClip() {
  clipModal.classList.remove('open');
  clipModal.setAttribute('aria-hidden', 'true');
  clipFrame.classList.remove('is-fallback');
  clipFrame.src = '';
}

document.querySelectorAll('.clip-filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.clip-filter').forEach((item) => item.classList.toggle('active', item === button));
    renderClips(button.dataset.filter);
  });
});
document.querySelector('#clip-modal-close').addEventListener('click', closeClip);
clipModal.addEventListener('click', (event) => {
  if (event.target === clipModal) closeClip();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeClip();
});

function closePrivacy() {
  privacyModal.classList.remove('open');
  privacyModal.setAttribute('aria-hidden', 'true');
}

privacyOpen.addEventListener('click', () => {
  privacyModal.classList.add('open');
  privacyModal.setAttribute('aria-hidden', 'false');
  privacyClose.focus();
});
[headerPrivacyOpen, mobilePrivacyOpen].forEach((button) => {
  button.addEventListener('click', () => {
    privacyModal.classList.add('open');
    privacyModal.setAttribute('aria-hidden', 'false');
    privacyClose.focus();
    mobileNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = 'Menü';
  });
});
privacyClose.addEventListener('click', closePrivacy);
privacyModal.addEventListener('click', (event) => {
  if (event.target === privacyModal) closePrivacy();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePrivacy();
});
  renderClips();

const soundFiles = {
  voicechanger: 'assets/sounds/voicechanger.mp3',
  rage: 'assets/sounds/rage.mp3',
  scream: 'assets/sounds/scream.mp3'
};
let soundUserInteraction = false;
window.addEventListener('pointerdown', () => { soundUserInteraction = true; }, { once: true, passive: true });
window.addEventListener('keydown', () => { soundUserInteraction = true; }, { once: true });

function showSoundMessage(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 1800);
}

function markSoundUnavailable(button) {
  button.classList.remove('playing');
  button.classList.add('sound-unavailable');
  button.disabled = true;
  button.setAttribute('aria-disabled', 'true');
  button.querySelector('.sound-status').textContent = '×';
  button.querySelector('.sound-status').setAttribute('aria-label', 'Sound-Datei nicht verfügbar');
}

document.querySelectorAll('.sound-button').forEach((button) => {
  button.addEventListener('click', async (event) => {
    if (!soundUserInteraction && !event.isTrusted) return;
    soundUserInteraction = true;
    if (button.disabled) return;
    button.classList.remove('playing');
    void button.offsetWidth;
    button.classList.add('playing');

    let handledError = false;
    const handleError = () => {
      if (handledError) return;
      handledError = true;
      markSoundUnavailable(button);
      showSoundMessage('Sound-Datei noch nicht hochgeladen.');
    };

    try {
      const sound = new Audio();
      sound.preload = 'none';
      sound.addEventListener('error', handleError, { once: true });
      sound.src = soundFiles[button.dataset.sound];
      await sound.play();
    } catch (error) {
      if (error?.name === 'NotAllowedError') {
        button.classList.remove('playing');
        showSoundMessage('Sound bitte direkt über den Button starten.');
      } else {
        handleError();
      }
    }
  });
});

document.querySelectorAll('.copy-command').forEach((button) => {
  button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(button.dataset.copy);
    const originalLabel = button.textContent;
    button.textContent = 'Kopiert!';
    window.setTimeout(() => { button.textContent = originalLabel; }, 1400);
  });
});

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  if (!copied) throw new Error('Clipboard unavailable');
}

document.querySelector('#copy-discord').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const originalLabel = button.textContent;
  try {
    await copyText(button.dataset.copy);
    button.textContent = 'Kopiert! ✓';
    button.classList.add('copied');
  } catch {
    button.textContent = 'Nicht möglich';
  }
  window.setTimeout(() => {
    button.textContent = originalLabel;
    button.classList.remove('copied');
  }, 1800);
});
