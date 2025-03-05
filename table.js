// table.js

// Access cached data from localStorage
const cachedData = JSON.parse(localStorage.getItem('cachedChainData'));
if (!cachedData) {
    alert('No cached data available. Please fetch data from the main page first.');
    window.location.href = 'index.html';
    throw new Error('No cached data');
}

// Track sorting state
let sortColumn = 'strike';
let sortDirection = 1; // 1 for ascending, -1 for descending

// Mapping for display names and internal keys
const displayHeaders = {
    'openInterestCall': 'Open Interest Call',
    'volumeCall': 'Volume Call',
    'deltaCall': 'Delta Call',
    'gammaCall': 'Gamma Call',
    'vegaCall': 'Vega Call',
    'vannaCall': 'Vanna Call',
    'charmCall': 'Charm Call',
    'vommaCall': 'Vomma Call',
    'speedCall': 'Speed Call',
    'ivCall': 'IV Call',
    'expirationCall': 'Expiration Call',
    'dteCall': 'DTE Call',
    'deltaExposureCall': 'Delta Exposure Call',
    'gammaExposureCall': 'Gamma Exposure Call',
    'vegaExposureCall': 'Vega Exposure Call',
    'vannaExposureCall': 'Vanna Exposure Call',
    'charmExposureCall': 'Charm Exposure Call',
    'vommaExposureCall': 'Vomma Exposure Call',
    'speedExposureCall': 'Speed Exposure Call',
    'strike': 'Strike',
    'openInterestPut': 'Open Interest Put',
    'volumePut': 'Volume Put',
    'deltaPut': 'Delta Put',
    'gammaPut': 'Gamma Put',
    'vegaPut': 'Vega Put',
    'vannaPut': 'Vanna Put',
    'charmPut': 'Charm Put',
    'vommaPut': 'Vomma Put',
    'speedPut': 'Speed Put',
    'ivPut': 'IV Put',
    'expirationPut': 'Expiration Put',
    'dtePut': 'DTE Put',
    'deltaExposurePut': 'Delta Exposure Put',
    'gammaExposurePut': 'Gamma Exposure Put',
    'vegaExposurePut': 'Vega Exposure Put',
    'vannaExposurePut': 'Vanna Exposure Put',
    'charmExposurePut': 'Charm Exposure Put',
    'vommaExposurePut': 'Vomma Exposure Put',
    'speedExposurePut': 'Speed Exposure Put'
};

// Add custom exposures dynamically from cachedData
Object.keys(cachedData).forEach(key => {
    if (!displayHeaders[`${key}Call`] && !['strike', 'side', 'expiration', 'underlyingPrice', 'dte'].includes(key)) {
        displayHeaders[`${key}Call`] = `${key} Call`;
        displayHeaders[`${key}Put`] = `${key} Put`;
    }
});

// Function to filter data by strikes and expiration
function filterDataByExpiration(data, underlyingPrice, strikesAbove, strikesBelow, expiration) {
    const sortedStrikes = [...new Set(data.strike)].sort((a, b) => a - b);
    const closestIdx = sortedStrikes.reduce((idx, strike, i) => {
        return Math.abs(strike - underlyingPrice) < Math.abs(sortedStrikes[idx] - underlyingPrice) ? i : idx;
    }, 0);

    const startIdx = Math.max(0, closestIdx - strikesBelow);
    const endIdx = Math.min(sortedStrikes.length - 1, closestIdx + strikesAbove);
    const selectedStrikes = sortedStrikes.slice(startIdx, endIdx + 1);

    const filtered = {
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
        dte: [],
        deltaExposure: [],
        gammaExposure: [],
        vegaExposure: [],
        vannaExposure: [],
        charmExposure: [],
        vommaExposure: [],
        speedExposure: [],
        underlyingPrice: []
    };

    // Dynamically include custom exposures
    Object.keys(data).forEach(key => {
        if (!['strike', 'side', 'delta', 'gamma', 'vega', 'vanna', 'charm', 'vomma', 'speed', 'openInterest', 'volume', 'iv', 'expiration', 'dte', 'deltaExposure', 'gammaExposure', 'vegaExposure', 'vannaExposure', 'charmExposure', 'vommaExposure', 'speedExposure', 'underlyingPrice'].includes(key)) {
            filtered[key] = [];
        }
    });

    data.strike.forEach((strike, i) => {
        const expDate = new Date(data.expiration[i] * 1000).toISOString().split('T')[0];
        if (selectedStrikes.includes(strike) && expDate === expiration) {
            filtered.strike.push(strike);
            filtered.side.push(data.side[i]);
            filtered.delta.push(data.delta[i] || 0);
            filtered.gamma.push(data.gamma[i] || 0);
            filtered.vega.push(data.vega[i] || 0);
            filtered.vanna.push(data.vanna[i] || 0);
            filtered.charm.push(data.charm[i] || 0);
            filtered.vomma.push(data.vomma[i] || 0);
            filtered.speed.push(data.speed[i] || 0);
            filtered.openInterest.push(data.openInterest[i] || 0);
            filtered.volume.push(data.volume[i] || 0);
            filtered.iv.push(data.iv[i] || 0);
            filtered.expiration.push(data.expiration[i]);
            filtered.dte.push(data.dte ? data.dte[i] : Math.floor((new Date(data.expiration[i] * 1000) - new Date()) / (1000 * 60 * 60 * 24)));
            filtered.deltaExposure.push(data.deltaExposure[i] || 0);
            filtered.gammaExposure.push(data.gammaExposure[i] || 0);
            filtered.vegaExposure.push(data.vegaExposure[i] || 0);
            filtered.vannaExposure.push(data.vannaExposure[i] || 0);
            filtered.charmExposure.push(data.charmExposure[i] || 0);
            filtered.vommaExposure.push(data.vommaExposure[i] || 0);
            filtered.speedExposure.push(data.speedExposure[i] || 0);
            filtered.underlyingPrice.push(data.underlyingPrice[i]);
            Object.keys(data).forEach(key => {
                if (!['strike', 'side', 'delta', 'gamma', 'vega', 'vanna', 'charm', 'vomma', 'speed', 'openInterest', 'volume', 'iv', 'expiration', 'dte', 'deltaExposure', 'gammaExposure', 'vegaExposure', 'vannaExposure', 'charmExposure', 'vommaExposure', 'speedExposure', 'underlyingPrice'].includes(key)) {
                    filtered[key].push(data[key][i] || 0);
                }
            });
        }
    });

    return sortData(filtered);
}

