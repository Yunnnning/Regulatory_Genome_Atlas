// Global variables
let currentSearchTerm = '';
let allDatasets = [];

// Initialize page after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    initializeOrganInteraction();
    initializeAnimations();
    loadDatasets();
});

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Real-time search suggestions
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            if (term.length > 2) {
                showSearchSuggestions(term);
            } else {
                hideSearchSuggestions();
            }
        });
    }
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }
    
    currentSearchTerm = searchTerm;
    
    // If on homepage, jump to atlas page with search parameters
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        window.location.href = 'atlas.html?search=' + encodeURIComponent(searchTerm);
    } else {
        // Execute search on atlas page
        filterDatasets(searchTerm);
    }
}

// Organ interaction functionality
function initializeOrganInteraction() {
    const organMarkers = document.querySelectorAll('.organ-marker');
    
    organMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const organType = this.getAttribute('data-organ');
            highlightRelatedTissues(organType);
        });
        
        marker.addEventListener('mouseenter', function() {
            showOrganTooltip(this);
        });
        
        marker.addEventListener('mouseleave', function() {
            hideOrganTooltip();
        });
    });
}

// Highlight related tissues
function highlightRelatedTissues(organType) {
    // Remove previous highlights
    document.querySelectorAll('.tissue-link').forEach(link => {
        link.classList.remove('highlight');
    });
    
    // Highlight related tissues based on organ type
    const organMappings = {
        'brain': ['brain', 'cerebral-cortex', 'pons'],
        'eye': ['eye', 'retina', 'macula-lutea'],
        'heart': ['heart', 'posterior-vena-cava'],
        'liver': ['liver-right', 'liver-left'],
        'pancreas': ['pancreas', 'islet'],
        'stomach': ['stomach', 'intestine', 'colon', 'esophagus'],
        'intestine': ['intestine', 'colon'],
        'ovary': ['ovary', 'uterus', 'vagina']
    };
    
    const relatedTissues = organMappings[organType] || [organType];
    
    relatedTissues.forEach(tissue => {
        const tissueLink = document.querySelector('a[href*="' + tissue + '"]');
        if (tissueLink) {
            tissueLink.classList.add('highlight');
        }
    });
    
    // Remove highlights after 3 seconds
    setTimeout(() => {
        document.querySelectorAll('.tissue-link').forEach(link => {
            link.classList.remove('highlight');
        });
    }, 3000);
}

// Show organ tooltip
function showOrganTooltip(element) {
    const organType = element.getAttribute('data-organ');
    const organNames = {
        'brain': 'Brain',
        'eye': 'Eye',
        'heart': 'Heart',
        'liver': 'Liver',
        'pancreas': 'Pancreas',
        'stomach': 'Stomach',
        'intestine': 'Intestine',
        'ovary': 'Ovary'
    };
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'organ-tooltip';
    tooltip.textContent = organNames[organType] || organType;
    tooltip.style.cssText = 'position: absolute; background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; pointer-events: none; z-index: 1000;';
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width/2 - tooltip.offsetWidth/2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
}

