// Chart.js setup
let deltaChart, gammaChart, vegaChart, vannaChart, charmChart, vommaChart, speedChart;
const deltaCtx = document.getElementById('deltaChart').getContext('2d');
const gammaCtx = document.getElementById('gammaChart').getContext('2d');
const vegaCtx = document.getElementById('vegaChart').getContext('2d');
const vannaCtx = document.getElementById('vannaChart').getContext('2d');
const charmCtx = document.getElementById('charmChart').getContext('2d');
const vommaCtx = document.getElementById('vommaChart').getContext('2d');
const speedCtx = document.getElementById('speedChart').getContext('2d');

// Default chart configurations
const defaultCharts = {
    delta: { ctx: deltaCtx, container: document.getElementById('deltaContainer'), instance: null, swapAxes: false, chartType: 'line', exposure: 'deltaExposures', label: 'Delta Exposure', color: 'blue' },
    gamma: { ctx: gammaCtx, container: document.getElementById('gammaContainer'), instance: null, swapAxes: false, chartType: 'line', exposure: 'gammaExposures', label: 'Gamma Exposure', color: 'red' },
    vega: { ctx: vegaCtx, container: document.getElementById('vegaContainer'), instance: null, swapAxes: false, chartType: 'line', exposure: 'vegaExposures', label: 'Vega Exposure', color: 'green' },
    vanna: { ctx: vannaCtx, container: document.getElementById('vannaContainer'), instance: null, swapAxes: false, chartType: 'line', exposure: 'vannaExposures', label: 'Vanna Exposure', color: 'purple' },
    charm: { ctx: charmCtx, container: document.getElementById('charmContainer'), instance: null, swapAxes: false, chartType: 'line', exposure: 'charmExposures', label: 'Charm Exposure', color: 'orange' },
    vomma: { ctx: vommaCtx, container: document.getElementById('vommaContainer'), instance: null, swapAxes: false, chartType: 'line', exposure: 'vommaExposures', label: 'Vomma Exposure', color: 'cyan' },
    speed: { ctx: speedCtx, container: document.getElementById('speedContainer'), instance: null, swapAxes: false, chartType: 'line', exposure: 'speedExposures', label: 'Speed Exposure', color: 'pink' }
};

// Custom charts storage
const customCharts = [];

// API key (temporary hardcoded - move to api_key.txt when hosted)
const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual key

// Cache for fetched chain data (store in localStorage)
let cachedChainData = null;
let lastSymbol = null;
let lastExpirations = null;

// Prompt user for r and q, default to 0 if invalid or not provided
const riskFreeRate = parseFloat(prompt("Enter risk-free interest rate (e.g., 0.04 for 4%):") || 0) || 0;
const dividendYield = parseFloat(prompt("Enter dividend yield (e.g., 0.02 for 2%):") || 0) || 0;

// Black-Scholes helper functions with division-by-zero handling
function safeDivision(numerator, denominator) {
    return denominator === 0 ? 0 : numerator / denominator;
}

function standardNormalCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x >= 0 ? 1 - prob : prob;
}

function standardNormalPDF(x) {
    return safeDivision(Math.exp(-0.5 * x * x), Math.sqrt(2 * Math.PI));
}

function calculateD1(S, K, T, sigma, r, q) {
    const numerator = Math.log(safeDivision(S, K)) + (r - q + 0.5 * sigma * sigma) * T;
    const denominator = sigma * Math.sqrt(T);
    return safeDivision(numerator, denominator);
}

function calculateD2(d1, sigma, T) {
    return d1 - sigma * Math.sqrt(T);
}

function calculateVanna(S, vega, sigma, T, d1) {
    const sigmaSqrtT = sigma * Math.sqrt(T);
    const term = safeDivision(d1, sigmaSqrtT);
    return safeDivision(vega, S) * (1 - term);
}

function calculateCharm(S, K, T, sigma, r, q, side) {
    const d1 = calculateD1(S, K, T, sigma, r, q);
    const d2 = calculateD2(d1, sigma, T);
    const nPrimeD1 = standardNormalPDF(d1);
    const sqrtT = Math.sqrt(T);
    const expQt = Math.exp(-dividendYield * T);
    const termNumerator = 2 * (r - q) * T - d2 * sigma * sqrtT;
    const termDenominator = 2 * T * sigma * sqrtT;
    const sigmaTerm = safeDivision(termNumerator, termDenominator);

    if (side === 'call') {
        return (dividendYield * expQt * standardNormalCDF(d1)) - (expQt * nPrimeD1 * sigmaTerm);
    } else {
        return (-dividendYield * expQt * standardNormalCDF(-d1)) - (expQt * nPrimeD1 * sigmaTerm);
    }
}

function calculateVomma(S, K, T, sigma, r, q, vega) {
    const d1 = calculateD1(S, K, T, sigma, r, q);
    const d2 = calculateD2(d1, sigma, T);
    return vega * safeDivision(d1 * d2, sigma);
}

