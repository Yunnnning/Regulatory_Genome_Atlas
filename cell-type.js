// Cell Type Page JavaScript
let cellTypeData = [];
let filteredCellTypes = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentView = 'tree';

// Initialize cell type page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('cell-type.html')) {
        initializeCellTypePage();
    }
});

// Initialize cell type page functionality
function initializeCellTypePage() {
    loadCellTypeData();
    setupCellTypeFilters();
    setupSectionToggle();
    setupHierarchyVisualization();
}

// Load cell type data from TSV file
async function loadCellTypeData() {
    try {
        const response = await fetch('datasets/annotations/cell_type_ontology.tsv');
        const text = await response.text();
        
        const processedData = parseTSVData(text);
        cellTypeData = processedData;
        filteredCellTypes = [...cellTypeData];
        
        populateFilters();
        renderCellTypeTable();
        updateCellTypeCount();
        renderHierarchyVisualization();
        
    } catch (error) {
        console.error('Error loading cell type data:', error);
        document.getElementById('celltype-count').textContent = 'Error loading data';
    }
}

// Parse TSV data and consolidate cell types
function parseTSVData(text) {
    const lines = text.trim().split('\n');
    const data = [];
    const uniqueCategories = new Map(); // Use cell type category as key
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        if (values.length >= 3) {
            const cellType = values[0].trim();
            const cellTypeCategory = values[1].trim();
            const majorTypeCategory = values[2].trim();
            
            if (!uniqueCategories.has(cellTypeCategory)) {
                // Create new entry for this category
                const entry = {
                    cellType: cellTypeCategory, // Use category as main name
                    aliases: [],
                    cellTypeCategory: cellTypeCategory,
                    majorTypeCategory: majorTypeCategory,
                    markers: generateMarkers(cellTypeCategory),
                    id: data.length
                };
                
                uniqueCategories.set(cellTypeCategory, entry);
                data.push(entry);
            }
            
            // Add the current cell type as an alias if it's different from category
            const entry = uniqueCategories.get(cellTypeCategory);
            if (cellType !== cellTypeCategory && !entry.aliases.includes(cellType)) {
                entry.aliases.push(cellType);
            }
        }
    }
    
    return data;
}

// Generate mock markers for demonstration
function generateMarkers(cellType) {
    const markerSets = {
        'B cell': ['CD19', 'MS4A1', 'PAX5'],
        'T cell': ['CD3D', 'CD3E', 'CD3G'],
        'Astrocyte': ['GFAP', 'AQP4', 'ALDH1L1'],
        'Endothelial cell': ['PECAM1', 'CDH5', 'VWF'],
        'Epithelial cell': ['EPCAM', 'KRT8', 'KRT18'],
        'Cardiomyocyte': ['TNNT2', 'MYH6', 'MYH7'],
        'Fibroblast': ['COL1A1', 'DCN', 'LUM'],
        'Macrophage': ['CD68', 'CSF1R', 'AIF1'],
        'Dendritic cell': ['CD83', 'CCR7', 'FSCN1'],
        'Plasma cell': ['CD138', 'XBP1', 'PRDM1'],
        'Neutrophil': ['FCGR3B', 'CSF3R', 'CXCR2'],
        'default': ['GAPDH', 'ACTB']
    };
    
    // Find markers based on cell type keywords
    for (const [key, markers] of Object.entries(markerSets)) {
        if (cellType.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
            return markers;
        }
    }
    
    return markerSets.default;
}

// Populate filters
function populateFilters() {
    // Populate cell type filter
    const cellTypes = [...new Set(cellTypeData.map(d => d.cellType))].sort();
    const cellTypeSelect = document.getElementById('cell-type-filter');
    
    if (cellTypeSelect) {
        cellTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            cellTypeSelect.appendChild(option);
        });
    }
    
    // Populate category filter
    const categories = [...new Set(cellTypeData.map(d => d.majorTypeCategory))].sort();
    const categorySelect = document.getElementById('category-filter');
    
    if (categorySelect) {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

// Setup cell type filters
function setupCellTypeFilters() {
    const cellTypeFilter = document.getElementById('cell-type-filter');
    const categoryFilter = document.getElementById('category-filter');
    const tableSearch = document.getElementById('table-search');
    const entriesPerPage = document.getElementById('entries-per-page');
    
    if (cellTypeFilter) {
        cellTypeFilter.addEventListener('change', applyCellTypeFilters);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyCellTypeFilters);
    }
    
    if (tableSearch) {
        tableSearch.addEventListener('input', applyCellTypeFilters);
    }
    
    if (entriesPerPage) {
        entriesPerPage.addEventListener('change', function() {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            renderCellTypeTable();
        });
    }
    
    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCellTypeTable();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredCellTypes.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderCellTypeTable();
            }
        });
    }
}