// Hide organ tooltip
function hideOrganTooltip() {
    const tooltip = document.querySelector('.organ-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Initialize animations
function initializeAnimations() {
    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    // Observe elements that need animation
    document.querySelectorAll('.tissue-category, .stat-card, .dataset-card').forEach(el => {
        observer.observe(el);
    });
}

// Load dataset data
function loadDatasets() {
    // Expanded dataset using user-provided UBERON IDs
    allDatasets = [
        // Brain/Nervous System
        {
            id: 'human_brain_001',
            technique: '10x multiomics',
            omics: 'scRNA+ATAC',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Brain',
            description: 'Comprehensive adult human brain single-cell atlas',
            source: 'BrainAtlas',
            publication: 'Nature 2024',
            cellCount: 125000,
            category: 'tissue',
            uberon: 'UBERON:0000955'
        },
        {
            id: 'human_cortex_001',
            technique: 'SMART-seq3',
            omics: 'scRNA+ATAC',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Cerebral Cortex',
            description: 'Human cerebral cortex cell type diversity',
            source: 'NeuroAtlas',
            publication: 'Cell 2024',
            cellCount: 89000,
            category: 'celltype',
            uberon: 'UBERON:0000956'
        },
        {
            id: 'human_retina_001',
            technique: '10x Genomics',
            omics: 'scRNA+ATAC',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Retina',
            description: 'Human retinal development and cell fate',
            source: 'EyeAtlas',
            publication: 'Science 2024',
            cellCount: 156000,
            category: 'tissue',
            uberon: 'UBERON:0000966'
        },
        // Cardiovascular System
        {
            id: 'human_heart_001',
            technique: 'sci-RNA-seq3',
            omics: 'scRNA+ATAC',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Heart',
            description: 'Human cardiac cell atlas across development',
            source: 'CardioAtlas',
            publication: 'Nature 2023',
            cellCount: 87000,
            category: 'tissue',
            uberon: 'UBERON:0000948'
        },
        // Digestive System
        {
            id: 'human_liver_001',
            technique: 'Drop-seq',
            omics: 'scRNA+ATAC',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Liver',
            description: 'Human liver zonation and cell diversity',
            source: 'LiverAtlas',
            publication: 'Hepatology 2024',
            cellCount: 95000,
            category: 'tissue',
            uberon: 'UBERON:0002107'
        },
        {
            id: 'human_pancreas_001',
            technique: 'inDrop',
            omics: 'scRNA-seq',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Pancreas',
            description: 'Pancreatic islet cell heterogeneity',
            source: 'PancreasDB',
            publication: 'Diabetes 2023',
            cellCount: 72000,
            category: 'tissue',
            uberon: 'UBERON:0001264'
        },
        {
            id: 'human_islet_001',
            technique: 'MARS-seq',
            omics: 'scRNA-seq',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Islet of Langerhans',
            description: 'Beta cell maturation and function',
            source: 'IsletAtlas',
            publication: 'Cell Metabolism 2023',
            cellCount: 42000,
            category: 'tissue',
            uberon: 'UBERON:0000006'
        },
        // Respiratory System
        {
            id: 'human_lung_001',
            technique: '10x Genomics',
            omics: 'scRNA+ATAC',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Lung',
            description: 'Human lung cell atlas and COVID-19 response',
            source: 'LungMap',
            publication: 'Nature Medicine 2024',
            cellCount: 142000,
            category: 'tissue',
            uberon: 'UBERON:0002048'
        },
        // Urinary System
        {
            id: 'human_kidney_001',
            technique: 'snRNA-seq',
            omics: 'scRNA+ATAC',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Kidney',
            description: 'Human kidney development and disease',
            source: 'KidneyAtlas',
            publication: 'JASN 2024',
            cellCount: 112000,
            category: 'tissue',
            uberon: 'UBERON:0002113'
        },
        // Reproductive System
        {
            id: 'human_ovary_001',
            technique: 'Smart-seq2',
            omics: 'scRNA-seq',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Ovary',
            description: 'Human ovarian follicle development',
            source: 'ReproAtlas',
            publication: 'Nature Genetics 2023',
            cellCount: 58000,
            category: 'tissue',
            uberon: 'UBERON:0000992'
        },
        // Disease Models
        {
            id: 'human_lymphoma_001',
            technique: 'sci-CAR',
            omics: 'scRNA+ATAC',
            species: 'Homo sapiens',
            state: 'Disease',
            tissue: 'Lymphoid Tissue',
            description: 'B-cell lymphoma progression and therapy resistance',
            source: 'CancerAtlas',
            publication: 'Nature Cancer 2024',
            cellCount: 78000,
            category: 'disease',
            uberon: 'UBERON:0000029'
        },
        // Additional datasets with UBERON IDs
        {
            id: 'human_skin_001',
            technique: '10x Chromium',
            omics: 'scRNA-seq',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Skin',
            description: 'Human skin cell diversity and wound healing',
            source: 'SkinAtlas',
            publication: 'Nature Communications 2024',
            cellCount: 89000,
            category: 'tissue',
            uberon: 'UBERON:0002097'
        },
        {
            id: 'human_muscle_001',
            technique: 'sci-RNA-seq',
            omics: 'scRNA+ATAC',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Skeletal Muscle',
            description: 'Human muscle fiber types and regeneration',
            source: 'MuscleDB',
            publication: 'Cell Reports 2024',
            cellCount: 93000,
            category: 'tissue',
            uberon: 'UBERON:0001134'
        },
        {
            id: 'human_bonemarrow_001',
            technique: '10x multiome',
            omics: 'scRNA+ATAC',
            species: 'Homo sapiens',
            state: 'Health',
            tissue: 'Bone Marrow',
            description: 'Human hematopoietic stem cell differentiation',
            source: 'HematoAtlas',
            publication: 'Cell Stem Cell 2024',
            cellCount: 168000,
            category: 'tissue',
            uberon: 'UBERON:0002371'
        }
    ];
}

// Table rendering variables
let currentPage = 1;
let rowsPerPage = 10;
let filteredDatasets = [];
let currentFilters = {
    category: 'all',
    datatype: 'all',
    search: ''
};

// Filter datasets for table view
function filterDatasets(searchTerm = '') {
    // If we're on the atlas page with table format
    const tableBody = document.getElementById('dataset-table-body');
    if (tableBody) {
        currentFilters.search = searchTerm;
        applyTableFilters();
        return;
    }
    
    // Legacy card-based filtering (for backward compatibility)
    const tissueGrid = document.getElementById('tissue-datasets');
    const diseaseGrid = document.getElementById('disease-datasets');
    const celltypeGrid = document.getElementById('celltype-datasets');
    
    if (!tissueGrid || !diseaseGrid || !celltypeGrid) return;
    
    // Clear existing content
    tissueGrid.innerHTML = '';
    diseaseGrid.innerHTML = '';
    celltypeGrid.innerHTML = '';
    
    // Filter datasets
    const filtered = allDatasets.filter(dataset => {
        return (dataset.description && dataset.description.toLowerCase().includes(searchTerm)) ||
               dataset.tissue.toLowerCase().includes(searchTerm) ||
               (dataset.state && dataset.state.toLowerCase().includes(searchTerm)) ||
               dataset.uberon.toLowerCase().includes(searchTerm);
    });
    
    // Group by category and render
    const tissueDatasets = filtered.filter(d => d.category === 'tissue');
    const diseaseDatasets = filtered.filter(d => d.category === 'disease');
    const celltypeDatasets = filtered.filter(d => d.category === 'celltype');
    
    renderDatasets(tissueGrid, tissueDatasets);
    renderDatasets(diseaseGrid, diseaseDatasets);
    renderDatasets(celltypeGrid, celltypeDatasets);
    
    // Show search result statistics
    showSearchStats(filtered.length, searchTerm);
}

// Apply table filters
function applyTableFilters() {
    filteredDatasets = allDatasets.filter(dataset => {
        // Category filter
        if (currentFilters.category !== 'all' && dataset.category !== currentFilters.category) {
            return false;
        }
        
        // Data type filter
        if (currentFilters.datatype !== 'all' && !dataset.omics.toLowerCase().includes(currentFilters.datatype.toLowerCase())) {
            return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            return dataset.id.toLowerCase().includes(searchLower) ||
                   dataset.tissue.toLowerCase().includes(searchLower) ||
                   dataset.description.toLowerCase().includes(searchLower) ||
                   dataset.uberon.toLowerCase().includes(searchLower) ||
                   dataset.source.toLowerCase().includes(searchLower);
        }
        
        return true;
    });
    
    currentPage = 1;
    renderTable();
    updatePagination();
    updateDatasetCount();
}

// Render table
function renderTable() {
    const tableBody = document.getElementById('dataset-table-body');
    if (!tableBody) return;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageDatasets = filteredDatasets.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    pageDatasets.forEach(dataset => {
        const row = document.createElement('tr');
        row.onclick = () => openDatasetDetail(dataset.id);
        
        row.innerHTML = 
            '<td><span class="dataset-id">' + dataset.id + '</span></td>' +
            '<td><span class="dataset-technique">' + dataset.technique + '</span></td>' +
            '<td><span class="dataset-omics">' + dataset.omics + '</span></td>' +
            '<td><span class="dataset-species">' + dataset.species + '</span></td>' +
            '<td><span class="dataset-state ' + (dataset.state === 'Health' ? 'healthy' : 'disease') + '">' + dataset.state + '</span></td>' +
            '<td><span class="dataset-tissue">' + dataset.tissue + '</span></td>' +
            '<td><span class="dataset-description" title="' + dataset.description + '">' + dataset.description + '</span></td>' +
            '<td><a href="#" class="dataset-source">' + dataset.source + '</a></td>' +
            '<td><span class="dataset-publication">' + dataset.publication + '</span></td>' +
            '<td><span class="dataset-cell-count">' + dataset.cellCount.toLocaleString() + '</span></td>' +
            '<td><a href="#" class="download-btn" onclick="event.stopPropagation(); downloadDataset(\'' + dataset.id + '\')">download</a></td>';
        
        tableBody.appendChild(row);
    });
}

// Open dataset detail page
function openDatasetDetail(datasetId) {
    window.open('dataset-detail.html?id=' + datasetId, '_blank');
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredDatasets.length / rowsPerPage);
    const pageNumbers = document.getElementById('page-numbers');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const paginationInfo = document.getElementById('pagination-info');
    
    if (!pageNumbers) return;
    
    // Update pagination info
    const startEntry = (currentPage - 1) * rowsPerPage + 1;
    const endEntry = Math.min(currentPage * rowsPerPage, filteredDatasets.length);
    paginationInfo.textContent = 'Showing ' + startEntry + ' to ' + endEntry + ' of ' + filteredDatasets.length + ' entries';
    
    // Update buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generate page numbers
    pageNumbers.innerHTML = '';
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('span');
        pageBtn.className = 'page-number' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageBtn);
    }
}

