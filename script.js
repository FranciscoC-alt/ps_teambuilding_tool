document.addEventListener("DOMContentLoaded", function () {

    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchInput");
    const loadingIndicator = document.getElementById("loadingIndicator");

    // adding the delay lets the loading indicator get enabled properly
    function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    fetch("data.json")
        .then(response => response.json())
        .then(data => {

            searchButton.addEventListener("click", async function () {

                const query = searchInput.value.toLowerCase();

                // Show loading indicator
                loadingIndicator.style.display = "inline-block";
                await delay(100);

                const rankedResults = await rankResults(data, query);
                const topResults = rankedResults.slice(0, 10);

                renderData(topResults);

                // Hide loading indicator
                loadingIndicator.style.display = "none";
            });
        })
        .catch(error => console.error("Error fetching data:", error));

    // Rank results using BM25
    async function rankResults(data, query) {
        
        const k1 = 1.5;
        const b = 0.75;
        
        // Average doc lenght
        const adl = calculateADL(data);

        const results = await Promise.all(data.map(async item => {
            const score = await calculateScore(item.textContent.toLowerCase(), query.split(/\s+/), k1, b, adl, data);
            return { ...item, score: score };
        }));

        // Sort in descending order
        return results.sort((a, b) => b.score - a.score);
    }

    function calculateScore( text, query, k1, b, adl, data ) {
        let score = 0;

        query.forEach( word => {
            const tf = calculateTF( text, word );
            const length = text.split(/\s+/).length;

            const idf = calculateIDF( data, word );
            const num = tf * (k1 + 1);
            const den = tf + k1 * (1 - b + b * ( length / adl ));

            score += idf * (num / den);
        });

        return score;
    }

    // Term Frequency
    function calculateTF( text, term ) {
        const regex = new RegExp("\\b" + term + "\\b", "g");
        const matches = text.match( regex );
        return matches ? matches.length : 0;
    }

    // Average Document Length
    function calculateADL(data) {
        const totalLength = data.reduce((total, item) => total + item.textContent.split(/\s+/).length, 0);
        return totalLength / data.length;
    }

    // Inverse Document Frequency
    function calculateIDF(data, term) {
        const termDocs = data.filter(item => item.textContent.toLowerCase().includes(term)).length;
        const docs = data.length;
        return Math.log( ( docs - termDocs + 0.5) / (termDocs + 0.5) + 1 );
    }

    function renderData(data) {
        const table = document.querySelector("tbody");
        table.innerHTML = "";

        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><a href="${item.link}" target="_blank">${item.title}</a></td>
            `;
            table.appendChild(row);
        });
    }
});
