// Configuration Supabase
const SUPABASE_URL = 'https://aurtzeinxytjshxodnxv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cnR6ZWlueHl0anNoeG9kbnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDAzMzMsImV4cCI6MjA2Nzg3NjMzM30.NtXt7RPYLYNQ5VxtRX8rKngZJ62-Nh5mLehIbQyY4Ho';

// Client Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales
let credits = [];
let isEditing = false;
let editingId = null;

// Éléments DOM
const creditForm = document.getElementById('creditForm');
const nomInput = document.getElementById('nom');
const capitalInput = document.getElementById('capital');
const mensualiteInput = document.getElementById('mensualite');
const datePrelevementInput = document.getElementById('datePrelevement');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const prixVenteInput = document.getElementById('prixVente');
const dateFutureInput = document.getElementById('dateFuture');
const creditsList = document.getElementById('creditsList');
const totalCapitalEl = document.getElementById('totalCapital');
const totalMensualitesEl = document.getElementById('totalMensualites');
const totalMensualitesHeaderEl = document.getElementById('totalMensualitesHeader');
const montantNetEl = document.getElementById('montantNet');
const futureEstimationEl = document.getElementById('futureEstimation');
const capitalFuturEl = document.getElementById('capitalFutur');
const montantNetFuturEl = document.getElementById('montantNetFutur');

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', async () => {
    await loadCredits();
    setupEventListeners();
    updateCalculations();
    
    // Définir la date d'aujourd'hui comme minimum pour la date future
    const today = new Date().toISOString().split('T')[0];
    dateFutureInput.min = today;
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    creditForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
    prixVenteInput.addEventListener('input', updateCalculations);
    dateFutureInput.addEventListener('change', updateFutureEstimation);
    
    // Sauvegarder le prix de vente dans localStorage avec debounce
    let prixVenteTimeout;
    prixVenteInput.addEventListener('input', () => {
        clearTimeout(prixVenteTimeout);
        prixVenteTimeout = setTimeout(() => {
            const value = prixVenteInput.value;
            if (value && value !== '0') {
                localStorage.setItem('prixVente', value);
                showNotification('Prix de vente sauvegardé', 'success');
            } else {
                localStorage.removeItem('prixVente');
            }
        }, 1000); // Attendre 1 seconde après la dernière saisie
    });
    
    // Charger et restaurer le prix de vente sauvegardé
    loadSavedPrixVente();
}

// Chargement et restauration du prix de vente sauvegardé
function loadSavedPrixVente() {
    const savedPrixVente = localStorage.getItem('prixVente');
    if (savedPrixVente && savedPrixVente !== '0') {
        prixVenteInput.value = savedPrixVente;
        // Déclencher les calculs avec la valeur restaurée
        updateCalculations();
        showNotification(`Prix de vente restauré : ${formatCurrency(parseFloat(savedPrixVente))}`, 'info');
    }
}

// Chargement des crédits depuis Supabase
async function loadCredits() {
    try {
        const { data, error } = await supabaseClient
            .from('credits')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Erreur lors du chargement des crédits:', error);
            showNotification('Erreur lors du chargement des crédits', 'error');
            return;
        }
        
        credits = data || [];
        renderCredits();
        updateCalculations();
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showNotification('Erreur de connexion à la base de données', 'error');
    }
}

