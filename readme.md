Option Chain Analysis Tool
Chart Example
Example chart showing Delta Exposure (placeholder image - replace with your own screenshot)
Option Chain Analysis Tool is a powerful web-based application for analyzing option chain data. It allows users to fetch real-time option data, visualize exposures like delta, gamma, and vanna through interactive charts, and explore detailed tabular views with export options. Built with HTML, JavaScript, and Chart.js, this tool leverages the marketdata.app API to provide a seamless experience for options traders and analysts.
 Features
Data Fetching: Retrieve option chain data for any stock symbol and cache it locally to minimize API usage.

Chart Visualization: Plot customizable charts for exposures including:
Delta

Gamma

Vega

Vanna

Charm

Vomma

Speed

Dynamic Strike Filtering: Adjust the number of strikes above and below the underlying price on-the-fly.

Aggregation Options: View exposures summed across expirations or separated by expiration date.

Custom Graphs: Create user-defined graphs by combining Greeks with mathematical operations (e.g., Vega * Gamma).

Tabular Data View: Display detailed option data in a sortable table with export capabilities (CSV, JSON, PDF).

 License
This project is licensed under the MIT License - see the LICENSE file for details. You’re free to use, modify, and distribute this software with minimal restrictions!
 Prerequisites
Web Browser: A modern browser like Chrome, Firefox, or Edge.

API Key: An API key from marketdata.app for fetching option data.

Local Server: A simple server to host the app locally (e.g., Python’s HTTP server).

 Installation
Follow these steps to get the tool running on your machine:
Clone the Repository  
bash

git clone https://github.com/[your-username]/option-chain-analysis.git
cd option-chain-analysis

Configure API Key  
Open index.js in a text editor.

Replace the placeholder API key with your own:
javascript

const apiKey = 'your-api-key-here'; // Replace with your marketdata.app API key

Host Locally  
Use a local server to serve the files (e.g., with Python):
bash

python -m http.server 8000

Open your browser and navigate to http://localhost:8000.

 Usage
Here’s how to use the tool step-by-step:
Enter Stock Symbol
Type a stock ticker (e.g., AAPL) into the "Stock Symbol" input field.

Load Expirations
Click "Load Expirations" to fetch available expiration dates for the symbol.

Select Expirations
Choose one or more expiration dates from the multi-select dropdown (hold Ctrl or Cmd to select multiple).

Fetch Option Chains
Click "Fetch Option Chains" to retrieve and process the data. You’ll be prompted to enter a risk-free rate and dividend yield (defaults to 0 if left blank).

Filter Strikes
Adjust the "Strikes Above" and "Strikes Below" inputs, then click "Filter Strikes" to narrow the displayed strike range.

Customize Charts  
Use checkboxes (e.g., "Delta", "Gamma") to toggle which exposures to display.

Click "Swap X/Y" or "Toggle Line/Bar" on each chart to adjust its orientation or type.

Create Custom Graphs  
In the "Create Custom Graph" section:
Enter a Graph Name (e.g., VegaGamma).

Select Value 1 and Value 2 (e.g., vegaExposure, gammaExposure).

Choose an Operation (*, +, -, /).

Pick a Chart Type (Line or Bar) and toggle Swap Axes.

Click "Add Graph" to render it.

View Data Table
Click "View Data Table" to open table.html in a new tab, where you can:
Switch between single or separate tables.

Filter strikes and columns.

Export data as CSV, JSON, or PDF.

 Screenshots
(Replace these placeholders with actual screenshots)  
Chart View:
Chart View  

Table View:
Table View

 Dependencies
The tool relies on the following external libraries, loaded via CDN:
Chart.js v4.4.1: For rendering interactive charts.

PapaParse v5.3.0: CSV parsing and exporting (used in table.js).

jsPDF v2.5.1: PDF generation (used in table.js).

jsPDF-AutoTable v3.5.23: Table formatting for PDF exports (used in table.js).

No local installation of these dependencies is required—just ensure an internet connection when running the app.
 How It Works
Core Components
index.html & index.js: 
Fetch option chain data from marketdata.app.

Compute Black-Scholes Greeks (vanna, charm, vomma, speed) not provided by the API.

Calculate per-option exposures (e.g., delta * openInterest * 100) and aggregate them per strike for plotting.

Render charts with Chart.js, supporting dynamic filtering and custom graphs.

table.html & table.js: 
Load cached data from localStorage.

Display data in a single table (calls and puts side-by-side) or separate tables.

Provide sorting, filtering, and export options.

Data Flow
User inputs a symbol and fetches expirations.

Selected expirations trigger API calls to fetch option chains.

Data is processed, cached in localStorage, and visualized in charts.

The table view reads cached data, allowing further exploration without additional API calls.

 Contributing
We’d love your help to improve this tool! Here’s how to contribute:
Fork the repo and clone it locally.

Create a branch (git checkout -b feature/your-feature).

Make your changes and commit them (git commit -m "Add feature X").

Push to your fork (git push origin feature/your-feature).

Open a pull request on GitHub.

See CONTRIBUTING.md for detailed guidelines.
 Issues & Support
Found a bug or have a feature request?  
Open an issue on the GitHub Issues page.  

For direct support, email [your-email@example.com (mailto:your-email@example.com)].

 Acknowledgments
Data Source: Powered by marketdata.app.

Libraries: Thanks to the Chart.js, PapaParse, and jsPDF communities.

Inspiration: Built for options traders seeking deeper market insights.

 Contact
Questions? Suggestions? Reach out:  
GitHub: /sp4cek4t  

Email: sp4cek4t@gmail.com

Happy analyzing! Enjoy exploring the world of options with this tool!  