// Function to sort data by column
function sortData(data) {
    const indices = data.strike.map((_, i) => i);
    indices.sort((a, b) => {
        let valueA, valueB;
        switch (sortColumn) {
            case 'strike':
                valueA = data.strike[a];
                valueB = data.strike[b];
                break;
            case 'openInterestCall':
                valueA = data.side[a] === 'call' ? data.openInterest[a] : (data.side[b] === 'call' ? 0 : data.openInterest[a]);
                valueB = data.side[b] === 'call' ? data.openInterest[b] : (data.side[a] === 'call' ? 0 : data.openInterest[b]);
                break;
            case 'volumeCall':
                valueA = data.side[a] === 'call' ? data.volume[a] : (data.side[b] === 'call' ? 0 : data.volume[a]);
                valueB = data.side[b] === 'call' ? data.volume[b] : (data.side[a] === 'call' ? 0 : data.volume[b]);
                break;
            case 'deltaCall':
                valueA = data.side[a] === 'call' ? data.delta[a] : (data.side[b] === 'call' ? 0 : data.delta[a]);
                valueB = data.side[b] === 'call' ? data.delta[b] : (data.side[a] === 'call' ? 0 : data.delta[b]);
                break;
            case 'gammaCall':
                valueA = data.side[a] === 'call' ? data.gamma[a] : (data.side[b] === 'call' ? 0 : data.gamma[a]);
                valueB = data.side[b] === 'call' ? data.gamma[b] : (data.side[a] === 'call' ? 0 : data.gamma[b]);
                break;
            case 'vegaCall':
                valueA = data.side[a] === 'call' ? data.vega[a] : (data.side[b] === 'call' ? 0 : data.vega[a]);
                valueB = data.side[b] === 'call' ? data.vega[b] : (data.side[a] === 'call' ? 0 : data.vega[b]);
                break;
            case 'vannaCall':
                valueA = data.side[a] === 'call' ? data.vanna[a] : (data.side[b] === 'call' ? 0 : data.vanna[a]);
                valueB = data.side[b] === 'call' ? data.vanna[b] : (data.side[a] === 'call' ? 0 : data.vanna[b]);
                break;
            case 'charmCall':
                valueA = data.side[a] === 'call' ? data.charm[a] : (data.side[b] === 'call' ? 0 : data.charm[a]);
                valueB = data.side[b] === 'call' ? data.charm[b] : (data.side[a] === 'call' ? 0 : data.charm[b]);
                break;
            case 'vommaCall':
                valueA = data.side[a] === 'call' ? data.vomma[a] : (data.side[b] === 'call' ? 0 : data.vomma[a]);
                valueB = data.side[b] === 'call' ? data.vomma[b] : (data.side[a] === 'call' ? 0 : data.vomma[b]);
                break;
            case 'speedCall':
                valueA = data.side[a] === 'call' ? data.speed[a] : (data.side[b] === 'call' ? 0 : data.speed[a]);
                valueB = data.side[b] === 'call' ? data.speed[b] : (data.side[a] === 'call' ? 0 : data.speed[b]);
                break;
            case 'ivCall':
                valueA = data.side[a] === 'call' ? data.iv[a] : (data.side[b] === 'call' ? 0 : data.iv[a]);
                valueB = data.side[b] === 'call' ? data.iv[b] : (data.side[a] === 'call' ? 0 : data.iv[b]);
                break;
            case 'expirationCall':
                valueA = data.side[a] === 'call' ? data.expiration[a] : (data.side[b] === 'call' ? 0 : data.expiration[a]);
                valueB = data.side[b] === 'call' ? data.expiration[b] : (data.side[a] === 'call' ? 0 : data.expiration[b]);
                break;
            case 'dteCall':
                valueA = data.side[a] === 'call' ? data.dte[a] : (data.side[b] === 'call' ? 0 : data.dte[a]);
                valueB = data.side[b] === 'call' ? data.dte[b] : (data.side[a] === 'call' ? 0 : data.dte[b]);
                break;
            case 'deltaExposureCall':
                valueA = data.side[a] === 'call' ? data.deltaExposure[a] : (data.side[b] === 'call' ? 0 : data.deltaExposure[a]);
                valueB = data.side[b] === 'call' ? data.deltaExposure[b] : (data.side[a] === 'call' ? 0 : data.deltaExposure[b]);
                break;
            case 'gammaExposureCall':
                valueA = data.side[a] === 'call' ? data.gammaExposure[a] : (data.side[b] === 'call' ? 0 : data.gammaExposure[a]);
                valueB = data.side[b] === 'call' ? data.gammaExposure[b] : (data.side[a] === 'call' ? 0 : data.gammaExposure[b]);
                break;
            case 'vegaExposureCall':
                valueA = data.side[a] === 'call' ? data.vegaExposure[a] : (data.side[b] === 'call' ? 0 : data.vegaExposure[a]);
                valueB = data.side[b] === 'call' ? data.vegaExposure[b] : (data.side[a] === 'call' ? 0 : data.vegaExposure[b]);
                break;
            case 'vannaExposureCall':
                valueA = data.side[a] === 'call' ? data.vannaExposure[a] : (data.side[b] === 'call' ? 0 : data.vannaExposure[a]);
                valueB = data.side[b] === 'call' ? data.vannaExposure[b] : (data.side[a] === 'call' ? 0 : data.vannaExposure[b]);
                break;
            case 'charmExposureCall':
                valueA = data.side[a] === 'call' ? data.charmExposure[a] : (data.side[b] === 'call' ? 0 : data.charmExposure[a]);
                valueB = data.side[b] === 'call' ? data.charmExposure[b] : (data.side[a] === 'call' ? 0 : data.charmExposure[b]);
                break;
            case 'vommaExposureCall':
                valueA = data.side[a] === 'call' ? data.vommaExposure[a] : (data.side[b] === 'call' ? 0 : data.vommaExposure[a]);
                valueB = data.side[b] === 'call' ? data.vommaExposure[b] : (data.side[a] === 'call' ? 0 : data.vommaExposure[b]);
                break;
            case 'speedExposureCall':
                valueA = data.side[a] === 'call' ? data.speedExposure[a] : (data.side[b] === 'call' ? 0 : data.speedExposure[a]);
                valueB = data.side[b] === 'call' ? data.speedExposure[b] : (data.side[a] === 'call' ? 0 : data.speedExposure[b]);
                break;
            case 'openInterestPut':
                valueA = data.side[a] === 'put' ? data.openInterest[a] : (data.side[b] === 'put' ? 0 : data.openInterest[a]);
                valueB = data.side[b] === 'put' ? data.openInterest[b] : (data.side[a] === 'put' ? 0 : data.openInterest[b]);
                break;
            case 'volumePut':
                valueA = data.side[a] === 'put' ? data.volume[a] : (data.side[b] === 'put' ? 0 : data.volume[a]);
                valueB = data.side[b] === 'put' ? data.volume[b] : (data.side[a] === 'put' ? 0 : data.volume[b]);
                break;
            case 'deltaPut':
                valueA = data.side[a] === 'put' ? data.delta[a] : (data.side[b] === 'put' ? 0 : data.delta[a]);
                valueB = data.side[b] === 'put' ? data.delta[b] : (data.side[a] === 'put' ? 0 : data.delta[b]);
                break;
            case 'gammaPut':
                valueA = data.side[a] === 'put' ? data.gamma[a] : (data.side[b] === 'put' ? 0 : data.gamma[a]);
                valueB = data.side[b] === 'put' ? data.gamma[b] : (data.side[a] === 'put' ? 0 : data.gamma[b]);
                break;
            case 'vegaPut':
                valueA = data.side[a] === 'put' ? data.vega[a] : (data.side[b] === 'put' ? 0 : data.vega[a]);
                valueB = data.side[b] === 'put' ? data.vega[b] : (data.side[a] === 'put' ? 0 : data.vega[b]);
                break;
            case 'vannaPut':
                valueA = data.side[a] === 'put' ? data.vanna[a] : (data.side[b] === 'put' ? 0 : data.vanna[a]);
                valueB = data.side[b] === 'put' ? data.vanna[b] : (data.side[a] === 'put' ? 0 : data.vanna[b]);
                break;
            case 'charmPut':
                valueA = data.side[a] === 'put' ? data.charm[a] : (data.side[b] === 'put' ? 0 : data.charm[a]);
                valueB = data.side[b] === 'put' ? data.charm[b] : (data.side[a] === 'put' ? 0 : data.charm[b]);
                break;
            case 'vommaPut':
                valueA = data.side[a] === 'put' ? data.vomma[a] : (data.side[b] === 'put' ? 0 : data.vomma[a]);
                valueB = data.side[b] === 'put' ? data.vomma[b] : (data.side[a] === 'put' ? 0 : data.vomma[b]);
                break;
            case 'speedPut':
                valueA = data.side[a] === 'put' ? data.speed[a] : (data.side[b] === 'put' ? 0 : data.speed[a]);
                valueB = data.side[b] === 'put' ? data.speed[b] : (data.side[a] === 'put' ? 0 : data.speed[b]);
                break;
            case 'ivPut':
                valueA = data.side[a] === 'put' ? data.iv[a] : (data.side[b] === 'put' ? 0 : data.iv[a]);
                valueB = data.side[b] === 'put' ? data.iv[b] : (data.side[a] === 'put' ? 0 : data.iv[b]);
                break;
            case 'expirationPut':
                valueA = data.side[a] === 'put' ? data.expiration[a] : (data.side[b] === 'put' ? 0 : data.expiration[a]);
                valueB = data.side[b] === 'put' ? data.expiration[b] : (data.side[a] === 'put' ? 0 : data.expiration[b]);
                break;
            case 'dtePut':
                valueA = data.side[a] === 'put' ? data.dte[a] : (data.side[b] === 'put' ? 0 : data.dte[a]);
                valueB = data.side[b] === 'put' ? data.dte[b] : (data.side[a] === 'put' ? 0 : data.dte[b]);
                break;
            case 'deltaExposurePut':
                valueA = data.side[a] === 'put' ? data.deltaExposure[a] : (data.side[b] === 'put' ? 0 : data.deltaExposure[a]);
                valueB = data.side[b] === 'put' ? data.deltaExposure[b] : (data.side[a] === 'put' ? 0 : data.deltaExposure[b]);
                break;
            case 'gammaExposurePut':
                valueA = data.side[a] === 'put' ? data.gammaExposure[a] : (data.side[b] === 'put' ? 0 : data.gammaExposure[a]);
                valueB = data.side[b] === 'put' ? data.gammaExposure[b] : (data.side[a] === 'put' ? 0 : data.gammaExposure[b]);
                break;
            case 'vegaExposurePut':
                valueA = data.side[a] === 'put' ? data.vegaExposure[a] : (data.side[b] === 'put' ? 0 : data.vegaExposure[a]);
                valueB = data.side[b] === 'put' ? data.vegaExposure[b] : (data.side[a] === 'put' ? 0 : data.vegaExposure[b]);
                break;
            case 'vannaExposurePut':
                valueA = data.side[a] === 'put' ? data.vannaExposure[a] : (data.side[b] === 'put' ? 0 : data.vannaExposure[a]);
                valueB = data.side[b] === 'put' ? data.vannaExposure[b] : (data.side[a] === 'put' ? 0 : data.vannaExposure[b]);
                break;
            case 'charmExposurePut':
                valueA = data.side[a] === 'put' ? data.charmExposure[a] : (data.side[b] === 'put' ? 0 : data.charmExposure[a]);
                valueB = data.side[b] === 'put' ? data.charmExposure[b] : (data.side[a] === 'put' ? 0 : data.charmExposure[b]);
                break;
            case 'vommaExposurePut':
                valueA = data.side[a] === 'put' ? data.vommaExposure[a] : (data.side[b] === 'put' ? 0 : data.vommaExposure[a]);
                valueB = data.side[b] === 'put' ? data.vommaExposure[b] : (data.side[a] === 'put' ? 0 : data.vommaExposure[b]);
                break;
            case 'speedExposurePut':
                valueA = data.side[a] === 'put' ? data.speedExposure[a] : (data.side[b] === 'put' ? 0 : data.speedExposure[a]);
                valueB = data.side[b] === 'put' ? data.speedExposure[b] : (data.side[a] === 'put' ? 0 : data.speedExposure[b]);
                break;
            default:
                // Handle custom exposures dynamically
                if (sortColumn.endsWith('Call')) {
                    const baseKey = sortColumn.replace('Call', '');
                    valueA = data.side[a] === 'call' ? (data[baseKey] ? data[baseKey][a] : 0) : (data.side[b] === 'call' ? 0 : (data[baseKey] ? data[baseKey][a] : 0));
                    valueB = data.side[b] === 'call' ? (data[baseKey] ? data[baseKey][b] : 0) : (data.side[a] === 'call' ? 0 : (data[baseKey] ? data[baseKey][b] : 0));
                } else if (sortColumn.endsWith('Put')) {
                    const baseKey = sortColumn.replace('Put', '');
                    valueA = data.side[a] === 'put' ? (data[baseKey] ? data[baseKey][a] : 0) : (data.side[b] === 'put' ? 0 : (data[baseKey] ? data[baseKey][a] : 0));
                    valueB = data.side[b] === 'put' ? (data[baseKey] ? data[baseKey][b] : 0) : (data.side[a] === 'put' ? 0 : (data[baseKey] ? data[baseKey][b] : 0));
                } else {
                    valueA = data.strike[a];
                    valueB = data.strike[b];
                }
        }
        if (typeof valueA === 'number' && typeof valueB === 'number' && !isNaN(valueA) && !isNaN(valueB)) {
            return (valueA - valueB) * sortDirection;
        } else {
            console.warn(`Non-numeric or NaN value found in sorting column '${sortColumn}':`, { valueA, valueB });
            return (String(valueA) > String(valueB) ? 1 : String(valueA) < String(valueB) ? -1 : 0) * sortDirection;
        }
    });

    const sorted = {
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
        dte: [],
        deltaExposure: [],
        gammaExposure: [],
        vegaExposure: [],
        vannaExposure: [],
        charmExposure: [],
        vommaExposure: [],
        speedExposure: [],
        underlyingPrice: []
    };

    // Dynamically include custom exposures
    Object.keys(data).forEach(key => {
        if (!['strike', 'side', 'delta', 'gamma', 'vega', 'vanna', 'charm', 'vomma', 'speed', 'openInterest', 'volume', 'iv', 'expiration', 'dte', 'deltaExposure', 'gammaExposure', 'vegaExposure', 'vannaExposure', 'charmExposure', 'vommaExposure', 'speedExposure', 'underlyingPrice'].includes(key)) {
            sorted[key] = [];
        }
    });

    indices.forEach(i => {
        sorted.strike.push(data.strike[i]);
        sorted.side.push(data.side[i]);
        sorted.delta.push(data.delta[i]);
        sorted.gamma.push(data.gamma[i]);
        sorted.vega.push(data.vega[i]);
        sorted.vanna.push(data.vanna[i]);
        sorted.charm.push(data.charm[i]);
        sorted.vomma.push(data.vomma[i]);
        sorted.speed.push(data.speed[i]);
        sorted.openInterest.push(data.openInterest[i]);
        sorted.volume.push(data.volume[i]);
        sorted.iv.push(data.iv[i]);
        sorted.expiration.push(data.expiration[i]);
        sorted.dte.push(data.dte[i]);
        sorted.deltaExposure.push(data.deltaExposure[i]);
        sorted.gammaExposure.push(data.gammaExposure[i]);
        sorted.vegaExposure.push(data.vegaExposure[i]);
        sorted.vannaExposure.push(data.vannaExposure[i]);
        sorted.charmExposure.push(data.charmExposure[i]);
        sorted.vommaExposure.push(data.vommaExposure[i]);
        sorted.speedExposure.push(data.speedExposure[i]);
        sorted.underlyingPrice.push(data.underlyingPrice[i]);
        Object.keys(data).forEach(key => {
            if (!['strike', 'side', 'delta', 'gamma', 'vega', 'vanna', 'charm', 'vomma', 'speed', 'openInterest', 'volume', 'iv', 'expiration', 'dte', 'deltaExposure', 'gammaExposure', 'vegaExposure', 'vannaExposure', 'charmExposure', 'vommaExposure', 'speedExposure', 'underlyingPrice'].includes(key)) {
                sorted[key].push(data[key][i]);
            }
        });
    });

    return sorted;
}