function calculateSpeed(S, K, T, sigma, r, q, gamma) {
    const d1 = calculateD1(S, K, T, sigma, r, q);
    const sigmaSqrtT = sigma * Math.sqrt(T);
    const term = safeDivision(d1, sigmaSqrtT) + 1;
    return -safeDivision(gamma, S) * term;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Chart.js version:', Chart.version);

    // Event listeners for default charts
    document.getElementById('fetchExpirationsButton').addEventListener('click', fetchExpirations);
    document.getElementById('fetchChainsButton').addEventListener('click', fetchOrProcessOptionChains);
    document.getElementById('filterStrikesButton').addEventListener('click', filterAndProcessStrikes);
    document.getElementById('deltaCheck').addEventListener('change', updateCharts);
    document.getElementById('gammaCheck').addEventListener('change', updateCharts);
    document.getElementById('vegaCheck').addEventListener('change', updateCharts);
    document.getElementById('vannaCheck').addEventListener('change', updateCharts);
    document.getElementById('charmCheck').addEventListener('change', updateCharts);
    document.getElementById('vommaCheck').addEventListener('change', updateCharts);
    document.getElementById('speedCheck').addEventListener('change', updateCharts);
    document.getElementById('viewTableButton').addEventListener('click', () => {
        window.location.href = 'table.html';
    });
    document.getElementById('addCustomGraph').addEventListener('click', addCustomGraph);
    document.querySelectorAll('input[name="agg"]').forEach(input => {
        input.addEventListener('change', () => {
            if (cachedChainData) processOptionChain(cachedChainData);
        });
    });

    // Default chart controls
    Object.keys(defaultCharts).forEach(key => {
        document.getElementById(`${key}Swap`).addEventListener('click', () => {
            defaultCharts[key].swapAxes = !defaultCharts[key].swapAxes;
            defaultCharts[key].container.classList.toggle('normal', !defaultCharts[key].swapAxes);
            defaultCharts[key].container.classList.toggle('swapped', defaultCharts[key].swapAxes);
            if (cachedChainData) processOptionChain(cachedChainData);
        });
        document.getElementById(`${key}Toggle`).addEventListener('click', () => {
            defaultCharts[key].chartType = defaultCharts[key].chartType === 'line' ? 'bar' : 'line';
            if (cachedChainData) processOptionChain(cachedChainData);
        });
    });
});