// Navigate to specific page
function goToPage(page) {
    currentPage = page;
    renderTable();
    updatePagination();
}

// Update dataset count
function updateDatasetCount() {
    const countElement = document.getElementById('dataset-count');
    if (countElement) {
        countElement.textContent = 'Showing ' + filteredDatasets.length + ' of ' + allDatasets.length + ' datasets';
    }
}

// Render datasets
function renderDatasets(container, datasets) {
    if (datasets.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 40px;">No matching datasets found</p>';
        return;
    }
    
    datasets.forEach(dataset => {
        const card = createDatasetCard(dataset);
        container.appendChild(card);
    });
}

// Create dataset card
function createDatasetCard(dataset) {
    const card = document.createElement('div');
    card.className = 'dataset-card';
    
    card.innerHTML = '<h4>' + dataset.name + '</h4>' +
        '<p><strong>UBERON ID:</strong> ' + dataset.uberon + '</p>' +
        '<p><strong>Tissue:</strong> ' + dataset.tissue + '</p>' +
        '<div class="dataset-info">' +
            '<div class="info-item">' +
                '<span class="info-label">Cell Count</span>' +
                '<span class="info-value">' + dataset.cellCount.toLocaleString() + '</span>' +
            '</div>' +
            '<div class="info-item">' +
                '<span class="info-label">Gene Count</span>' +
                '<span class="info-value">' + dataset.geneCount.toLocaleString() + '</span>' +
            '</div>' +
            '<div class="info-item">' +
                '<span class="info-label">Sample Count</span>' +
                '<span class="info-value">' + dataset.samples + '</span>' +
            '</div>' +
            '<div class="info-item">' +
                '<span class="info-label">Data Type</span>' +
                '<span class="info-value">' + dataset.dataTypes.join(', ') + '</span>' +
            '</div>' +
            '<div class="info-item">' +
                '<span class="info-label">Disease Status</span>' +
                '<span class="info-value">' + dataset.disease + '</span>' +
            '</div>' +
            '<div class="info-item">' +
                '<span class="info-label">Publication</span>' +
                '<span class="info-value">' + dataset.publication + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="dataset-actions">' +
            '<a href="#" class="btn btn-primary" onclick="downloadDataset(\'' + dataset.id + '\')">' +
                '📥 Download (' + dataset.downloadSize + ')' +
            '</a>' +
            '<a href="#" class="btn btn-secondary" onclick="viewDataset(\'' + dataset.id + '\')">' +
                '👁️ View Details' +
            '</a>' +
        '</div>';
    
    return card;
}