// Rendu de la liste des crédits
function renderCredits() {
    if (credits.length === 0) {
        creditsList.innerHTML = '<p class="no-credits">Aucun crédit enregistré. Ajoutez votre premier crédit ci-dessus.</p>';
        // Masquer le total des mensualités quand il n'y a pas de crédits
        totalMensualitesHeaderEl.parentElement.style.display = 'none';
        return;
    }
    
    // Afficher le total des mensualités quand il y a des crédits
    totalMensualitesHeaderEl.parentElement.style.display = 'flex';
    
    const creditsHTML = credits.map(credit => `
        <div class="credit-item ${credit.isNew ? 'new' : ''}" data-id="${credit.id}">
            <div class="credit-header">
                <h3 class="credit-name">${escapeHtml(credit.nom)}</h3>
                <div class="credit-actions">
                    <button class="btn-edit btn-small" onclick="editCredit(${credit.id})">
                        ✏️ Modifier
                    </button>
                    <button class="btn-danger btn-small" onclick="deleteCredit(${credit.id})">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
            <div class="credit-details">
                <div class="credit-detail">
                    <div class="credit-detail-label">Capital restant dû</div>
                    <div class="credit-detail-value">${formatCurrency(credit.capital_restant_du)}</div>
                </div>
                <div class="credit-detail">
                    <div class="credit-detail-label">Mensualité</div>
                    <div class="credit-detail-value">${formatCurrency(credit.mensualite)}</div>
                </div>
                <div class="credit-detail">
                    <div class="credit-detail-label">Date de prélèvement</div>
                    <div class="credit-detail-value">${credit.date_prelevement ? formatDate(credit.date_prelevement) : 'Non définie'}</div>
                </div>
            </div>
        </div>
    `).join('');
    
    creditsList.innerHTML = creditsHTML;
    
    // Supprimer la classe 'new' après l'animation
    setTimeout(() => {
        credits.forEach(credit => credit.isNew = false);
    }, 500);
}

// Gestion de la soumission du formulaire
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nom: nomInput.value.trim(),
        capital_restant_du: parseFloat(capitalInput.value),
        mensualite: parseFloat(mensualiteInput.value),
        date_prelevement: datePrelevementInput.value
    };
    
    // Validation
    if (!formData.nom || formData.capital_restant_du <= 0 || formData.mensualite <= 0 || !formData.date_prelevement) {
        showNotification('Veuillez remplir tous les champs avec des valeurs valides', 'error');
        return;
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = isEditing ? 'Modification...' : 'Ajout...';
        
        if (isEditing) {
            await updateCredit(editingId, formData);
        } else {
            await createCredit(formData);
        }
        
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        showNotification('Une erreur est survenue', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isEditing ? 'Modifier le crédit' : 'Ajouter le crédit';
    }
}

// Création d'un nouveau crédit
async function createCredit(creditData) {
    const { data, error } = await supabaseClient
        .from('credits')
        .insert([creditData])
        .select();
    
    if (error) {
        throw error;
    }
    
    // Marquer comme nouveau pour l'animation
    data[0].isNew = true;
    credits.unshift(data[0]);
    
    renderCredits();
    updateCalculations();
    resetForm();
    showNotification('Crédit ajouté avec succès', 'success');
}

// Modification d'un crédit existant
async function updateCredit(id, creditData) {
    const { data, error } = await supabaseClient
        .from('credits')
        .update(creditData)
        .eq('id', id)
        .select();
    
    if (error) {
        throw error;
    }
    
    const index = credits.findIndex(c => c.id === id);
    if (index !== -1) {
        credits[index] = data[0];
    }
    
    renderCredits();
    updateCalculations();
    resetForm();
    showNotification('Crédit modifié avec succès', 'success');
}

// Suppression d'un crédit
async function deleteCredit(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce crédit ?')) {
        return;
    }
    
    const { error } = await supabaseClient
        .from('credits')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
        return;
    }
    
    credits = credits.filter(c => c.id !== id);
    renderCredits();
    updateCalculations();
    showNotification('Crédit supprimé avec succès', 'success');
}

// Modification d'un crédit
function editCredit(id) {
    const credit = credits.find(c => c.id === id);
    if (!credit) return;
    
    nomInput.value = credit.nom;
    capitalInput.value = credit.capital_restant_du;
    mensualiteInput.value = credit.mensualite;
    datePrelevementInput.value = credit.date_prelevement || '';
    
    isEditing = true;
    editingId = id;
    submitBtn.textContent = 'Modifier le crédit';
    cancelBtn.style.display = 'inline-block';
    
    // Faire défiler vers le formulaire
    document.querySelector('.credit-form').scrollIntoView({ behavior: 'smooth' });
}

// Annulation de la modification
function cancelEdit() {
    resetForm();
}

// Réinitialisation du formulaire
function resetForm() {
    creditForm.reset();
    nomInput.value = '';
    capitalInput.value = '';
    mensualiteInput.value = '';
    datePrelevementInput.value = '';
    isEditing = false;
    editingId = null;
    submitBtn.textContent = 'Ajouter le crédit';
    cancelBtn.style.display = 'none';
}