// Function to create a single table (calls left, puts right)
function createSingleTable(data, underlyingPrice, visibleColumns, expiration) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Header row with sorting, ensuring symmetry around strike
    const callHeadersBase = [
        'openInterest', 'volume', 'delta', 'gamma', 'vega', 'vanna', 'charm', 'vomma', 'speed', 'iv',
        'expiration', 'dte', 'deltaExposure', 'gammaExposure', 'vegaExposure', 'vannaExposure',
        'charmExposure', 'vommaExposure', 'speedExposure'
    ];
    const callHeaders = callHeadersBase.map(h => `${h}Call`).filter(h => visibleColumns.includes(h));
    Object.keys(data).forEach(key => {
        if (!callHeadersBase.includes(key) && !['strike', 'side', 'underlyingPrice'].includes(key) && visibleColumns.includes(`${key}Call`)) {
            callHeaders.push(`${key}Call`);
        }
    });
    const putHeaders = callHeaders.map(h => h.replace('Call', 'Put')).reverse().filter(h => visibleColumns.includes(h));

    const headerRow = document.createElement('tr');
    callHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = displayHeaders[header];
        th.addEventListener('click', () => toggleSort(header));
        const sortArrow = document.createElement('span');
        sortArrow.className = sortColumn === header ? (sortDirection === 1 ? 'sort-arrow asc' : 'sort-arrow desc') : 'sort-arrow';
        th.appendChild(sortArrow);
        headerRow.appendChild(th);
    });
    const strikeTh = document.createElement('th');
    strikeTh.textContent = displayHeaders['strike'];
    strikeTh.addEventListener('click', () => toggleSort('strike'));
    const strikeSortArrow = document.createElement('span');
    strikeSortArrow.className = sortColumn === 'strike' ? (sortDirection === 1 ? 'sort-arrow asc' : 'sort-arrow desc') : 'sort-arrow';
    strikeTh.appendChild(strikeSortArrow);
    headerRow.appendChild(strikeTh);
    putHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = displayHeaders[header];
        th.addEventListener('click', () => toggleSort(header));
        const sortArrow = document.createElement('span');
        sortArrow.className = sortColumn === header ? (sortDirection === 1 ? 'sort-arrow asc' : 'sort-arrow desc') : 'sort-arrow';
        th.appendChild(sortArrow);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Sort the data
    const sortedData = sortData(data);

    // Group by strike
    const strikeGroups = {};
    sortedData.strike.forEach((strike, i) => {
        if (!strikeGroups[strike]) strikeGroups[strike] = { calls: [], puts: [] };
        if (sortedData.side[i] === 'call') strikeGroups[strike].calls.push(i);
        else if (sortedData.side[i] === 'put') strikeGroups[strike].puts.push(i);
    });

    // Create row data with one entry per strike
    const rowData = [];
    Object.keys(strikeGroups).forEach(strike => {
        const calls = strikeGroups[strike].calls;
        const puts = strikeGroups[strike].puts;

        const callIdx = calls.length > 0 ? calls[0] : -1;
        const putIdx = puts.length > 0 ? puts[0] : -1;

        let sortValue;
        if (sortColumn === 'strike') {
            sortValue = parseFloat(strike);
        } else if (sortColumn.endsWith('Call')) {
            const baseKey = sortColumn.replace('Call', '');
            sortValue = callIdx !== -1 ? (sortedData[baseKey] ? sortedData[baseKey][callIdx] : 0) : (putIdx !== -1 ? (sortedData[baseKey] ? sortedData[baseKey][putIdx] : 0) : 0);
        } else if (sortColumn.endsWith('Put')) {
            const baseKey = sortColumn.replace('Put', '');
            sortValue = putIdx !== -1 ? (sortedData[baseKey] ? sortedData[baseKey][putIdx] : 0) : (callIdx !== -1 ? (sortedData[baseKey] ? sortedData[baseKey][callIdx] : 0) : 0);
        } else {
            sortValue = parseFloat(strike); // Fallback
        }

        rowData.push({ strike: parseFloat(strike), callIdx, putIdx, sortValue });
    });

    // Sort rows by sortValue
    rowData.sort((a, b) => (a.sortValue - b.sortValue) * sortDirection);

    // Build table rows
    rowData.forEach(({ strike, callIdx, putIdx }) => {
        const row = document.createElement('tr');

        // Add call data (left side)
        if (callIdx !== -1 && callIdx < sortedData.strike.length) {
            callHeaders.forEach(header => {
                if (visibleColumns.includes(header)) {
                    const td = document.createElement('td');
                    const column = header.replace('Call', '');
                    const value = sortedData[column][callIdx] !== undefined ? sortedData[column][callIdx] : 0;
                    td.textContent = column === 'iv' ? value.toFixed(2) : (column === 'expiration' ? new Date(value * 1000).toISOString().split('T')[0] : value.toFixed(4));
                    row.appendChild(td);
                }
            });
        } else {
            callHeaders.filter(h => visibleColumns.includes(h)).forEach(() => {
                row.innerHTML += '<td></td>';
            });
        }

        // Add strike (center)
        const strikeCell = document.createElement('td');
        strikeCell.textContent = strike.toFixed(2);
        row.appendChild(strikeCell);

        // Add put data (right side)
        if (putIdx !== -1 && putIdx < sortedData.strike.length) {
            putHeaders.forEach(header => {
                if (visibleColumns.includes(header)) {
                    const td = document.createElement('td');
                    const column = header.replace('Put', '');
                    const value = sortedData[column][putIdx] !== undefined ? sortedData[column][putIdx] : 0;
                    td.textContent = column === 'iv' ? value.toFixed(2) : (column === 'expiration' ? new Date(value * 1000).toISOString().split('T')[0] : value.toFixed(4));
                    row.appendChild(td);
                }
            });
        } else {
            putHeaders.filter(h => visibleColumns.includes(h)).forEach(() => {
                row.innerHTML += '<td></td>';
            });
        }

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Add expiration header
    const expirationHeader = document.createElement('h2');
    expirationHeader.textContent = `Expiration: ${expiration}`;
    const container = document.createElement('div');
    container.appendChild(expirationHeader);
    container.appendChild(table);
    return container;
}

// Function to create separate tables for calls and puts
function createSeparateTables(data, underlyingPrice, visibleColumns, expiration) {
    const container = document.createElement('div');
    
    // Calls table
    const callsTable = document.createElement('table');
    const callsThead = document.createElement('thead');
    const callsTbody = document.createElement('tbody');
    const callsHeaderRow = document.createElement('tr');
    const callHeadersBase = [
        'openInterest', 'volume', 'delta', 'gamma', 'vega', 'vanna', 'charm', 'vomma', 'speed', 'iv',
        'expiration', 'dte', 'deltaExposure', 'gammaExposure', 'vegaExposure', 'vannaExposure',
        'charmExposure', 'vommaExposure', 'speedExposure'
    ];
    const callHeaders = callHeadersBase.map(h => `${h}Call`).filter(h => visibleColumns.includes(h));
    Object.keys(data).forEach(key => {
        if (!callHeadersBase.includes(key) && !['strike', 'side', 'underlyingPrice'].includes(key) && visibleColumns.includes(`${key}Call`)) {
            callHeaders.push(`${key}Call`);
        }
    });
    callHeaders.push('strike');
    callHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = displayHeaders[header];
        th.addEventListener('click', () => toggleSort(header));
        const sortArrow = document.createElement('span');
        sortArrow.className = sortColumn === header ? (sortDirection === 1 ? 'sort-arrow asc' : 'sort-arrow desc') : 'sort-arrow';
        th.appendChild(sortArrow);
        callsHeaderRow.appendChild(th);
    });
    callsThead.appendChild(callsHeaderRow);
    callsTable.appendChild(callsThead);

    // Puts table
    const putsTable = document.createElement('table');
    const putsThead = document.createElement('thead');
    const putsTbody = document.createElement('tbody');
    const putsHeaderRow = document.createElement('tr');
    const putHeadersBase = callHeadersBase;
    const putHeaders = putHeadersBase.map(h => `${h}Put`).filter(h => visibleColumns.includes(h));
    Object.keys(data).forEach(key => {
        if (!putHeadersBase.includes(key) && !['strike', 'side', 'underlyingPrice'].includes(key) && visibleColumns.includes(`${key}Put`)) {
            putHeaders.push(`${key}Put`);
        }
    });
    putHeaders.push('strike');
    putHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = displayHeaders[header];
        th.addEventListener('click', () => toggleSort(header));
        const sortArrow = document.createElement('span');
        sortArrow.className = sortColumn === header ? (sortDirection === 1 ? 'sort-arrow asc' : 'sort-arrow desc') : 'sort-arrow';
        th.appendChild(sortArrow);
        putsHeaderRow.appendChild(th);
    });
    putsThead.appendChild(putsHeaderRow);
    putsTable.appendChild(putsThead);

    // Sort and filter data by column
    const sortedData = sortData(data);

    // Collect all unique strikes and sort based on sortColumn
    const callData = sortedData.side.map((side, i) => side === 'call' ? i : -1).filter(i => i !== -1);
    const putData = sortedData.side.map((side, i) => side === 'put' ? i : -1).filter(i => i !== -1);

    // Fill calls table
    callData.forEach(index => {
        const row = document.createElement('tr');
        callHeaders.forEach(header => {
            const td = document.createElement('td');
            const column = header === 'strike' ? 'strike' : header.replace('Call', '');
            const value = sortedData[column][index] !== undefined ? sortedData[column][index] : 0;
            td.textContent = column === 'iv' ? value.toFixed(2) : (column === 'expiration' ? new Date(value * 1000).toISOString().split('T')[0] : value.toFixed(4));
            row.appendChild(td);
        });
        callsTbody.appendChild(row);
    });

    // Fill puts table
    putData.forEach(index => {
        const row = document.createElement('tr');
        putHeaders.forEach(header => {
            const td = document.createElement('td');
            const column = header === 'strike' ? 'strike' : header.replace('Put', '');
            const value = sortedData[column][index] !== undefined ? sortedData[column][index] : 0;
            td.textContent = column === 'iv' ? value.toFixed(2) : (column === 'expiration' ? new Date(value * 1000).toISOString().split('T')[0] : value.toFixed(4));
            row.appendChild(td);
        });
        putsTbody.appendChild(row);
    });

    callsTable.appendChild(callsTbody);
    putsTable.appendChild(putsTbody);

    const callsHeader = document.createElement('h2');
    callsHeader.textContent = `Call Options - Expiration: ${expiration}`;
    const putsHeader = document.createElement('h2');
    putsHeader.textContent = `Put Options - Expiration: ${expiration}`;
    container.appendChild(callsHeader);
    container.appendChild(callsTable);
    container.appendChild(putsHeader);
    container.appendChild(putsTable);
    return container;
}