// Download dataset
function downloadDataset(datasetId) {
    const dataset = allDatasets.find(d => d.id === datasetId);
    if (dataset) {
        alert('Preparing download: ' + dataset.name + '\nFile size: ' + dataset.downloadSize + '\n\nNote: This is a demo version, actual download functionality requires backend support.');
    }
}

// View dataset details
function viewDataset(datasetId) {
    const dataset = allDatasets.find(d => d.id === datasetId);
    if (dataset) {
        alert('Dataset Details:\n\nName: ' + dataset.name + '\nUBERON ID: ' + dataset.uberon + '\nTissue: ' + dataset.tissue + '\nCell Count: ' + dataset.cellCount.toLocaleString() + '\n\nNote: Detail page functionality is under development.');
    }
}

// Show search statistics
function showSearchStats(count, term) {
    let statsElement = document.getElementById('search-stats');
    if (!statsElement) {
        statsElement = document.createElement('div');
        statsElement.id = 'search-stats';
        statsElement.style.cssText = 'background: #e8f4fd; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin-bottom: 30px; text-align: center; color: #0c5460;';
        
        const atlasContainer = document.querySelector('.atlas-container');
        if (atlasContainer) {
            atlasContainer.insertBefore(statsElement, atlasContainer.firstChild);
        }
    }
    
    statsElement.innerHTML = '<strong>Search Results:</strong> Found ' + count + ' datasets related to "' + term + '"' +
        (count > 0 ? '' : '<br><small>Try using other keywords such as organ names, disease types, or UBERON IDs</small>');
}