// Apply cell type filters
function applyCellTypeFilters() {
    const cellTypeFilter = document.getElementById('cell-type-filter');
    const categoryFilter = document.getElementById('category-filter');
    const tableSearch = document.getElementById('table-search');
    
    const cellTypeValue = cellTypeFilter ? cellTypeFilter.value : 'all';
    const categoryValue = categoryFilter ? categoryFilter.value : 'all';
    const searchTerm = tableSearch ? tableSearch.value.toLowerCase() : '';
    
    filteredCellTypes = cellTypeData.filter(cellType => {
        const matchesCellType = cellTypeValue === 'all' || cellType.cellType === cellTypeValue;
        const matchesCategory = categoryValue === 'all' || cellType.majorTypeCategory === categoryValue;
        const matchesSearch = searchTerm === '' || 
            cellType.cellType.toLowerCase().includes(searchTerm) ||
            cellType.cellTypeCategory.toLowerCase().includes(searchTerm) ||
            cellType.majorTypeCategory.toLowerCase().includes(searchTerm) ||
            cellType.aliases.some(alias => alias.toLowerCase().includes(searchTerm)) ||
            cellType.markers.some(marker => marker.toLowerCase().includes(searchTerm));
        
        return matchesCellType && matchesCategory && matchesSearch;
    });
    
    currentPage = 1;
    renderCellTypeTable();
    updateCellTypeCount();
}

