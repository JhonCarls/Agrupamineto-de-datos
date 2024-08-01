document.getElementById('startBtn').addEventListener('click', startClustering);

function startClustering() {
    // Limpiar el gráfico antes de dibujar
    d3.select("#chart").html("");

    // Generar un conjunto de datos más grande
    const data = generateData(100);

    // Configuración de D3
    const svg = d3.select("#chart").append("svg")
        .attr("width", '100%')
        .attr("height", 500);

    const margin = { top: 40, right: 200, bottom: 40, left: 40 },
        width = svg.node().getBoundingClientRect().width - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas
    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    x.domain(d3.extent(data, d => d.ingresos)).nice();
    y.domain(d3.extent(data, d => d.gasto)).nice();

    // Ejes
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10));
    g.append("g")
        .call(d3.axisLeft(y).ticks(10));

    // Dibujar círculos
    const circles = g.selectAll(".circle")
        .data(data)
        .enter().append("circle")
        .attr("class", "circle")
        .attr("cx", d => x(d.ingresos))
        .attr("cy", d => y(d.gasto))
        .attr("r", 5)
        .style("fill", "#999");

    // Aplicar algoritmo k-means
    const k = 3;
    let clusters = kmeans(data, k);

    // Actualizar posiciones y colores de los círculos
    circles.transition()
        .duration(1000)
        .attr("cx", d => x(d.ingresos))
        .attr("cy", d => y(d.gasto))
        .style("fill", d => d3.schemeCategory10[d.cluster]);

    // Añadir leyenda
    const legend = svg.selectAll(".legend")
        .data(d3.schemeCategory10.slice(0, k))
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width + 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => d);

    legend.append("text")
        .attr("x", width + 45)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text((d, i) => `Cluster ${i + 1}`);

    // Añadir título y subtítulo
    svg.append("text")
        .attr("x", (width / 2) + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Simulación de Agrupamiento (Clustering)");

    svg.append("text")
        .attr("x", (width / 2) + margin.left)
        .attr("y", (margin.top / 2) + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Agrupamiento de datos basado en ingresos y gastos");

    // Añadir una descripción sobre los clusters
    svg.append("text")
        .attr("x", width + 20)
        .attr("y", 70)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text("Los datos están agrupados en función de:");

    svg.append("text")
        .attr("x", width + 20)
        .attr("y", 90)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text("- Ingresos");

    svg.append("text")
        .attr("x", width + 20)
        .attr("y", 110)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text("- Gasto");

}

function generateData(size) {
    const data = [];
    for (let i = 0; i < size; i++) {
        data.push({
            edad: Math.floor(Math.random() * 60) + 18,
            ingresos: Math.floor(Math.random() * 100),
            gasto: Math.floor(Math.random() * 50)
        });
    }
    return data;
}

// Función k-means (simplificada)
function kmeans(data, k) {
    // Inicializar centroides y clusters
    let centroids = data.slice(0, k);
    let clusters = Array(data.length).fill(0);

    for (let i = 0; i < 10; i++) {  // Número de iteraciones
        // Asignar cada punto al centroide más cercano
        data.forEach((d, idx) => {
            let minDist = Infinity;
            let minIdx = 0;
            centroids.forEach((c, cIdx) => {
                let dist = Math.sqrt(Math.pow(d.ingresos - c.ingresos, 2) + Math.pow(d.gasto - c.gasto, 2));
                if (dist < minDist) {
                    minDist = dist;
                    minIdx = cIdx;
                }
            });
            clusters[idx] = minIdx;
        });

        // Recalcular centroides
        centroids = centroids.map((c, cIdx) => {
            let members = data.filter((d, idx) => clusters[idx] === cIdx);
            return {
                ingresos: d3.mean(members, d => d.ingresos),
                gasto: d3.mean(members, d => d.gasto)
            };
        });
    }

    // Asignar clusters a los datos
    data.forEach((d, idx) => d.cluster = clusters[idx]);

    return clusters;
}