// Mise à jour des calculs
function updateCalculations() {
    const totalCapital = credits.reduce((sum, credit) => sum + parseFloat(credit.capital_restant_du), 0);
    const totalMensualites = credits.reduce((sum, credit) => sum + parseFloat(credit.mensualite), 0);
    const prixVente = parseFloat(prixVenteInput.value) || 0;
    const montantNet = prixVente - totalCapital;
    
    totalCapitalEl.textContent = formatCurrency(totalCapital);
    totalMensualitesEl.textContent = formatCurrency(totalMensualites);
    totalMensualitesHeaderEl.textContent = formatCurrency(totalMensualites);
    montantNetEl.textContent = formatCurrency(montantNet);
    
    // Changer la couleur selon si c'est positif ou négatif
    montantNetEl.style.color = montantNet >= 0 ? '#28a745' : '#dc3545';
    
    updateFutureEstimation();
}

// Mise à jour de l'estimation future
function updateFutureEstimation() {
    const dateFuture = dateFutureInput.value;
    const prixVente = parseFloat(prixVenteInput.value) || 0;
    
    if (!dateFuture || prixVente <= 0) {
        futureEstimationEl.innerHTML = '<p>Veuillez définir une date future et un prix de vente pour voir l\'estimation.</p>';
        return;
    }
    
    const today = new Date();
    const targetDate = new Date(dateFuture);
    const monthsUntilSale = getMonthsBetweenDates(today, targetDate);
    
    if (monthsUntilSale <= 0) {
        futureEstimationEl.innerHTML = '<p>Veuillez sélectionner une date future.</p>';
        return;
    }
    
    let totalCapitalFutur = 0;
    let creditsRembourses = [];
    let creditsEnCours = [];
    let sommeLiberee = 0;
    
    credits.forEach(credit => {
        const capitalActuel = parseFloat(credit.capital_restant_du);
        const mensualite = parseFloat(credit.mensualite);
        const datePrelevement = credit.date_prelevement ? new Date(credit.date_prelevement) : null;
        
        // Calculer le nombre de mois de remboursement en tenant compte de la date de prélèvement
        let monthsToCalculate = monthsUntilSale;
        if (datePrelevement) {
            const nextPrelevement = getNextPrelevementDate(credit.date_prelevement);
            if (nextPrelevement && nextPrelevement > targetDate) {
                // Si le prochain prélèvement est après la date de vente, ajuster le calcul
                monthsToCalculate = Math.max(0, getMonthsBetweenDates(nextPrelevement, targetDate));
            }
        }
        
        const totalRembourse = mensualite * monthsToCalculate;
        const capitalFutur = Math.max(0, capitalActuel - totalRembourse);
        
        if (capitalFutur === 0 && capitalActuel > 0) {
            // Crédit complètement remboursé
            creditsRembourses.push({
                nom: credit.nom,
                capitalLibere: capitalActuel,
                moisPourSolder: Math.ceil(capitalActuel / mensualite)
            });
            sommeLiberee += capitalActuel;
        } else if (capitalFutur > 0) {
            // Crédit encore en cours
            creditsEnCours.push({
                nom: credit.nom,
                capitalRestant: capitalFutur,
                capitalRembourse: capitalActuel - capitalFutur
            });
        }
        
        totalCapitalFutur += capitalFutur;
    });
    
    const montantNetFutur = prixVente - totalCapitalFutur;
    
    // Mise à jour de l'affichage avec les détails
    updateFutureEstimationDisplay({
        totalCapitalFutur,
        montantNetFutur,
        creditsRembourses,
        creditsEnCours,
        sommeLiberee,
        monthsUntilSale,
        dateFuture
    });
    
    futureEstimationEl.style.display = 'block';
}