async function fetchExpirations() {
    const symbol = document.getElementById('symbol').value.toUpperCase();
    const url = `https://api.marketdata.app/v1/options/expirations/${symbol}/`;

    document.getElementById('loading').style.display = 'block';

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const data = await response.json();

        console.log('Raw Expirations Response:', data);
        if (data.s !== 'ok') {
            throw new Error('Failed to fetch expirations: ' + (data.message || 'Unknown error'));
        }

        const expirations = data.expirations || [];
        console.log('Parsed Expirations Array:', expirations);
        populateExpirations(expirations);
        document.getElementById('fetchChainsButton').disabled = expirations.length === 0;
    } catch (error) {
        console.error('Error fetching expirations:', error);
        alert('Failed to fetch expiration dates. Check console for details.');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function fetchOrProcessOptionChains() {
    const symbol = document.getElementById('symbol').value.toUpperCase();
    const selectedExpirations = Array.from(document.getElementById('expirations').selectedOptions).map(opt => opt.value);
    if (selectedExpirations.length === 0) {
        alert('Please select at least one expiration date.');
        return;
    }

    const expirationsChanged = JSON.stringify(selectedExpirations) !== JSON.stringify(lastExpirations);
    const symbolChanged = symbol !== lastSymbol;

    if (!cachedChainData || symbolChanged || expirationsChanged) {
        await fetchOptionChains(symbol, selectedExpirations);
    } else {
        console.log('Using cached chain data:', cachedChainData);
        processOptionChain(cachedChainData);
    }
}

async function fetchOptionChains(symbol, selectedExpirations) {
    document.getElementById('loading').style.display = 'block';

    try {
        console.log('Fetching chains for expirations:', selectedExpirations);
        const fullChainData = await Promise.all(selectedExpirations.map(exp => fetchChainForExpiration(symbol, exp)));

        const combinedData = {
            strike: [],
            side: [],
            delta: [],
            gamma: [],
            vega: [],
            vanna: [],
            charm: [],
            vomma: [],
            speed: [],
            openInterest: [],
            volume: [],
            iv: [],
            expiration: [],
            underlyingPrice: [],
            dte: [],
            deltaExposure: [],
            gammaExposure: [],
            vegaExposure: [],
            vannaExposure: [],
            charmExposure: [],
            vommaExposure: [],
            speedExposure: []
        };

        fullChainData.forEach(data => {
            combinedData.strike.push(...(data.strike || []));
            combinedData.side.push(...(data.side || []));
            combinedData.delta.push(...(data.delta || []));
            combinedData.gamma.push(...(data.gamma || []));
            combinedData.vega.push(...(data.vega || []));
            combinedData.vanna.push(...(data.vanna || []));
            combinedData.charm.push(...(data.charm || []));
            combinedData.vomma.push(...(data.vomma || []));
            combinedData.speed.push(...(data.speed || []));
            combinedData.openInterest.push(...(data.openInterest || []));
            combinedData.volume.push(...(data.volume || []));
            combinedData.iv.push(...(data.iv || []));
            combinedData.expiration.push(...(data.expiration || []));
            combinedData.underlyingPrice.push(...(data.underlyingPrice || []));
            combinedData.dte.push(...(data.dte || []));
            combinedData.deltaExposure.push(...(data.deltaExposure || []));
            combinedData.gammaExposure.push(...(data.gammaExposure || []));
            combinedData.vegaExposure.push(...(data.vegaExposure || []));
            combinedData.vannaExposure.push(...(data.vannaExposure || []));
            combinedData.charmExposure.push(...(data.charmExposure || []));
            combinedData.vommaExposure.push(...(data.vommaExposure || []));
            combinedData.speedExposure.push(...(data.speedExposure || []));
        });

        console.log('Combined Chain Data:', combinedData);
        cachedChainData = combinedData;
        localStorage.setItem('cachedChainData', JSON.stringify(combinedData));
        lastSymbol = symbol;
        lastExpirations = selectedExpirations.slice();
        document.getElementById('filterStrikesButton').disabled = false;
        processOptionChain(combinedData);
    } catch (error) {
        console.error('Error fetching option chains:', error);
        alert('Failed to fetch option chain data. Check console for details.');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function fetchChainForExpiration(symbol, expiration) {
    const url = `https://api.marketdata.app/v1/options/chain/${symbol}/?greeks=true&expiration=${expiration}`;

    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await response.json();
    if (data.s !== 'ok') {
        throw new Error(`Failed to fetch chain for expiration ${expiration}: ${data.message || 'Unknown error (possibly 404)'}`);
    }

    data.vanna = data.strike.map((strike, i) => {
        const S = data.underlyingPrice[i];
        const K = strike;
        const T = safeDivision(data.dte[i], 365);
        const sigma = data.iv[i];
        const vega = data.vega[i];
        const d1 = calculateD1(S, K, T, sigma, riskFreeRate, dividendYield);
        return calculateVanna(S, vega, sigma, T, d1);
    });

    data.charm = data.strike.map((strike, i) => {
        const S = data.underlyingPrice[i];
        const K = strike;
        const T = safeDivision(data.dte[i], 365);
        const sigma = data.iv[i];
        const side = data.side[i];
        return calculateCharm(S, K, T, sigma, riskFreeRate, dividendYield, side);
    });

    data.vomma = data.strike.map((strike, i) => {
        const S = data.underlyingPrice[i];
        const K = strike;
        const T = safeDivision(data.dte[i], 365);
        const sigma = data.iv[i];
        const vega = data.vega[i];
        return calculateVomma(S, K, T, sigma, riskFreeRate, dividendYield, vega);
    });

    data.speed = data.strike.map((strike, i) => {
        const S = data.underlyingPrice[i];
        const K = strike;
        const T = safeDivision(data.dte[i], 365);
        const sigma = data.iv[i];
        const gamma = data.gamma[i];
        return calculateSpeed(S, K, T, sigma, riskFreeRate, dividendYield, gamma);
    });

    data.iv = data.iv || data.strike.map(() => 0);
    data.volume = data.volume || data.strike.map(() => 0);

    // Calculate per-option exposures
    data.deltaExposure = data.delta.map((delta, i) => delta * data.openInterest[i] * 100);
    data.gammaExposure = data.gamma.map((gamma, i) => gamma * data.openInterest[i] * 100);
    data.vegaExposure = data.vega.map((vega, i) => vega * data.openInterest[i] * 100);
    data.vannaExposure = data.vanna.map((vanna, i) => vanna * data.openInterest[i] * 100);
    data.charmExposure = data.charm.map((charm, i) => charm * data.openInterest[i] * 100);
    data.vommaExposure = data.vomma.map((vomma, i) => vomma * data.openInterest[i] * 100);
    data.speedExposure = data.speed.map((speed, i) => speed * data.openInterest[i] * 100);

    return data;
}

function populateExpirations(expirations) {
    const select = document.getElementById('expirations');
    select.innerHTML = '';
    const uniqueExpirations = [...new Set(expirations)];
    console.log('Unique Expirations:', uniqueExpirations);

    if (uniqueExpirations.length === 0) {
        alert('No valid expiration dates returned. Check console for raw response.');
        return;
    }

    uniqueExpirations.forEach(exp => {
        const option = document.createElement('option');
        option.value = exp;
        option.textContent = exp;
        select.appendChild(option);
    });
    console.log('Populated Expirations:', uniqueExpirations);
}

function filterAndProcessStrikes() {
    if (!cachedChainData) {
        alert('No chain data cached yet. Fetch option chains first.');
        return;
    }
    console.log('Filtering strikes from cached data:', cachedChainData);
    processOptionChain(cachedChainData);
}

function updateCharts() {
    if (!cachedChainData) {
        console.log('No cached data yet to update charts.');
        return;
    }
    console.log('Updating charts based on checkbox selection:', {
        delta: document.getElementById('deltaCheck').checked,
        gamma: document.getElementById('gammaCheck').checked,
        vega: document.getElementById('vegaCheck').checked,
        vanna: document.getElementById('vannaCheck').checked,
        charm: document.getElementById('charmCheck').checked,
        vomma: document.getElementById('vommaCheck').checked,
        speed: document.getElementById('speedCheck').checked
    });
    processOptionChain(cachedChainData);
}

function processOptionChain(data) {
    const selectedExpirations = Array.from(document.getElementById('expirations').selectedOptions).map(opt => opt.value);
    const aggregation = document.querySelector('input[name="agg"]:checked').value;
    const underlyingPrice = data.underlyingPrice ? data.underlyingPrice[0] : cachedChainData.underlyingPrice[0];
    const strikesAbove = parseInt(document.getElementById('strikesAbove').value) || 0;
    const strikesBelow = parseInt(document.getElementById('strikesBelow').value) || 0;
    const showDelta = document.getElementById('deltaCheck').checked;
    const showGamma = document.getElementById('gammaCheck').checked;
    const showVega = document.getElementById('vegaCheck').checked;
    const showVanna = document.getElementById('vannaCheck').checked;
    const showCharm = document.getElementById('charmCheck').checked;
    const showVomma = document.getElementById('vommaCheck').checked;
    const showSpeed = document.getElementById('speedCheck').checked;

    console.log('Underlying Price for Plotting:', underlyingPrice, 'Strikes Above:', strikesAbove, 'Strikes Below:', strikesBelow);

    const filteredData = {
        strike: [],
        side: [],
        delta: [],
        gamma: [],
        vega: [],
        vanna: [],
        charm: [],
        vomma: [],
        speed: [],
        openInterest: [],
        volume: [],
        iv: [],
        expiration: [],
        underlyingPrice: [],
        dte: [],
        deltaExposure: [],
        gammaExposure: [],
        vegaExposure: [],
        vannaExposure: [],
        charmExposure: [],
        vommaExposure: [],
        speedExposure: []
    };

    data.strike.forEach((strike, i) => {
        const expDate = new Date(data.expiration[i] * 1000).toISOString().split('T')[0];
        if (selectedExpirations.includes(expDate)) {
            filteredData.strike.push(strike);
            filteredData.side.push(data.side[i]);
            filteredData.delta.push(data.delta[i] || 0);
            filteredData.gamma.push(data.gamma[i] || 0);
            filteredData.vega.push(data.vega[i] || 0);
            filteredData.vanna.push(data.vanna[i] || 0);
            filteredData.charm.push(data.charm[i] || 0);
            filteredData.vomma.push(data.vomma[i] || 0);
            filteredData.speed.push(data.speed[i] || 0);
            filteredData.openInterest.push(data.openInterest[i] || 0);
            filteredData.volume.push(data.volume[i] || 0);
            filteredData.iv.push(data.iv[i] || 0);
            filteredData.expiration.push(data.expiration[i]);
            filteredData.underlyingPrice.push(data.underlyingPrice[i]);
            filteredData.dte.push(data.dte ? data.dte[i] : Math.floor((new Date(data.expiration[i] * 1000) - new Date()) / (1000 * 60 * 60 * 24)));
            filteredData.deltaExposure.push(data.deltaExposure[i] || 0);
            filteredData.gammaExposure.push(data.gammaExposure[i] || 0);
            filteredData.vegaExposure.push(data.vegaExposure[i] || 0);
            filteredData.vannaExposure.push(data.vannaExposure[i] || 0);
            filteredData.charmExposure.push(data.charmExposure[i] || 0);
            filteredData.vommaExposure.push(data.vommaExposure[i] || 0);
            filteredData.speedExposure.push(data.speedExposure[i] || 0);
        }
    });

    const sortedStrikes = [...new Set(filteredData.strike)].sort((a, b) => a - b);
    const closestIdx = sortedStrikes.reduce((idx, strike, i) => {
        return Math.abs(strike - underlyingPrice) < Math.abs(sortedStrikes[idx] - underlyingPrice) ? i : idx;
    }, 0);

    const startIdx = Math.max(0, closestIdx - strikesBelow);
    const endIdx = Math.min(sortedStrikes.length - 1, closestIdx + strikesAbove);
    const selectedStrikes = sortedStrikes.slice(startIdx, endIdx + 1);

    const finalData = {
        strike: [],
        side: [],
        delta: [],
        gamma: [],
        vega: [],
        vanna: [],
        charm: [],
        vomma: [],
        speed: [],
        openInterest: [],
        volume: [],
        iv: [],
        expiration: [],
        underlyingPrice: [],
        dte: [],
        deltaExposure: [],
        gammaExposure: [],
        vegaExposure: [],
        vannaExposure: [],
        charmExposure: [],
        vommaExposure: [],
        speedExposure: []
    };

    filteredData.strike.forEach((strike, i) => {
        if (selectedStrikes.includes(strike)) {
            finalData.strike.push(strike);
            finalData.side.push(filteredData.side[i]);
            finalData.delta.push(filteredData.delta[i]);
            finalData.gamma.push(filteredData.gamma[i]);
            finalData.vega.push(filteredData.vega[i]);
            finalData.vanna.push(filteredData.vanna[i]);
            finalData.charm.push(filteredData.charm[i]);
            finalData.vomma.push(filteredData.vomma[i]);
            finalData.speed.push(filteredData.speed[i]);
            finalData.openInterest.push(filteredData.openInterest[i]);
            finalData.volume.push(filteredData.volume[i]);
            finalData.iv.push(filteredData.iv[i]);
            finalData.expiration.push(filteredData.expiration[i]);
            finalData.underlyingPrice.push(filteredData.underlyingPrice[i]);
            finalData.dte.push(filteredData.dte[i]);
            finalData.deltaExposure.push(filteredData.deltaExposure[i]);
            finalData.gammaExposure.push(filteredData.gammaExposure[i]);
            finalData.vegaExposure.push(filteredData.vegaExposure[i]);
            finalData.vannaExposure.push(filteredData.vannaExposure[i]);
            finalData.charmExposure.push(filteredData.charmExposure[i]);
            finalData.vommaExposure.push(filteredData.vommaExposure[i]);
            finalData.speedExposure.push(filteredData.speedExposure[i]);
        }
    });

    console.log('Final Data before processing:', finalData);

    // Destroy existing charts to prevent canvas reuse errors
    Object.values(defaultCharts).forEach(chart => {
        if (chart.instance) chart.instance.destroy();
    });
    customCharts.forEach(chart => {
        if (chart.instance) chart.instance.destroy();
    });

    if (aggregation === 'sum') {
        const exposures = calculateSummedExposures(finalData);
        console.log('Summed Exposures:', exposures);

        if (showDelta) defaultCharts.delta.instance = plotChart(defaultCharts.delta.ctx, null, exposures.strikes, exposures.deltaExposures, defaultCharts.delta.label, defaultCharts.delta.color, underlyingPrice, defaultCharts.delta.chartType, defaultCharts.delta.swapAxes);
        if (showGamma) defaultCharts.gamma.instance = plotChart(defaultCharts.gamma.ctx, null, exposures.strikes, exposures.gammaExposures, defaultCharts.gamma.label, defaultCharts.gamma.color, underlyingPrice, defaultCharts.gamma.chartType, defaultCharts.gamma.swapAxes);
        if (showVega) defaultCharts.vega.instance = plotChart(defaultCharts.vega.ctx, null, exposures.strikes, exposures.vegaExposures, defaultCharts.vega.label, defaultCharts.vega.color, underlyingPrice, defaultCharts.vega.chartType, defaultCharts.vega.swapAxes);
        if (showVanna) defaultCharts.vanna.instance = plotChart(defaultCharts.vanna.ctx, null, exposures.strikes, exposures.vannaExposures, defaultCharts.vanna.label, defaultCharts.vanna.color, underlyingPrice, defaultCharts.vanna.chartType, defaultCharts.vanna.swapAxes);
        if (showCharm) defaultCharts.charm.instance = plotChart(defaultCharts.charm.ctx, null, exposures.strikes, exposures.charmExposures, defaultCharts.charm.label, defaultCharts.charm.color, underlyingPrice, defaultCharts.charm.chartType, defaultCharts.charm.swapAxes);
        if (showVomma) defaultCharts.vomma.instance = plotChart(defaultCharts.vomma.ctx, null, exposures.strikes, exposures.vommaExposures, defaultCharts.vomma.label, defaultCharts.vomma.color, underlyingPrice, defaultCharts.vomma.chartType, defaultCharts.vomma.swapAxes);
        if (showSpeed) defaultCharts.speed.instance = plotChart(defaultCharts.speed.ctx, null, exposures.strikes, exposures.speedExposures, defaultCharts.speed.label, defaultCharts.speed.color, underlyingPrice, defaultCharts.speed.chartType, defaultCharts.speed.swapAxes);

        plotCustomCharts(exposures, finalData, underlyingPrice, 'sum');
    } else {
        const exposuresByExp = calculateSeparateExposures(finalData);
        console.log('Separate Exposures by Expiry:', exposuresByExp);

        if (showDelta) defaultCharts.delta.instance = plotChartWithDatasets(defaultCharts.delta.ctx, null, exposuresByExp, defaultCharts.delta.exposure, defaultCharts.delta.label, underlyingPrice, defaultCharts.delta.chartType, defaultCharts.delta.swapAxes);
        if (showGamma) defaultCharts.gamma.instance = plotChartWithDatasets(defaultCharts.gamma.ctx, null, exposuresByExp, defaultCharts.gamma.exposure, defaultCharts.gamma.label, underlyingPrice, defaultCharts.gamma.chartType, defaultCharts.gamma.swapAxes);
        if (showVega) defaultCharts.vega.instance = plotChartWithDatasets(defaultCharts.vega.ctx, null, exposuresByExp, defaultCharts.vega.exposure, defaultCharts.vega.label, underlyingPrice, defaultCharts.vega.chartType, defaultCharts.vega.swapAxes);
        if (showVanna) defaultCharts.vanna.instance = plotChartWithDatasets(defaultCharts.vanna.ctx, null, exposuresByExp, defaultCharts.vanna.exposure, defaultCharts.vanna.label, underlyingPrice, defaultCharts.vanna.chartType, defaultCharts.vanna.swapAxes);
        if (showCharm) defaultCharts.charm.instance = plotChartWithDatasets(defaultCharts.charm.ctx, null, exposuresByExp, defaultCharts.charm.exposure, defaultCharts.charm.label, underlyingPrice, defaultCharts.charm.chartType, defaultCharts.charm.swapAxes);
        if (showVomma) defaultCharts.vomma.instance = plotChartWithDatasets(defaultCharts.vomma.ctx, null, exposuresByExp, defaultCharts.vomma.exposure, defaultCharts.vomma.label, underlyingPrice, defaultCharts.vomma.chartType, defaultCharts.vomma.swapAxes);
        if (showSpeed) defaultCharts.speed.instance = plotChartWithDatasets(defaultCharts.speed.ctx, null, exposuresByExp, defaultCharts.speed.exposure, defaultCharts.speed.label, underlyingPrice, defaultCharts.speed.chartType, defaultCharts.speed.swapAxes);

        plotCustomCharts(exposuresByExp, finalData, underlyingPrice, 'separate');
    }
}

function calculateSummedExposures(data) {
    const uniqueStrikes = [...new Set(data.strike)].sort((a, b) => a - b);
    const deltaExposures = new Array(uniqueStrikes.length).fill(0);
    const gammaExposures = new Array(uniqueStrikes.length).fill(0);
    const vegaExposures = new Array(uniqueStrikes.length).fill(0);
    const vannaExposures = new Array(uniqueStrikes.length).fill(0);
    const charmExposures = new Array(uniqueStrikes.length).fill(0);
    const vommaExposures = new Array(uniqueStrikes.length).fill(0);
    const speedExposures = new Array(uniqueStrikes.length).fill(0);

    data.strike.forEach((strike, i) => {
        const strikeIdx = uniqueStrikes.indexOf(strike);
        const side = data.side[i];
        deltaExposures[strikeIdx] += data.deltaExposure[i];
        gammaExposures[strikeIdx] += data.gammaExposure[i] * (side === 'call' ? 1 : -1);
        vegaExposures[strikeIdx] += data.vegaExposure[i] * (side === 'call' ? 1 : -1);
        vannaExposures[strikeIdx] += data.vannaExposure[i] * (side === 'call' ? 1 : -1);
        charmExposures[strikeIdx] += data.charmExposure[i] * (side === 'call' ? 1 : -1);
        vommaExposures[strikeIdx] += data.vommaExposure[i] * (side === 'call' ? 1 : -1);
        speedExposures[strikeIdx] += data.speedExposure[i] * (side === 'call' ? 1 : -1);
    });

    return { strikes: uniqueStrikes, deltaExposures, gammaExposures, vegaExposures, vannaExposures, charmExposures, vommaExposures, speedExposures };
}

function calculateSeparateExposures(data) {
    const exposuresByExp = {};
    const uniqueExpirations = [...new Set(data.expiration)];

    uniqueExpirations.forEach(exp => {
        const strikeMap = {};
        data.strike.forEach((strike, i) => {
            if (data.expiration[i] === exp) {
                if (!strikeMap[strike]) {
                    strikeMap[strike] = { call: null, put: null };
                }
                if (data.side[i] === 'call') strikeMap[strike].call = i;
                else if (data.side[i] === 'put') strikeMap[strike].put = i;
            }
        });

        const expData = {
            strikes: [],
            deltaExposures: [],
            gammaExposures: [],
            vegaExposures: [],
            vannaExposures: [],
            charmExposures: [],
            vommaExposures: [],
            speedExposures: [],
        };
        const strikes = [...new Set(Object.keys(strikeMap))].sort((a, b) => a - b);

        strikes.forEach(strike => {
            const callIdx = strikeMap[strike].call;
            const putIdx = strikeMap[strike].put;
            expData.strikes.push(Number(strike));
            expData.deltaExposures.push(
                (callIdx !== null ? data.deltaExposure[callIdx] : 0) +
                (putIdx !== null ? data.deltaExposure[putIdx] : 0)
            );
            expData.gammaExposures.push(
                (callIdx !== null ? data.gammaExposure[callIdx] : 0) -
                (putIdx !== null ? data.gammaExposure[putIdx] : 0)
            );
            expData.vegaExposures.push(
                (callIdx !== null ? data.vegaExposure[callIdx] : 0) -
                (putIdx !== null ? data.vegaExposure[putIdx] : 0)
            );
            expData.vannaExposures.push(
                (callIdx !== null ? data.vannaExposure[callIdx] : 0) -
                (putIdx !== null ? data.vannaExposure[putIdx] : 0)
            );
            expData.charmExposures.push(
                (callIdx !== null ? data.charmExposure[callIdx] : 0) -
                (putIdx !== null ? data.charmExposure[putIdx] : 0)
            );
            expData.vommaExposures.push(
                (callIdx !== null ? data.vommaExposure[callIdx] : 0) -
                (putIdx !== null ? data.vommaExposure[putIdx] : 0)
            );
            expData.speedExposures.push(
                (callIdx !== null ? data.speedExposure[callIdx] : 0) -
                (putIdx !== null ? data.speedExposure[putIdx] : 0)
            );
        });

        const dateStr = new Date(exp * 1000).toISOString().split('T')[0];
        exposuresByExp[dateStr] = expData;
    });

    return exposuresByExp;
}

function plotChart(ctx, chartInstance, strikes, data, label, color, underlyingPrice, chartType = 'line', swapAxes = false) {
    if (chartInstance) chartInstance.destroy();

    const minY = Math.min(...data.filter(v => isFinite(v)));
    const maxY = Math.max(...data.filter(v => isFinite(v)));
    const xData = swapAxes ? data : strikes;
    const yData = swapAxes ? strikes : data;
    const xTitle = swapAxes ? label : 'Strike Price';
    const yTitle = swapAxes ? 'Strike Price' : label;

    const datasets = [
        {
            label: label,
            data: swapAxes ? strikes.map((strike, i) => ({ x: data[i], y: strike })) : data,
            borderColor: color,
            backgroundColor: chartType === 'bar' ? color : undefined,
            fill: false,
            barPercentage: 0.9,
            categoryPercentage: 1.0
        },
        ...(swapAxes ? [] : [{
            label: 'Current Price',
            data: [
                { x: underlyingPrice, y: minY },
                { x: underlyingPrice, y: maxY }
            ],
            borderColor: 'purple',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 0,
            showLine: true,
            spanGaps: true,
            stepped: false
        }])
    ];

    chartInstance = new Chart(ctx, {
        type: chartType,
        data: {
            labels: swapAxes ? undefined : strikes,
            datasets
        },
        options: {
            responsive: true,
            indexAxis: swapAxes && chartType === 'bar' ? 'y' : 'x',
            scales: {
                x: { 
                    type: 'linear',
                    title: { display: true, text: xTitle }
                },
                y: { 
                    type: 'linear',
                    title: { display: true, text: yTitle }
                }
            },
            plugins: {
                title: { display: true, text: `${label} by ${swapAxes ? label : 'Strike Price'}` },
                legend: { display: true }
            }
        }
    });

    return chartInstance;
}

function plotChartWithDatasets(ctx, chartInstance, exposuresByExp, exposureType, title, underlyingPrice, chartType = 'line', swapAxes = false) {
    if (chartInstance) chartInstance.destroy();

    const strikes = Object.values(exposuresByExp)[0].strikes;
    const allValues = Object.values(exposuresByExp).flatMap(exp => exp[exposureType]).filter(v => isFinite(v));
    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);
    const datasets = Object.keys(exposuresByExp).map((exp, i) => {
        const colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink', 'cyan', 'magenta'];
        const data = swapAxes ? strikes.map((strike, idx) => ({ x: exposuresByExp[exp][exposureType][idx], y: strike })) : exposuresByExp[exp][exposureType];
        return {
            label: `${title} - ${exp}`,
            data: data,
            borderColor: colors[i % colors.length],
            backgroundColor: chartType === 'bar' ? colors[i % colors.length] : undefined,
            fill: false,
            barPercentage: 0.9,
            categoryPercentage: 1.0
        };
    });

    if (!swapAxes) {
        datasets.push({
            label: 'Current Price',
            data: [
                { x: underlyingPrice, y: minY },
                { x: underlyingPrice, y: maxY }
            ],
            borderColor: 'purple',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 0,
            showLine: true,
            spanGaps: true,
            stepped: false
        });
    }

    chartInstance = new Chart(ctx, {
        type: chartType,
        data: { 
            labels: swapAxes ? undefined : strikes, 
            datasets 
        },
        options: {
            responsive: true,
            indexAxis: swapAxes && chartType === 'bar' ? 'y' : 'x',
            scales: {
                x: { 
                    type: 'linear',
                    title: { display: true, text: swapAxes ? title : 'Strike Price' }
                },
                y: { 
                    type: 'linear',
                    title: { display: true, text: swapAxes ? 'Strike Price' : title }
                }
            },
            plugins: {
                title: { display: true, text: `${title} by ${swapAxes ? title : 'Strike Price'}` },
                legend: { display: true }
            }
        }
    });

    return chartInstance;
}

function addCustomGraph() {
    const name = document.getElementById('customName').value.trim();
    const value1 = document.getElementById('value1').value;
    const operation = document.getElementById('operation').value;
    const value2 = document.getElementById('value2').value;
    const chartType = document.getElementById('chartType').value;
    const swapAxes = document.getElementById('swapAxes').checked;

    if (!name || !value1 || !operation || !value2) {
        alert('Please fill in all fields to create a custom graph.');
        return;
    }

    const chartId = `customChart_${customCharts.length}`;
    const chartContainer = document.createElement('div');
    chartContainer.className = `chart-container ${swapAxes ? 'swapped' : 'normal'}`;
    const canvas = document.createElement('canvas');
    canvas.id = chartId;

    const controls = document.createElement('div');
    controls.className = 'chart-controls';
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = true;
    toggle.id = `${chartId}_toggle`;
    toggle.addEventListener('change', () => {
        const chart = customCharts.find(c => c.chartId === chartId);
        chart.visible = toggle.checked;
        processOptionChain(cachedChainData);
    });
    const toggleLabel = document.createElement('label');
    toggleLabel.textContent = 'Show';
    toggleLabel.htmlFor = toggle.id;

    const remove = document.createElement('button');
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
        const index = customCharts.findIndex(c => c.chartId === chartId);
        if (index !== -1) {
            customCharts.splice(index, 1);
            chartContainer.remove();
            processOptionChain(cachedChainData);
        }
    });

    controls.appendChild(toggle);
    controls.appendChild(toggleLabel);
    controls.appendChild(remove);
    chartContainer.appendChild(canvas);
    chartContainer.appendChild(controls);
    document.getElementById('customCharts').appendChild(chartContainer);

    customCharts.push({ name, value1, operation, value2, chartType, swapAxes, chartId, instance: null, visible: true, container: chartContainer });

    if (cachedChainData) {
        processOptionChain(cachedChainData);
    } else {
        alert('Fetch option chains first to plot custom graphs.');
    }

    document.getElementById('customName').value = '';
    document.getElementById('swapAxes').checked = false;
}