// Handle URL search parameters
function handleUrlSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = searchTerm;
        }
        filterDatasets(searchTerm.toLowerCase());
    } else {
        loadAllDatasets();
    }
}

// Load all datasets
function loadAllDatasets() {
    const tissueGrid = document.getElementById('tissue-datasets');
    const diseaseGrid = document.getElementById('disease-datasets');
    const celltypeGrid = document.getElementById('celltype-datasets');
    
    if (tissueGrid && diseaseGrid && celltypeGrid) {
        const tissueDatasets = allDatasets.filter(d => d.category === 'tissue');
        const diseaseDatasets = allDatasets.filter(d => d.category === 'disease');
        const celltypeDatasets = allDatasets.filter(d => d.category === 'celltype');
        
        renderDatasets(tissueGrid, tissueDatasets);
        renderDatasets(diseaseGrid, diseaseDatasets);
        renderDatasets(celltypeGrid, celltypeDatasets);
    }
}

// If on atlas page, handle URL search
if (window.location.pathname.includes('atlas.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadDatasets();
        initializeAtlasPage();
        handleUrlSearch();
    });
}

// Initialize atlas page with table functionality
function initializeAtlasPage() {
    const tableBody = document.getElementById('dataset-table-body');
    
    if (tableBody) {
        // Initialize table view
        filteredDatasets = [...allDatasets];
        renderTable();
        updatePagination();
        updateDatasetCount();
        
        // Set up filter event listeners
        setupTableFilters();
    } else {
        // Legacy card view
        loadAllDatasets();
    }
}

// Setup table filter event listeners
function setupTableFilters() {
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentFilters.category = this.value;
            applyTableFilters();
        });
    }
    
    // Data type filter
    const datatypeFilter = document.getElementById('datatype-filter');
    if (datatypeFilter) {
        datatypeFilter.addEventListener('change', function() {
            currentFilters.datatype = this.value;
            applyTableFilters();
        });
    }
    
    // Entries per page
    const entriesPerPage = document.getElementById('entries-per-page');
    if (entriesPerPage) {
        entriesPerPage.addEventListener('change', function() {
            rowsPerPage = parseInt(this.value);
            currentPage = 1;
            renderTable();
            updatePagination();
        });
    }
    
    // Table search
    const tableSearch = document.getElementById('table-search');
    if (tableSearch) {
        tableSearch.addEventListener('input', function() {
            currentFilters.search = this.value.trim();
            applyTableFilters();
        });
    }
    
    // Pagination buttons
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                goToPage(currentPage - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredDatasets.length / rowsPerPage);
            if (currentPage < totalPages) {
                goToPage(currentPage + 1);
            }
        });
    }
}
