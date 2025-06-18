// Datos base para cálculos TotalPass
const datosBase = {
    "4.5": {
        feePorVida: 110,
        planes: [
            { nombre: "TP ON", copago: 99 },
            { nombre: "TP GO", copago: 199 },
            { nombre: "TP1", copago: 279 },
            { nombre: "TP1+", copago: 300 },
            { nombre: "TP2", copago: 579 },
            { nombre: "TP3", copago: 999 },
            { nombre: "TP3+", copago: 1099 },
            { nombre: "TP4", copago: 1549 },
            { nombre: "TP5", copago: 2049 },
            { nombre: "TP6", copago: 2449 }
        ]
    },
    "4.75": {
        feePorVida: 105,
        planes: [
            { nombre: "TP ON", copago: 94 },
            { nombre: "TP GO", copago: 189 },
            { nombre: "TP1", copago: 265 },
            { nombre: "TP1+", copago: 285 },
            { nombre: "TP2", copago: 550 },
            { nombre: "TP3", copago: 949 },
            { nombre: "TP3+", copago: 1044 },
            { nombre: "TP4", copago: 1499 },
            { nombre: "TP5", copago: 1999 },
            { nombre: "TP6", copago: 2399 }
        ]
    }
};

// Actualizar subsidios automáticamente según estrategia
document.getElementById('estrategiaSubsidio').addEventListener('change', function() {
    const estrategia = this.value;
    
    if (estrategia === 'proporcional') {
        document.getElementById('subsidioTP1').value = 100;
        document.getElementById('subsidioTP2').value = 200;
        document.getElementById('subsidioTP3').value = 300;
        document.getElementById('subsidioTP4').value = 800;
        document.getElementById('subsidioTP5').value = 1000;
        document.getElementById('subsidioTP6').value = 1200;
    } else if (estrategia === 'uniforme') {
        document.getElementById('subsidioTP1').value = 500;
        document.getElementById('subsidioTP2').value = 500;
        document.getElementById('subsidioTP3').value = 500;
        document.getElementById('subsidioTP4').value = 500;
        document.getElementById('subsidioTP5').value = 500;
        document.getElementById('subsidioTP6').value = 500;
    }
});