// Function to toggle sorting
function toggleSort(column) {
    if (sortColumn === column) {
        sortDirection *= -1; // Reverse direction if same column
    } else {
        sortColumn = column;
        sortDirection = 1; // Default to ascending for new column
    }
    renderTable();
}

// Function to get visible columns
function getVisibleColumns() {
    const columns = [];
    if (document.getElementById('openInterestCheck').checked) {
        columns.push('openInterestCall');
        columns.push('openInterestPut');
    }
    if (document.getElementById('volumeCheck').checked) {
        columns.push('volumeCall');
        columns.push('volumePut');
    }
    if (document.getElementById('deltaCheck').checked) {
        columns.push('deltaCall');
        columns.push('deltaPut');
    }
    if (document.getElementById('gammaCheck').checked) {
        columns.push('gammaCall');
        columns.push('gammaPut');
    }
    if (document.getElementById('vegaCheck').checked) {
        columns.push('vegaCall');
        columns.push('vegaPut');
    }
    if (document.getElementById('vannaCheck').checked) {
        columns.push('vannaCall');
        columns.push('vannaPut');
    }
    if (document.getElementById('charmCheck').checked) {
        columns.push('charmCall');
        columns.push('charmPut');
    }
    if (document.getElementById('vommaCheck').checked) {
        columns.push('vommaCall');
        columns.push('vommaPut');
    }
    if (document.getElementById('speedCheck').checked) {
        columns.push('speedCall');
        columns.push('speedPut');
    }
    if (document.getElementById('ivCheck').checked) {
        columns.push('ivCall');
        columns.push('ivPut');
    }
    if (document.getElementById('expirationCheck').checked) {
        columns.push('expirationCall');
        columns.push('expirationPut');
    }
    if (document.getElementById('dteCheck').checked) {
        columns.push('dteCall');
        columns.push('dtePut');
    }
    if (document.getElementById('deltaExposureCheck').checked) {
        columns.push('deltaExposureCall');
        columns.push('deltaExposurePut');
    }
    if (document.getElementById('gammaExposureCheck').checked) {
        columns.push('gammaExposureCall');
        columns.push('gammaExposurePut');
    }
    if (document.getElementById('vegaExposureCheck').checked) {
        columns.push('vegaExposureCall');
        columns.push('vegaExposurePut');
    }
    if (document.getElementById('vannaExposureCheck').checked) {
        columns.push('vannaExposureCall');
        columns.push('vannaExposurePut');
    }
    if (document.getElementById('charmExposureCheck').checked) {
        columns.push('charmExposureCall');
        columns.push('charmExposurePut');
    }
    if (document.getElementById('vommaExposureCheck').checked) {
        columns.push('vommaExposureCall');
        columns.push('vommaExposurePut');
    }
    if (document.getElementById('speedExposureCheck').checked) {
        columns.push('speedExposureCall');
        columns.push('speedExposurePut');
    }
    // Add custom exposures
    Object.keys(cachedData).forEach(key => {
        if (!['strike', 'side', 'delta', 'gamma', 'vega', 'vanna', 'charm', 'vomma', 'speed', 'openInterest', 'volume', 'iv', 'expiration', 'dte', 'deltaExposure', 'gammaExposure', 'vegaExposure', 'vannaExposure', 'charmExposure', 'vommaExposure', 'speedExposure', 'underlyingPrice'].includes(key)) {
            const checkbox = document.getElementById(`${key}Check`);
            if (checkbox && checkbox.checked) {
                columns.push(`${key}Call`);
                columns.push(`${key}Put`);
            }
        }
    });
    if (document.getElementById('strikeCheck').checked) columns.push('strike');
    return columns;
}