// Render cell type table
function renderCellTypeTable() {
    const tbody = document.getElementById('celltype-table-body');
    if (!tbody) return;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredCellTypes.slice(start, end);
    
    tbody.innerHTML = '';
    
    pageData.forEach(cellType => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="celltype-name">${cellType.cellType}</td>
            <td class="celltype-aliases">${cellType.aliases.length > 0 ? cellType.aliases.join(', ') : 'None'}</td>
            <td class="celltype-major">${cellType.majorTypeCategory}</td>
            <td class="celltype-markers">
                <div class="marker-tags">
                    ${cellType.markers.map(marker => `<span class="marker-tag">${marker}</span>`).join('')}
                </div>
            </td>
        `;
        row.onclick = () => viewCellTypeDetails(cellType.id);
        tbody.appendChild(row);
    });
    
    updatePaginationControls();
}

// Update cell type count
function updateCellTypeCount() {
    const countElement = document.getElementById('celltype-count');
    if (countElement) {
        const count = filteredCellTypes.length;
        countElement.textContent = `${count} cell types found`;
    }
    
    // Update pagination info
    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) {
        const start = Math.min((currentPage - 1) * itemsPerPage + 1, filteredCellTypes.length);
        const end = Math.min(start + itemsPerPage - 1, filteredCellTypes.length);
        paginationInfo.textContent = `Showing ${start} to ${end} of ${filteredCellTypes.length} entries`;
    }
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(filteredCellTypes.length / itemsPerPage);
    
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    // Update page numbers
    const pageNumbers = document.getElementById('page-numbers');
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        
        const maxPages = Math.min(totalPages, 5);
        for (let i = 1; i <= maxPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-number' + (i === currentPage ? ' active' : '');
            pageBtn.textContent = i;
            pageBtn.onclick = () => {
                currentPage = i;
                renderCellTypeTable();
            };
            pageNumbers.appendChild(pageBtn);
        }
    }
}

// Setup section toggle
function setupSectionToggle() {
    // Initially show search section
    showSection('search');
}

// Show section
function showSection(sectionName) {
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find the button that was clicked
    const clickedBtn = Array.from(document.querySelectorAll('.toggle-btn')).find(btn => 
        btn.textContent.toLowerCase().includes(sectionName.toLowerCase())
    );
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    // Show/hide sections
    const searchSection = document.getElementById('search-section');
    const hierarchySection = document.getElementById('hierarchy-section');
    
    if (searchSection) {
        searchSection.classList.toggle('hidden', sectionName !== 'search');
    }
    
    if (hierarchySection) {
        hierarchySection.classList.toggle('hidden', sectionName !== 'hierarchy');
    }
    
    if (sectionName === 'hierarchy') {
        setTimeout(() => renderHierarchyVisualization(), 100);
    }
}

// Setup hierarchy visualization
function setupHierarchyVisualization() {
    const hierarchySearch = document.getElementById('hierarchy-search');
    const focusType = document.getElementById('focus-type');
    
    if (hierarchySearch) {
        hierarchySearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            highlightInHierarchy(searchTerm);
        });
    }
    
    if (focusType) {
        focusType.addEventListener('change', function() {
            renderHierarchyVisualization();
        });
    }
}

// Set hierarchy view
function setHierarchyView(viewType) {
    currentView = viewType;
    
    // Update view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find the button that was clicked
    const clickedBtn = Array.from(document.querySelectorAll('.view-btn')).find(btn => 
        btn.textContent.toLowerCase().includes(viewType.toLowerCase())
    );
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    renderHierarchyVisualization();
}

// Render hierarchy visualization
function renderHierarchyVisualization() {
    if (typeof d3 === 'undefined') {
        console.warn('D3.js not loaded, skipping visualization');
        return;
    }
    
    const container = d3.select('#hierarchy-viz');
    if (container.empty()) return;
    
    container.selectAll('*').remove();
    
    if (cellTypeData.length === 0) return;
    
    const hierarchyData = buildHierarchyData();
    
    switch (currentView) {
        case 'tree':
            renderTreeView(container, hierarchyData);
            break;
        case 'sunburst':
            renderSunburstView(container, hierarchyData);
            break;
        case 'network':
            renderNetworkView(container, hierarchyData);
            break;
    }
    
    updateLegend();
}

// Build hierarchy data
function buildHierarchyData() {
    const focusType = document.getElementById('focus-type');
    const focusTypeValue = focusType ? focusType.value : 'all';
    
    if (focusTypeValue === 'major') {
        // Group by major type category only
        const majorTypes = [...new Set(cellTypeData.map(d => d.majorTypeCategory))];
        return {
            name: 'Cell Types',
            children: majorTypes.map(majorType => ({
                name: majorType,
                count: cellTypeData.filter(d => d.majorTypeCategory === majorType).length,
                type: 'major'
            }))
        };
    } else {
        // Full hierarchy: Major Type -> Cell Type Category -> Individual Cell Types
        const hierarchy = {};
        
        cellTypeData.forEach(cellType => {
            const major = cellType.majorTypeCategory;
            const category = cellType.cellTypeCategory;
            
            if (!hierarchy[major]) {
                hierarchy[major] = {};
            }
            
            if (!hierarchy[major][category]) {
                hierarchy[major][category] = [];
            }
            
            // Only add if not already present
            if (!hierarchy[major][category].some(c => c.name === cellType.cellType)) {
                hierarchy[major][category].push({
                    name: cellType.cellType,
                    aliases: cellType.aliases,
                    markers: cellType.markers,
                    type: 'cell',
                    id: cellType.id
                });
            }
        });
        
        return {
            name: 'Cell Types',
            children: Object.keys(hierarchy).map(major => ({
                name: major,
                type: 'major',
                children: Object.keys(hierarchy[major]).map(category => ({
                    name: category,
                    type: 'category',
                    children: hierarchy[major][category]
                }))
            }))
        };
    }
}

// Render tree view
function renderTreeView(container, data) {
    const width = 1000;
    const height = 600;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', 'translate(50,50)');
    
    const tree = d3.tree().size([height - 100, width - 100]);
    const root = d3.hierarchy(data);
    
    tree(root);
    
    // Links
    g.selectAll('.link')
        .data(root.links())
        .enter().append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x))
        .style('fill', 'none')
        .style('stroke', '#ccc')
        .style('stroke-width', 1);
    
    // Nodes
    const node = g.selectAll('.node')
        .data(root.descendants())
        .enter().append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .on('click', function(event, d) {
            selectCellType(d.data);
        });
    
    node.append('circle')
        .attr('r', d => d.data.type === 'cell' ? 4 : 6)
        .style('fill', d => {
            switch(d.data.type) {
                case 'major': return '#3498db';
                case 'category': return '#e74c3c';
                case 'cell': return '#2ecc71';
                default: return '#95a5a6';
            }
        })
        .style('stroke', '#fff')
        .style('stroke-width', 2);
    
    node.append('text')
        .attr('dy', '.35em')
        .attr('x', d => d.children ? -8 : 8)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('font-size', '12px')
        .text(d => d.data.name.length > 20 ? d.data.name.substring(0, 20) + '...' : d.data.name);
}

// Render sunburst view
function renderSunburstView(container, data) {
    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', `translate(${width/2},${height/2})`);
    
    const partition = d3.partition().size([2 * Math.PI, radius]);
    const root = d3.hierarchy(data)
        .sum(d => d.children ? 0 : 1);
    
    partition(root);
    
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1);
    
    g.selectAll('path')
        .data(root.descendants())
        .enter().append('path')
        .attr('d', arc)
        .style('fill', d => {
            switch(d.data.type) {
                case 'major': return '#3498db';
                case 'category': return '#e74c3c';
                case 'cell': return '#2ecc71';
                default: return '#95a5a6';
            }
        })
        .style('stroke', '#fff')
        .style('stroke-width', 1)
        .on('click', function(event, d) {
            selectCellType(d.data);
        });
}

// Render network view
function renderNetworkView(container, data) {
    const width = 1000;
    const height = 600;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Convert hierarchy to network format
    const nodes = [];
    const links = [];
    let nodeId = 0;
    
    function addNodes(node, parentId = null) {
        const currentId = nodeId++;
        nodes.push({
            id: currentId,
            name: node.name,
            type: node.type || 'root',
            data: node
        });
        
        if (parentId !== null) {
            links.push({
                source: parentId,
                target: currentId
            });
        }
        
        if (node.children) {
            node.children.forEach(child => {
                addNodes(child, currentId);
            });
        }
    }
    
    addNodes(data);
    
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(50))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2));
    
    const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .style('stroke', '#ccc')
        .style('stroke-width', 1);
    
    const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', d => d.type === 'cell' ? 4 : 8)
        .style('fill', d => {
            switch(d.type) {
                case 'major': return '#3498db';
                case 'category': return '#e74c3c';
                case 'cell': return '#2ecc71';
                default: return '#95a5a6';
            }
        })
        .on('click', function(event, d) {
            selectCellType(d.data);
        });
    
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    });
}

// Update legend
function updateLegend() {
    const legendContent = document.getElementById('legend-content');
    if (legendContent) {
        legendContent.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background-color: #3498db;"></div>
                <span>Major Category</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background-color: #e74c3c;"></div>
                <span>Cell Type Category</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background-color: #2ecc71;"></div>
                <span>Individual Cell Type</span>
            </div>
        `;
    }
}