function calcularMegaEstrategia() {
    const presupuestoTotal = parseFloat(document.getElementById('presupuestoTotal').value);
    const empleados = parseInt(document.getElementById('empleadosTotal').value);
    const porcentajePremium = parseFloat(document.getElementById('porcentajePremium').value);
    const propuesta = document.getElementById('propuesta').value;
    const cliente = document.getElementById('cliente').value || 'Cliente Sin Nombre';
    
    // Obtener subsidios por plan
    const subsidios = {
        TP1: parseFloat(document.getElementById('subsidioTP1').value),
        TP2: parseFloat(document.getElementById('subsidioTP2').value),
        TP3: parseFloat(document.getElementById('subsidioTP3').value),
        TP4: parseFloat(document.getElementById('subsidioTP4').value),
        TP5: parseFloat(document.getElementById('subsidioTP5').value),
        TP6: parseFloat(document.getElementById('subsidioTP6').value)
    };
    
    const datos = datosBase[propuesta];
    
    // Calcular empleados premium y subsidios totales
    const empleadosPremium = Math.round(empleados * (porcentajePremium / 100));
    const subsidioPromedio = (subsidios.TP4 + subsidios.TP5 + subsidios.TP6) / 3;
    const totalSubsidiosPremium = empleadosPremium * subsidioPromedio;
    
    // El resto va al fee
    const feeTotal = presupuestoTotal - totalSubsidiosPremium;
    const feePorVidaMejorado = feeTotal / empleados;
    
    // Validar fee mínimo
    if (feePorVidaMejorado < datos.feePorVida) {
        alert(`⚠️ Subsidios muy altos. El fee quedaría en $${feePorVidaMejorado.toFixed(0)}, menor al mínimo de $${datos.feePorVida}`);
        return;
    }
    
    // Crear planes con subsidios
    let planesFinales = datos.planes.map(plan => {
        let subsidio = 0;
        let copagofinal = plan.copago;
        
        // Aplicar subsidios según el plan
        if (plan.nombre === 'TP1') subsidio = subsidios.TP1;
        else if (plan.nombre === 'TP2') subsidio = subsidios.TP2;
        else if (plan.nombre === 'TP3') subsidio = subsidios.TP3;
        else if (plan.nombre === 'TP4') subsidio = subsidios.TP4;
        else if (plan.nombre === 'TP5') subsidio = subsidios.TP5;
        else if (plan.nombre === 'TP6') subsidio = subsidios.TP6;
        
        if (subsidio > 0) {
            subsidio = Math.min(plan.copago, subsidio);
            copagofinal = Math.max(0, plan.copago - subsidio);
        }

        // Calcular total mensual por empleado
        const totalMensual = feePorVidaMejorado + copagofinal;
        
        return {
            ...plan,
            subsidio: subsidio,
            copagofinal: copagofinal,
            feePorVida: feePorVidaMejorado,
            totalMensual: totalMensual
        };
    });
    
    // Calcular márgenes
    const margenPorVida = feePorVidaMejorado - datos.feePorVida;
    const margenTotal = margenPorVida * empleados;
    const margenPorcentaje = ((margenPorVida / feePorVidaMejorado) * 100).toFixed(1);
    
    // Mostrar resultados
    let resultadoHTML = `
        <div class="result-grid">
            <div class="result-item">
                <span class="result-label">Cliente:</span>
                <span class="result-value">${cliente}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Empleados:</span>
                <span class="result-value">${empleados.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Empleados Premium (${porcentajePremium}%):</span>
                <span class="result-value">${empleadosPremium.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Presupuesto Total:</span>
                <span class="result-value">$${presupuestoTotal.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">🔥 Fee OPTIMIZADO por Vida:</span>
                <span class="result-value total">$${feePorVidaMejorado.toFixed(0)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Incremento vs Base:</span>
                <span class="result-value total">+$${(feePorVidaMejorado - datos.feePorVida).toFixed(0)} (+${((feePorVidaMejorado - datos.feePorVida) / datos.feePorVida * 100).toFixed(0)}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Subsidios Totales:</span>
                <span class="result-value">$${totalSubsidiosPremium.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">💰 MARGEN BRUTAL:</span>
                <span class="result-value total">$${margenTotal.toLocaleString()} (${margenPorcentaje}%)</span>
            </div>
        </div>
        
        <h4 style="margin-top: 30px; color: var(--color-secondary-green-extradark); font-weight: var(--font-weight-bold); text-align: center; font-size: var(--text-xl);">
            🎯 Planes con Subsidios Inteligentes
        </h4>
        <div class="plans-grid">
    `;
    
    planesFinales.forEach(plan => {
        const esSubsidiado = plan.subsidio > 0;
        const esPremiun = ['TP4', 'TP5', 'TP6'].includes(plan.nombre);
        const claseExtra = esPremiun && esSubsidiado ? 'premium-highlight' : (esSubsidiado ? 'subsidized' : '');
        
        resultadoHTML += `
            <div class="plan-card ${claseExtra}">
                <div class="plan-card-name">${plan.nombre} ${esPremiun && esSubsidiado ? '🔥' : ''}</div>
                <div class="plan-card-copay">
                    ${esSubsidiado ? 
                        `<strike style="color: var(--color-gray-500); font-size: var(--text-sm);">$${plan.copago.toLocaleString()}</strike><br><strong style="color: var(--color-primary-green); font-size: 1.4em;">$${plan.copagofinal.toLocaleString()}</strong>` 
                        : `$${plan.copago.toLocaleString()}`
                    }
                </div>
                <div class="plan-details">
                    <div class="plan-detail-row">
                        <span class="plan-detail-label">Fee por Vida:</span>
                        <span>$${plan.feePorVida.toFixed(0)}</span>
                    </div>
                    <div class="plan-detail-row">
                        <span class="plan-detail-label">Copay Estimado:</span>
                        <span>$${plan.copagofinal.toLocaleString()}</span>
                    </div>
                    <div class="plan-detail-row">
                        <span class="plan-detail-label">Subsidio:</span>
                        <span>$${plan.subsidio.toLocaleString()}</span>
                    </div>
                    <div class="plan-detail-row">
                        <span class="plan-detail-label">Total Mensual:</span>
                        <span><strong>$${plan.totalMensual.toFixed(0)}</strong></span>
                    </div>
                </div>
                ${esSubsidiado ? `<div style="font-size: var(--text-xs); color: var(--color-primary-green); margin-top: 8px; font-weight: 700;">AHORRO: $${plan.subsidio.toLocaleString()}</div>` : ''}
            </div>
        `;
    });
    
    resultadoHTML += `</div>
        <div class="strategy-summary">
            <strong style="color: var(--color-secondary-green-extradark); font-size: var(--text-lg);">🚀 ESTRATEGIA MEGA OPTIMIZADA:</strong><br>
            <div style="margin-top: 10px; font-size: var(--text-sm); color: var(--color-secondary-green-dark);">
                • <strong>Fee aumentado</strong> de $${datos.feePorVida} a $${feePorVidaMejorado.toFixed(0)} por vida (+${((feePorVidaMejorado - datos.feePorVida) / datos.feePorVida * 100).toFixed(0)}%)<br>
                • <strong>Solo ${empleadosPremium} empleados</strong> (${porcentajePremium}%) tendrán acceso a planes premium<br>
                • <strong>TP4, TP5, TP6</strong> con subsidios altos para máximo atractivo<br>
                • <strong>Rentabilidad brutal:</strong> $${margenPorVida.toFixed(0)} por empleado = ${margenPorcentaje}% de margen<br>
                • <strong>Win-Win:</strong> Cliente feliz + máxima ganancia
            </div>
        </div>`;
    
    document.getElementById('contenidoResultados').innerHTML = resultadoHTML;
    document.getElementById('resultados').style.display = 'block';
}

// Animación de entrada
window.addEventListener('load', function() {
    const section = document.querySelector('.calculator-section');
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.8s ease';
    setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
    }, 200);
});