function plotCustomCharts(exposures, rawData, underlyingPrice, aggregation) {
    customCharts.forEach(chart => {
        const { name, value1, operation, value2, chartType, swapAxes, chartId, visible, container } = chart;
        const ctx = document.getElementById(chartId).getContext('2d');

        // Update container class based on swapAxes
        container.classList.toggle('normal', !swapAxes);
        container.classList.toggle('swapped', swapAxes);

        if (!visible) {
            if (chart.instance) chart.instance.destroy();
            chart.instance = null;
            return;
        }

        if (aggregation === 'sum') {
            const data1 = value1.endsWith('Exposure') ? exposures[`${value1.replace('Exposure', 'Exposures')}`] : rawData[value1];
            const data2 = value2.endsWith('Exposure') ? exposures[`${value2.replace('Exposure', 'Exposures')}`] : rawData[value2];

            const customData = exposures.strikes.map((strike, i) => {
                const v1 = data1[i] || 0;
                const v2 = data2[i] || 0;
                switch (operation) {
                    case 'multiply': return v1 * v2;
                    case 'add': return v1 + v2;
                    case 'subtract': return v1 - v2;
                    case 'divide': return safeDivision(v1, v2);
                    default: return v1 * v2;
                }
            });

            chart.instance = plotChart(ctx, chart.instance, exposures.strikes, customData, name, 'teal', underlyingPrice, chartType, swapAxes);
        } else {
            const exposuresByExp = {};
            Object.keys(exposures).forEach(exp => {
                const data1 = value1.endsWith('Exposure') ? exposures[exp][`${value1.replace('Exposure', 'Exposures')}`] : rawData[value1];
                const data2 = value2.endsWith('Exposure') ? exposures[exp][`${value2.replace('Exposure', 'Exposures')}`] : rawData[value2];

                const customData = exposures[exp].strikes.map((strike, i) => {
                    const v1 = data1[i] || 0;
                    const v2 = data2[i] || 0;
                    switch (operation) {
                        case 'multiply': return v1 * v2;
                        case 'add': return v1 + v2;
                        case 'subtract': return v1 - v2;
                        case 'divide': return safeDivision(v1, v2);
                        default: return v1 * v2;
                    }
                });

                exposuresByExp[exp] = { strikes: exposures[exp].strikes, [name]: customData };
            });

            chart.instance = plotChartWithDatasets(ctx, chart.instance, exposuresByExp, name, name, underlyingPrice, chartType, swapAxes);
        }
    });
}