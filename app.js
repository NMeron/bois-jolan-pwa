// ============================================
// APP.JS — Bois Jolan PWA · v2
// ============================================

const MESSAGES_PROFIL = {
  touriste: "Bienvenue. Prenez le temps de regarder avant de lire. Ce site vous guidera à votre rythme — chaque panneau est une invitation, pas une leçon.",
  habitant: "Vous connaissez ce lieu. Nous vous proposons de le voir autrement — avec les yeux de la science et la mémoire du quartier. Certaines choses vont vous surprendre.",
  scolaire: "Mission déclenchée. Votre terrain d'enquête est devant vous. Chaque panneau cache un indice. Bonne exploration !"
};

const COULEURS_PROFIL = {
  actif:   { bg: '#C9A227', color: '#0F2A1E', border: '#C9A227' },
  inactif: { bg: '#1A4231', color: '#F0EDE4', border: '#2D7A5F' }
};

// Au chargement
document.addEventListener('DOMContentLoaded', () => {
  const profil = localStorage.getItem('profil-bois-jolan');
  if (profil) {
    marquerBoutonActif(profil);
    afficherMessageProfil(profil);
    afficherNavigation();
    afficherProfilActif(profil);
  }
});

// Choisir un profil
function choisirProfil(profil) {
  localStorage.setItem('profil-bois-jolan', profil);
  marquerBoutonActif(profil);
  afficherMessageProfil(profil);
  afficherNavigation();
  afficherProfilActif(profil);
}

// Feedback visuel bouton
function marquerBoutonActif(profil) {
  document.querySelectorAll('#profils button').forEach(btn => {
    btn.style.background  = COULEURS_PROFIL.inactif.bg;
    btn.style.color       = COULEURS_PROFIL.inactif.color;
    btn.style.borderColor = COULEURS_PROFIL.inactif.border;
    const nom = btn.querySelector('.profil-info strong');
    if (nom) nom.style.color = '#F0EDE4';
  });

  const btnActif = document.querySelector(
    `#profils button[onclick="choisirProfil('${profil}')"]`
  );
  if (btnActif) {
    btnActif.style.background  = COULEURS_PROFIL.actif.bg;
    btnActif.style.color       = COULEURS_PROFIL.actif.color;
    btnActif.style.borderColor = COULEURS_PROFIL.actif.border;
    const nom = btnActif.querySelector('.profil-info strong');
    if (nom) nom.style.color = '#0F2A1E';
  }
}

// Message personnalisé
function afficherMessageProfil(profil) {
  const el = document.getElementById('message-profil');
  if (el && MESSAGES_PROFIL[profil]) {
    el.textContent = MESSAGES_PROFIL[profil];
    el.style.display = 'block';
  }
}

// Afficher la navigation panneaux
function afficherNavigation() {
  const nav = document.getElementById('navigation');
  if (nav) nav.style.display = 'block';
}

// Bandeau profil actif (pages panneaux)
function afficherProfilActif(profil) {
  const labels = {
    touriste: '🌊 Touriste',
    habitant: '🌿 Habitant',
    scolaire: '📚 Scolaire'
  };
  const el = document.getElementById('profil-actif');
  if (el) {
    el.textContent = 'Profil actif : ' + labels[profil];
    el.style.display = 'block';
  }

  document.querySelectorAll('.section-profil').forEach(s => {
    s.style.display = 'none';
  });
  const section = document.getElementById('profil-' + profil);
  if (section) section.style.display = 'block';
}

// Réinitialiser
function changerProfil() {
  localStorage.removeItem('profil-bois-jolan');
  window.location.href = '/index.html';
}