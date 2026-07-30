// ============================================================
// FDTC PLATFORM — Configuration Supabase
// Remplace SUPABASE_URL et SUPABASE_ANON_KEY par tes vraies valeurs
// ============================================================

const SUPABASE_URL = 'https://ldhisdbelwjbhaikwvlm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkaGlzZGJlbHdqYmhhaWt3dmxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODYzNzgsImV4cCI6MjA5OTQ2MjM3OH0.nehYudNAFIUOpPfiXsGPshgMvshwUiOI-k0ChU0TE1w';

// Import Supabase client (chargé via CDN dans chaque page HTML)
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// ============================================================
// STATUTS DES COMMANDES
// ============================================================
const ORDER_STATUSES = {
  en_attente:   { label: 'En attente de paiement', color: '#6b6962', icon: '⏳' },
  acompte_recu: { label: 'Acompte reçu',           color: '#FDB830', icon: '💰' },
  en_cours:     { label: 'En cours de réalisation', color: '#1E90FF', icon: '🔧' },
  revision:     { label: 'En révision',             color: '#FF7F00', icon: '🔄' },
  livre:        { label: 'Livré',                   color: '#7cc98a', icon: '✅' },
  annule:       { label: 'Annulé',                  color: '#e05c5c', icon: '❌' }
};

// ============================================================
// SERVICES ET FORMULES (prix fixes)
// ============================================================
const SERVICE_CATALOG = {
  "Graphisme - Basic":              { price: 12000,  usd: 20,  delay: "2–3 jours" },
  "Graphisme - Standard":           { price: 25000,  usd: 40,  delay: "3–5 jours" },
  "Graphisme - Premium":            { price: 45000,  usd: 75,  delay: "5–7 jours" },
  "Site WordPress - Basic":         { price: 45000,  usd: 75,  delay: "5–7 jours" },
  "Site WordPress - Standard":      { price: 100000, usd: 165, delay: "7–10 jours" },
  "Site WordPress - Premium":       { price: 200000, usd: 330, delay: "10–12 jours" },
  "Boutique Shopify - Basic":       { price: 70000,  usd: 115, delay: "7–10 jours" },
  "Boutique Shopify - Premium":     { price: 160000, usd: 265, delay: "12–18 jours" },
  "Publicités Facebook - Basic":    { price: 20000,  usd: 35,  delay: "1–2 jours" },
  "Publicités Facebook - Premium":  { price: 60000,  usd: 100, delay: "2–4 jours" },
  "Automatisation IA - Basic":      { price: 35000,  usd: 60,  delay: "5–7 jours" },
  "Automatisation IA - Premium":    { price: 110000, usd: 180, delay: "8–10 jours" },
  "Contenu & Ebooks - Basic":       { price: 6000,   usd: 10,  delay: "2 jours" },
  "Contenu & Ebooks - Premium":     { price: 50000,  usd: 85,  delay: "7–14 jours" },
  "Service technique - Basic":      { price: 6000,   usd: null, delay: "1 jour" },
  "Service technique - Premium":    { price: 12000,  usd: null, delay: "1 jour" }
};

// ============================================================
// UTILITAIRES
// ============================================================

// Nettoyer les entrées utilisateur (protection XSS basique)
function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Formater un montant
function formatFCFA(amount) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

// Formater une date
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

// Rate limiting local (anti-spam formulaire)
const _rateLimits = {};
function checkRateLimit(key, limitMs = 30000) {
  const now = Date.now();
  if (_rateLimits[key] && now - _rateLimits[key] < limitMs) {
    const wait = Math.ceil((limitMs - (now - _rateLimits[key])) / 1000);
    return { allowed: false, wait };
  }
  _rateLimits[key] = now;
  return { allowed: true };
}

// Vérifier si l'utilisateur est connecté
async function requireAuth(redirectTo = 'auth.html') {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

// Vérifier si l'utilisateur est admin
async function requireAdmin(redirectTo = 'dashboard.html') {
  const session = await requireAuth();
  if (!session) return null;
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

// Enregistrer un consentement RGPD
async function logConsent(userId, consentType, consented) {
  await db.from('consent_log').insert({
    user_id: userId,
    consent_type: consentType,
    consented,
    user_agent: navigator.userAgent.slice(0, 200)
  });
}