// Select cell type
function selectCellType(cellTypeData) {
    const details = document.getElementById('selected-details');
    if (!details) return;
    
    if (cellTypeData.type === 'cell') {
        details.innerHTML = `
            <h5>${cellTypeData.name}</h5>
            <p><strong>Aliases:</strong> ${cellTypeData.aliases && cellTypeData.aliases.length > 0 ? cellTypeData.aliases.join(', ') : 'None'}</p>
            <p><strong>Markers:</strong> ${cellTypeData.markers && cellTypeData.markers.length > 0 ? cellTypeData.markers.join(', ') : 'None'}</p>
        `;
    } else {
        details.innerHTML = `
            <h5>${cellTypeData.name}</h5>
            <p><strong>Type:</strong> ${cellTypeData.type}</p>
            <p><strong>Count:</strong> ${cellTypeData.count || 'N/A'}</p>
        `;
    }
}

// Highlight in hierarchy
function highlightInHierarchy(searchTerm) {
    console.log('Highlighting:', searchTerm);
    // This would highlight matching nodes in the visualization
    // Implementation depends on the current view
}

// View cell type details
function viewCellTypeDetails(cellTypeId) {
    const cellType = cellTypeData.find(c => c.id === cellTypeId);
    if (cellType) {
        alert(`Cell Type: ${cellType.cellType}\nCategory: ${cellType.cellTypeCategory}\nMajor Type: ${cellType.majorTypeCategory}\nAliases: ${cellType.aliases.join(', ')}\nMarkers: ${cellType.markers.join(', ')}`);
    }
}

// Perform cell type search
function performCellTypeSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }
    
    // Switch to search section and apply filter
    showSection('search');
    const tableSearch = document.getElementById('table-search');
    if (tableSearch) {
        tableSearch.value = searchTerm;
        applyCellTypeFilters();
    }
} 