// Espera o DOM carregar antes de executar o script
document.addEventListener("DOMContentLoaded", () => {

    // --- Seleção de Elementos do DOM ---
    const sosButton = document.getElementById("sos-button");
    const overlay = document.getElementById("overlay");
    
    // Modal SOS
    const modalSOS = document.getElementById("modal-sos");
    const contadorSOS = document.getElementById("contador-sos");
    const btnConfirmarSOS = document.getElementById("btn-confirmar-sos");
    const btnCancelarSOS = document.getElementById("btn-cancelar-sos");
    
    // Modal Atraso
    const modalAtraso = document.getElementById("modal-atraso");
    const btnSimularAtraso = document.getElementById("btn-simular-atraso");
    const btnTomeiAgora = document.getElementById("btn-tomei-agora");
    const btnFecharModalAtraso = document.getElementById("btn-fechar-modal-atraso");
    
    // Funcionalidade Principal
    const btnTomarRemedio = document.getElementById("btn-tomar-remedio");
    const cardProximoRemedio = document.getElementById("card-proximo-remedio");
    const itemRemedio14h = document.getElementById("item-remedio-14h");

    // Variáveis de estado
    let countdownInterval; // Armazena o intervalo do contador SOS
    let tempoRestante;

    // --- Funções dos Modais ---
    
    function abrirModal(modal) {
        overlay.classList.remove("hidden");
        modal.classList.remove("hidden");
    }

    function fecharModais() {
        overlay.classList.add("hidden");
        modalSOS.classList.add("hidden");
        modalAtraso.classList.add("hidden");
        // Para o contador SOS se ele estiver ativo
        clearInterval(countdownInterval);
    }

    // --- Lógica do SOS ---

    function iniciarContadorSOS() {
        tempoRestante = 5;
        contadorSOS.textContent = tempoRestante;

        countdownInterval = setInterval(() => {
            tempoRestante--;
            contadorSOS.textContent = tempoRestante;
            
            if (tempoRestante <= 0) {
                clearInterval(countdownInterval);
                realizarLigacaoSOS();
            }
        }, 1000);
    }

    function realizarLigacaoSOS() {
        // Esta é a ação real de ligar.
        // Em um celular, isso abriria o discador.
        // window.location.href = "tel:192";
        
        // Para fins de demonstração no navegador, usamos um alerta:
        alert("Simulação: Ligando para 192 (Ambulância)...");
        console.log("Ligação de emergência acionada para 192.");
        fecharModais();
    }

    // --- Lógica dos Remédios ---

    function confirmarRemedio() {
        // Marca o item da lista como concluído
        itemRemedio14h.classList.remove("pendente");
        itemRemedio14h.classList.add("concluido");
        itemRemedio14h.innerHTML = `
            <span>14:00 - Losartana (50mg)</span>
            <span>✔️ Concluído</span>
        `;
        
        // Atualiza o card principal
        cardProximoRemedio.innerHTML = `
            <h3>Próximo Remédio</h3>
            <p class="remedio-nome">Dipirona (30 gotas)</p>
            <p class="remedio-horario">Hoje às 20:00</p>
            <button id="btn-tomar-remedio-2" class="btn btn-principal">Registrar que Tomei</button>
        `;
        
        // (Em um app real, o novo botão também precisaria de um listener)
    }

    // --- Event Listeners (Onde a mágica acontece) ---

    // SOS
    sosButton.addEventListener("click", () => {
        abrirModal(modalSOS);
        iniciarContadorSOS();
    });

    btnCancelarSOS.addEventListener("click", fecharModais);
    btnConfirmarSOS.addEventListener("click", () => {
        clearInterval(countdownInterval); // Para a contagem e liga imediatamente
        realizarLigacaoSOS();
    });

    // Notificação de Atraso (Simulação)
    btnSimularAtraso.addEventListener("click", () => {
        abrirModal(modalAtraso);
    });

    btnTomeiAgora.addEventListener("click", () => {
        alert("Remédio registrado. Ótimo trabalho!");
        fecharModais();
        // Aqui você adicionaria a lógica para marcar o remédio das 20h como tomado.
    });
    
    btnFecharModalAtraso.addEventListener("click", fecharModais);

    // Overlay (clicar fora do modal fecha)
    overlay.addEventListener("click", fecharModais);

    // Lógica Principal
    btnTomarRemedio.addEventListener("click", () => {
        confirmarRemedio();
    });
});