// Affichage détaillé de l'estimation future
function updateFutureEstimationDisplay(data) {
    const {
        totalCapitalFutur,
        montantNetFutur,
        creditsRembourses,
        creditsEnCours,
        sommeLiberee,
        monthsDiff,
        dateFuture
    } = data;
    
    // Mise à jour des montants principaux
    capitalFuturEl.textContent = formatCurrency(totalCapitalFutur);
    montantNetFuturEl.textContent = formatCurrency(montantNetFutur);
    montantNetFuturEl.style.color = montantNetFutur >= 0 ? '#28a745' : '#dc3545';
    
    // Créer l'affichage détaillé
    const detailsHTML = `
        <div class="future-details">
            <div class="future-summary">
                <h4>📅 Situation dans ${monthsDiff} mois (${formatDate(dateFuture)})</h4>
            </div>
            
            ${creditsRembourses.length > 0 ? `
                <div class="credits-soldes">
                    <h5>✅ Crédits complètement remboursés (${creditsRembourses.length})</h5>
                    <div class="somme-liberee">
                        <strong>💰 Somme totale libérée : ${formatCurrency(sommeLiberee)}</strong>
                    </div>
                    <div class="credits-details">
                        ${creditsRembourses.map(credit => `
                            <div class="credit-solde-item">
                                <span class="credit-nom">${escapeHtml(credit.nom)}</span>
                                <span class="credit-libere">${formatCurrency(credit.capitalLibere)} libérés</span>
                                <span class="credit-duree">(soldé en ${credit.moisPourSolder} mois)</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${creditsEnCours.length > 0 ? `
                <div class="credits-en-cours">
                    <h5>⏳ Crédits encore en cours (${creditsEnCours.length})</h5>
                    <div class="credits-details">
                        ${creditsEnCours.map(credit => `
                            <div class="credit-cours-item">
                                <span class="credit-nom">${escapeHtml(credit.nom)}</span>
                                <span class="credit-restant">${formatCurrency(credit.capitalRestant)} restants</span>
                                <span class="credit-rembourse">(${formatCurrency(credit.capitalRembourse)} remboursés)</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="bilan-final">
                <div class="bilan-item">
                    <span>Prix de vente estimé :</span>
                    <span class="montant">${formatCurrency(parseFloat(prixVenteInput.value) || 0)}</span>
                </div>
                <div class="bilan-item">
                    <span>Capital total restant :</span>
                    <span class="montant">- ${formatCurrency(totalCapitalFutur)}</span>
                </div>
                <div class="bilan-item final">
                    <span><strong>💵 Montant net final :</strong></span>
                    <span class="montant final" style="color: ${montantNetFutur >= 0 ? '#28a745' : '#dc3545'}">
                        <strong>${formatCurrency(montantNetFutur)}</strong>
                    </span>
                </div>
            </div>
        </div>
    `;
    
    // Injecter les détails dans l'élément d'estimation future
    const existingDetails = futureEstimationEl.querySelector('.future-details');
    if (existingDetails) {
        existingDetails.remove();
    }
    
    futureEstimationEl.insertAdjacentHTML('beforeend', detailsHTML);
}

// Fonctions utilitaires
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Calculer le nombre de mois entre deux dates
function getMonthsBetweenDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();
    
    // Ajuster si le jour de fin est avant le jour de début dans le mois
    if (end.getDate() < start.getDate()) {
        months--;
    }
    
    return Math.max(0, months);
}

// Calculer la prochaine date de prélèvement
function getNextPrelevementDate(datePrelevement) {
    if (!datePrelevement) return null;
    
    const today = new Date();
    const prelevement = new Date(datePrelevement);
    
    // Ajuster l'année et le mois pour la prochaine occurrence
    prelevement.setFullYear(today.getFullYear());
    prelevement.setMonth(today.getMonth());
    
    // Si la date est déjà passée ce mois-ci, passer au mois suivant
    if (prelevement < today) {
        prelevement.setMonth(prelevement.getMonth() + 1);
    }
    
    return prelevement;
}

function showNotification(message, type = 'info') {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Styles pour la notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '1000',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        transform: 'translateX(350px)',
        transition: 'transform 0.3s ease'
    });
    
    // Couleurs selon le type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression automatique
    setTimeout(() => {
        notification.style.transform = 'translateX(350px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error);
    showNotification('Une erreur inattendue s\'est produite', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesse rejetée:', e.reason);
    showNotification('Erreur de connexion', 'error');
});

// Export pour les tests (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatDate,
        escapeHtml
    };
}
