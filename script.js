const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const discordButton = document.querySelector('#discord-button');
const themeButton = document.querySelector('#theme-toggle');
const purpleButton = document.querySelector('#purple-toggle');
const toast = document.querySelector('.toast');
const liveLabel = document.querySelector('.live-label');
const streamCategory = document.querySelector('#stream-category');

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

const savedTheme = localStorage.getItem('nurnemo-theme') || 'dark';
const activeTheme = ['dark', 'light', 'purple'].includes(savedTheme) ? savedTheme : 'dark';
document.documentElement.dataset.theme = activeTheme;
themeButton.setAttribute('aria-pressed', String(activeTheme !== 'light' && activeTheme !== 'purple'));
themeButton.querySelector('.theme-icon').textContent = activeTheme === 'light' ? '☾' : '☼';
purpleButton.setAttribute('aria-pressed', String(activeTheme === 'purple'));

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

themeButton.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem('nurnemo-theme', nextTheme);
  themeButton.setAttribute('aria-pressed', String(nextTheme !== 'light'));
  themeButton.querySelector('.theme-icon').textContent = nextTheme === 'light' ? '☾' : '☼';
  purpleButton.setAttribute('aria-pressed', 'false');
});

purpleButton.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'purple' ? 'dark' : 'purple';
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem('nurnemo-theme', nextTheme);
  themeButton.setAttribute('aria-pressed', String(nextTheme === 'dark'));
  themeButton.querySelector('.theme-icon').textContent = '☼';
  purpleButton.setAttribute('aria-pressed', String(nextTheme === 'purple'));
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
  logo.addEventListener('error', () => {
    const logoParent = logo.parentElement;
    logo.remove();
    logoParent.textContent = streamer.name.charAt(0);
  }, { once: true });
  logo.src = streamer.logo;
  document.querySelector('.eyebrow').lastChild.textContent = ` ${twitchUrl.replace('https://www.twitch.tv/', 'twitch.tv/')}`;
  document.querySelector('#hero-description').textContent = `${streamer.primary_game}, Multiplayer-Projekte und die Sorte Abende, aus denen Clips entstehen.`;
  document.querySelector('#hero-language').textContent = streamer.language === 'de-DE' ? 'DE' : streamer.language;
  document.querySelector('#hero-game').textContent = streamer.primary_game;
  document.querySelector('#stream-category').textContent = `${streamer.primary_game.toUpperCase()} / ONLINE`;
  document.querySelector('#header-twitch').href = twitchUrl;
  document.querySelector('#hero-twitch').href = twitchUrl;
  document.querySelector('#hero-youtube').href = youtubeUrl;
  document.querySelector('#schedule-twitch').href = twitchUrl;
  document.querySelector('#secondary-twitch').href = streamer.social_media.twitch.secondary_channel_24_7;
  document.querySelector('#footer-twitch').href = twitchUrl;
  document.querySelector('#footer-youtube-main').href = youtubeUrl;
  document.querySelector('#footer-tiktok').href = streamer.social_media.tiktok;
  document.querySelector('#footer-youtube-second').href = streamer.social_media.youtube.second_channel.url;
  document.querySelector('#footer-youtube-shorts').href = streamer.social_media.youtube.shorts_channel.url;

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

function renderClips(filter = 'popular') {
  clipsGrid.innerHTML = '';
  clips.filter((clip) => filter === 'popular' || clip.platform.toLowerCase() === 'youtube').forEach((clip) => {
    const card = document.createElement('article');
    card.className = 'clip-card';
    card.innerHTML = `<div class="clip-embed"><iframe title="" src="" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="clip-card-copy"><strong></strong><small></small></div>`;
    const frame = card.querySelector('iframe');
    frame.title = clip.title;
    frame.src = clip.embed_url;
    card.querySelector('strong').textContent = clip.title;
    card.querySelector('small').textContent = clip.platform;
    clipsGrid.appendChild(card);
  });
}

function openClip(clip) {
  const parent = window.location.hostname || 'localhost';
  clipModalTitle.textContent = clip.title;
  clipFrame.src = `${clip.embed_url}${clip.embed_url.includes('?') ? '&' : '?'}parent=${encodeURIComponent(parent)}`;
  clipModal.classList.add('open');
  clipModal.setAttribute('aria-hidden', 'false');
}

function closeClip() {
  clipModal.classList.remove('open');
  clipModal.setAttribute('aria-hidden', 'true');
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
  renderClips();

const soundFiles = {
  voicechanger: 'assets/sounds/voicechanger.mp3',
  rage: 'assets/sounds/rage.mp3',
  scream: 'assets/sounds/scream.mp3'
};
document.querySelectorAll('.sound-button').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.remove('playing');
    void button.offsetWidth;
    button.classList.add('playing');
    const sound = new Audio(soundFiles[button.dataset.sound]);
    sound.play().catch(() => {
      toast.textContent = 'Sound-Datei noch nicht hochgeladen.';
      toast.classList.add('visible');
      window.setTimeout(() => toast.classList.remove('visible'), 1800);
    });
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
