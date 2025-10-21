// Aguarda o DOM carregar
document.addEventListener("DOMContentLoaded", () => {
    
    // --- LÓGICA DE AUTENTICAÇÃO E ROTEAMENTO ---

    const paginaAtual = window.location.pathname.split('/').pop();
    const usuarioLogado = localStorage.getItem('momentumUser');

    // Se não estiver logado E não estiver na página de login, redireciona para o login
    if (!usuarioLogado && paginaAtual !== 'index.html' && paginaAtual !== '') {
        window.location.href = 'index.html';
        return; // Para o script
    }
    
    // Se estiver logado E estiver na página de login, redireciona para o dashboard
    if (usuarioLogado && (paginaAtual === 'index.html' || paginaAtual === '')) {
        window.location.href = 'dashboard.html';
        return; // Para o script
    }

    // --- LÓGICA GERAL (presente em todas as páginas logadas) ---
    
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', fazerLogout);
    }
    
    function fazerLogout() {
        localStorage.removeItem('momentumUser');
        localStorage.removeItem('momentumRemedies'); // Limpa tudo
        window.location.href = 'index.html';
    }

    // --- LÓGICA DA TELA DE LOGIN (index.html) ---
    if (paginaAtual === 'index.html' || paginaAtual === '') {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            localStorage.setItem('momentumUser', username);
            window.location.href = 'dashboard.html';
        });
    }

    // --- LÓGICA DA TELA DE CADASTRO (cadastro.html) ---
    if (paginaAtual === 'cadastro.html') {
        const formCadastro = document.getElementById('form-cadastro-remedio');
        const listaCadastrados = document.getElementById('lista-remedios-cadastrados');
        
        carregarRemediosCadastrados();

        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarRemedio();
            formCadastro.reset(); // Limpa o formulário
        });

        function getRemedios() {
            return JSON.parse(localStorage.getItem('momentumRemedies')) || [];
        }

        function salvarRemedio() {
            const remedios = getRemedios();
            
            const novoRemedio = {
                id: Date.now(), // ID único baseado no tempo
                nome: document.getElementById('remedio-nome').value,
                dosagem: document.getElementById('remedio-dosagem').value,
                horario: document.getElementById('remedio-horario').value,
                concluido: false // Novo estado
            };

            remedios.push(novoRemedio);
            // Ordena os remédios por horário
            remedios.sort((a, b) => a.horario.localeCompare(b.horario));
            
            localStorage.setItem('momentumRemedies', JSON.stringify(remedios));
            carregarRemediosCadastrados();
        }

        function carregarRemediosCadastrados() {
            const remedios = getRemedios();
            listaCadastrados.innerHTML = ''; // Limpa a lista antes de recarregar
            
            if (remedios.length === 0) {
                listaCadastrados.innerHTML = '<p>Nenhum remédio cadastrado ainda.</p>';
                return;
            }

            remedios.forEach((remedio) => {
                const item = document.createElement('li');
                item.className = 'remedio-item';
                item.innerHTML = `
                    <div class="remedio-info">
                        <span class="remedio-horario">${remedio.horario}</span>
                        <div>
                            <strong>${remedio.nome}</strong>
                            <br>
                            <span>${remedio.dosagem}</span>
                        </div>
                    </div>
                    <button class="btn-remover" data-id="${remedio.id}">Remover</button>
                `;
                listaCadastrados.appendChild(item);
            });

            // Adiciona listener para todos os botões de remover
            document.querySelectorAll('.btn-remover').forEach(button => {
                button.addEventListener('click', (e) => {
                    const idParaRemover = Number(e.target.getAttribute('data-id'));
                    removerRemedio(idParaRemover);
                });
            });
        }

        function removerRemedio(id) {
            let remedios = getRemedios();
            remedios = remedios.filter(r => r.id !== id);
            localStorage.setItem('momentumRemedies', JSON.stringify(remedios));
            carregarRemediosCadastrados();
        }
    }

    // --- LÓGICA DO DASHBOARD (dashboard.html) ---
    if (paginaAtual === 'dashboard.html') {
        const welcomeMessage = document.getElementById('welcome-message');
        const cardProximo = document.getElementById('card-proximo-remedio');
        const listaHoje = document.getElementById('lista-remedios-hoje');
        
        // Personaliza a saudação
        welcomeMessage.textContent = `Olá, ${usuarioLogado}!`;

        carregarDashboard();

        function getRemedios() {
            return JSON.parse(localStorage.getItem('momentumRemedies')) || [];
        }
        
        function carregarDashboard() {
            const remedios = getRemedios();
            const agora = new Date();
            const horaAtual = agora.toTimeString().substring(0, 5); // Formato "HH:MM"

            // Reseta o estado 'concluido' de todos os remédios todo dia (meia-noite)
            // (Esta é uma lógica simplificada)
            
            // Filtra remédios pendentes de hoje
            const pendentes = remedios
                .filter(r => !r.concluido && r.horario >= horaAtual)
                .sort((a, b) => a.horario.localeCompare(b.horario));
            
            const concluidos = remedios
                .filter(r => r.concluido || r.horario < horaAtual);

            // 1. Preenche o Card de Próximo Remédio
            if (pendentes.length > 0) {
                const proximo = pendentes[0];
                cardProximo.innerHTML = `
                    <h3>Próximo Remédio</h3>
                    <p class="remedio-nome">${proximo.nome} (${proximo.dosagem})</p>
                    <p class="remedio-horario">Hoje às ${proximo.horario}</p>
                    <button class="btn btn-principal btn-tomar" data-id="${proximo.id}">Registrar que Tomei</button>
                `;
                
                // Adiciona listener ao botão
                cardProximo.querySelector('.btn-tomar').addEventListener('click', (e) => {
                    const idParaConcluir = Number(e.target.getAttribute('data-id'));
                    marcarComoTornado(idParaConcluir);
                });

            } else {
                cardProximo.innerHTML = `
                    <h3>Parabéns, ${usuarioLogado}!</h3>
                    <p class="remedio-nome">Você concluiu todos os seus remédios por hoje.</p>
                    <p class="remedio-horario">🎉</p>
                `;
            }

            // 2. Preenche a Lista de Lembretes do Dia
            listaHoje.innerHTML = '';
            
            if (remedios.length === 0) {
                 listaHoje.innerHTML = '<li>Nenhum remédio cadastrado. Adicione em "Meus Remédios".</li>';
                 return;
            }

            // Adiciona os concluídos
            concluidos.forEach(r => {
                listaHoje.innerHTML += `
                    <li class="remedio-item concluido">
                        <span>${r.horario} - ${r.nome}</span>
                        <span>✔️ Concluído</span>
                    </li>
                `;
            });

            // Adiciona os pendentes (exceto o primeiro, que já está no card)
            pendentes.slice(1).forEach(r => {
                listaHoje.innerHTML += `
                    <li class="remedio-item pendente">
                        <span>${r.horario} - ${r.nome}</span>
                        <span>⏳ Pendente</span>
                    </li>
                `;
            });
        }
        
        function marcarComoTornado(id) {
            let remedios = getRemedios();
            const remedio = remedios.find(r => r.id === id);
            
            if (remedio) {
                // Em um app real, marcaríamos como "concluído" para o dia atual.
                // Para simplificar, vamos movê-lo para o fim da lista (ou marcar como concluído)
                remedio.concluido = true; 
                // A lógica para "resetar" isso no dia seguinte é mais complexa.
                // Por enquanto, isso funciona para o dia.
                
                // NOTA: Para uma simulação simples, vamos "remover" o remédio
                // dos pendentes. A forma mais simples é só recarregar o dashboard.
                
                // A forma correta:
                remedios = remedios.map(r => (r.id === id) ? { ...r, concluido: true } : r);
                localStorage.setItem('momentumRemedies', JSON.stringify(remedios));
                
                // Recarrega o dashboard
                carregarDashboard();
            }
        }

        // Lógica do SOS (copiada de antes)
        const sosButton = document.getElementById("sos-button");
        const overlay = document.getElementById("overlay");
        const modalSOS = document.getElementById("modal-sos");
        const contadorSOS = document.getElementById("contador-sos");
        const btnConfirmarSOS = document.getElementById("btn-confirmar-sos");
        const btnCancelarSOS = document.getElementById("btn-cancelar-sos");
        let countdownInterval;

        function abrirModal(modal) {
            overlay.classList.remove("hidden");
            modal.classList.remove("hidden");
        }

        function fecharModais() {
            overlay.classList.add("hidden");
            modalSOS.classList.add("hidden");
            clearInterval(countdownInterval);
        }

        function iniciarContadorSOS() {
            let tempoRestante = 5;
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
            alert("Simulação: Ligando para 192 (Ambulância)...");
            console.log("Ligação de emergência acionada para 192.");
            fecharModais();
            // window.location.href = "tel:192"; // Código real
        }

        sosButton.addEventListener("click", () => {
            abrirModal(modalSOS);
            iniciarContadorSOS();
        });
        btnCancelarSOS.addEventListener("click", fecharModais);
        btnConfirmarSOS.addEventListener("click", () => {
            clearInterval(countdownInterval);
            realizarLigacaoSOS();
        });
        overlay.addEventListener("click", fecharModais);
    }

});