// Function to populate custom exposure checkboxes
function populateCustomExposureColumns() {
    const container = document.getElementById('customExposureColumns');
    container.innerHTML = '';
    Object.keys(cachedData).forEach(key => {
        if (!['strike', 'side', 'delta', 'gamma', 'vega', 'vanna', 'charm', 'vomma', 'speed', 'openInterest', 'volume', 'iv', 'expiration', 'dte', 'deltaExposure', 'gammaExposure', 'vegaExposure', 'vannaExposure', 'charmExposure', 'vommaExposure', 'speedExposure', 'underlyingPrice'].includes(key)) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${key}Check`;
            const label = document.createElement('label');
            label.htmlFor = `${key}Check`;
            label.textContent = key;
            const div = document.createElement('div');
            div.style.display = 'inline-block';
            div.style.margin = '5px';
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        }
    });
}

// Function to export as CSV
function exportToCsv(data, visibleExpirations) {
    const headers = getVisibleColumns().map(col => displayHeaders[col]);
    const allRows = [];
    
    visibleExpirations.forEach(exp => {
        const filteredData = filterDataByExpiration(data, data.underlyingPrice[0], parseInt(document.getElementById('strikesAboveTable').value) || 0, parseInt(document.getElementById('strikesBelowTable').value) || 0, exp);
        const rows = filteredData.strike.map((_, i) => {
            const row = {};
            getVisibleColumns().forEach(col => {
                const column = col === 'strike' ? 'strike' : col.replace(/(Call|Put)/, '');
                const idx = col.endsWith('Call') ? filteredData.side.indexOf('call', i) : (col.endsWith('Put') ? filteredData.side.indexOf('put', i) : i);
                const value = idx !== -1 ? (filteredData[column][idx] || 0) : 0;
                row[displayHeaders[col]] = column === 'iv' ? value.toFixed(2) : (column === 'expiration' ? new Date(value * 1000).toISOString().split('T')[0] : value.toFixed(4));
            });
            row['Expiration'] = exp;
            return row;
        });
        allRows.push(...rows);
    });

    const csv = Papa.unparse({ fields: [...headers, 'Expiration'], data: allRows });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'option_chain_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Function to export as JSON
function exportToJson(data, visibleExpirations) {
    const headers = getVisibleColumns().map(col => displayHeaders[col]);
    const allRows = [];
    
    visibleExpirations.forEach(exp => {
        const filteredData = filterDataByExpiration(data, data.underlyingPrice[0], parseInt(document.getElementById('strikesAboveTable').value) || 0, parseInt(document.getElementById('strikesBelowTable').value) || 0, exp);
        const rows = filteredData.strike.map((_, i) => {
            const row = {};
            getVisibleColumns().forEach(col => {
                const column = col === 'strike' ? 'strike' : col.replace(/(Call|Put)/, '');
                const idx = col.endsWith('Call') ? filteredData.side.indexOf('call', i) : (col.endsWith('Put') ? filteredData.side.indexOf('put', i) : i);
                const value = idx !== -1 ? (filteredData[column][idx] || 0) : 0;
                row[displayHeaders[col]] = column === 'iv' ? value.toFixed(2) : (column === 'expiration' ? new Date(value * 1000).toISOString().split('T')[0] : value.toFixed(4));
            });
            row['Expiration'] = exp;
            return row;
        });
        allRows.push(...rows);
    });

    const json = JSON.stringify({ headers: [...headers, 'Expiration'], data: allRows }, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'option_chain_data.json');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Function to export as PDF
function exportToPdf(data, visibleExpirations) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const headers = [...getVisibleColumns().map(col => displayHeaders[col]), 'Expiration'];
    let startY = 10;

    visibleExpirations.forEach((exp, index) => {
        const filteredData = filterDataByExpiration(data, data.underlyingPrice[0], parseInt(document.getElementById('strikesAboveTable').value) || 0, parseInt(document.getElementById('strikesBelowTable').value) || 0, exp);
        const body = filteredData.strike.map((_, i) => {
            const row = [];
            getVisibleColumns().forEach(col => {
                const column = col === 'strike' ? 'strike' : col.replace(/(Call|Put)/, '');
                const idx = col.endsWith('Call') ? filteredData.side.indexOf('call', i) : (col.endsWith('Put') ? filteredData.side.indexOf('put', i) : i);
                const value = idx !== -1 ? (filteredData[column][idx] || 0) : 0;
                row.push(column === 'iv' ? value.toFixed(2) : (column === 'expiration' ? new Date(value * 1000).toISOString().split('T')[0] : value.toFixed(4)));
            });
            row.push(exp);
            return row;
        });

        if (body.length > 0) {
            doc.text(`Expiration: ${exp}`, 10, startY);
            startY += 10;
            doc.autoTable({
                head: [headers],
                body: body,
                startY: startY,
                theme: 'grid',
                styles: { fontSize: 8 },
                columnStyles: { 0: { cellWidth: 'auto' } }
            });
            startY = doc.lastAutoTable.finalY + 10;
            if (index < visibleExpirations.length - 1 && startY > 250) {
                doc.addPage();
                startY = 10;
            }
        }
    });

    doc.save('option_chain_data.pdf');
}

// Initial render
function renderTable() {
    const underlyingPrice = cachedData.underlyingPrice[0];
    const strikesAbove = parseInt(document.getElementById('strikesAboveTable').value) || 0;
    const strikesBelow = parseInt(document.getElementById('strikesBelowTable').value) || 0;
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';

    const format = document.querySelector('input[name="format"]:checked').value;
    const visibleColumns = getVisibleColumns();

    // Get unique expirations from cached data
    const uniqueExpirations = [...new Set(cachedData.expiration.map(exp => new Date(exp * 1000).toISOString().split('T')[0]))];
    const visibleExpirations = uniqueExpirations.filter(exp => document.getElementById(`expToggle_${exp}`).checked);

    if (visibleColumns.length === 0 || !visibleColumns.includes('strike')) {
        tableContainer.innerHTML = '<p>No columns selected or strike not included. Please select at least Strike and one other column.</p>';
        return;
    }

    visibleExpirations.forEach(expiration => {
        const filteredData = filterDataByExpiration(cachedData, underlyingPrice, strikesAbove, strikesBelow, expiration);
        if (filteredData.strike.length > 0) {
            if (format === 'single') {
                tableContainer.appendChild(createSingleTable(filteredData, underlyingPrice, visibleColumns, expiration));
            } else {
                tableContainer.appendChild(createSeparateTables(filteredData, underlyingPrice, visibleColumns, expiration));
            }
        }
    });
}

// Populate expiration toggles
function populateExpirationToggles() {
    const uniqueExpirations = [...new Set(cachedData.expiration.map(exp => new Date(exp * 1000).toISOString().split('T')[0]))];
    const toggleContainer = document.getElementById('expirationToggles');
    toggleContainer.innerHTML = '';

    uniqueExpirations.forEach(exp => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `expToggle_${exp}`;
        checkbox.checked = true;
        checkbox.addEventListener('change', renderTable);

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = exp;

        const div = document.createElement('div');
        div.style.display = 'inline-block';
        div.style.margin = '5px';
        div.appendChild(checkbox);
        div.appendChild(label);
        toggleContainer.appendChild(div);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filterTableButton').addEventListener('click', renderTable);
    document.querySelectorAll('input[name="format"]').forEach(input => {
        input.addEventListener('change', renderTable);
    });
    document.getElementById('applyColumnsButton').addEventListener('click', renderTable);
    document.getElementById('exportCsvButton').addEventListener('click', () => {
        const uniqueExpirations = [...new Set(cachedData.expiration.map(exp => new Date(exp * 1000).toISOString().split('T')[0]))];
        const visibleExpirations = uniqueExpirations.filter(exp => document.getElementById(`expToggle_${exp}`).checked);
        exportToCsv(cachedData, visibleExpirations);
    });
    document.getElementById('exportJsonButton').addEventListener('click', () => {
        const uniqueExpirations = [...new Set(cachedData.expiration.map(exp => new Date(exp * 1000).toISOString().split('T')[0]))];
        const visibleExpirations = uniqueExpirations.filter(exp => document.getElementById(`expToggle_${exp}`).checked);
        exportToJson(cachedData, visibleExpirations);
    });
    document.getElementById('exportPdfButton').addEventListener('click', () => {
        const uniqueExpirations = [...new Set(cachedData.expiration.map(exp => new Date(exp * 1000).toISOString().split('T')[0]))];
        const visibleExpirations = uniqueExpirations.filter(exp => document.getElementById(`expToggle_${exp}`).checked);
        exportToPdf(cachedData, visibleExpirations);
    });

    // Populate expiration toggles and custom columns, then initial render
    populateExpirationToggles();
    populateCustomExposureColumns();
    renderTable();
});