let cart = [];
let hasCpf = false;
let cpfValue = "";

// Inicializa os ícones na tela
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
});

// --- FLUXO DE ABAS ---
function changeStep(from, to) {
    document.getElementById(`step-${from}`).classList.add('hidden');
    document.getElementById(`step-${to}`).classList.remove('hidden');
    document.getElementById(`step-${to}`).classList.add('container-animation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    lucide.createIcons(); // Recarrega os ícones nas novas abas
}

// --- ABA 1: LÓGICA DO CPF ---
function selectCpfOption(wantCpf) {
    hasCpf = wantCpf;
    const inputContainer = document.getElementById('cpf-input-container');
    const btnSim = document.getElementById('btn-cpf-sim');
    const btnNao = document.getElementById('btn-cpf-nao');

    if (wantCpf) {
        inputContainer.classList.remove('hidden');
        setTimeout(() => inputContainer.classList.add('opacity-100'), 50);
        btnSim.className = "flex-1 py-4 text-xl font-bold rounded-2xl bg-purple-main text-white border-2 border-purple-main transition-all flex items-center justify-center gap-2";
        btnNao.className = "flex-1 py-4 text-xl font-bold rounded-2xl border-2 border-gray-300 text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-2";
        document.getElementById('cpf-field').focus();
    } else {
        inputContainer.classList.add('opacity-0');
        setTimeout(() => inputContainer.classList.add('hidden'), 300);
        btnNao.className = "flex-1 py-4 text-xl font-bold rounded-2xl bg-gray-500 text-white border-2 border-gray-500 transition-all flex items-center justify-center gap-2";
        btnSim.className = "flex-1 py-4 text-xl font-bold rounded-2xl border-2 border-purple-main text-purple-main hover:bg-purple-50 transition-all flex items-center justify-center gap-2";
        document.getElementById('cpf-field').value = "";
    }
}

// Formatador de CPF
document.getElementById('cpf-field').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.substring(0,3) + '.' + value.substring(3);
    if (value.length > 7) value = value.substring(0,7) + '.' + value.substring(7);
    if (value.length > 11) value = value.substring(0,11) + '-' + value.substring(11);
    e.target.value = value;
});

function goToStep2() {
    cpfValue = document.getElementById('cpf-field').value;
    const headerInfo = document.getElementById('header-info');
    const cpfHeader = document.getElementById('cpf-header');

    if (hasCpf && cpfValue.length < 14) {
        alert("Por favor, digite um CPF válido ou escolha 'Não, obrigado'.");
        return;
    }

    cpfHeader.innerText = hasCpf ? `CPF: ${cpfValue}` : "Sem CPF na nota";
    headerInfo.classList.remove('hidden');
    changeStep(1, 2);
}

// --- ABA 2: TECLADO E PRODUTOS ---
function pressKey(num) {
    document.getElementById('product-code').value += num;
}

function clearKey() {
    document.getElementById('product-code').value = "";
}

function addProductFromInput() {
    const input = document.getElementById('product-code');
    const code = parseInt(input.value);
    
    if (!code) {
        alert("Por favor, digite um código antes de apertar OK.");
        return;
    }

    // Busca o produto no backend Python
    fetch(`/api/product/${code}`)
        .then(response => {
            if (!response.ok) throw new Error();
            return response.json();
        })
        .then(data => {
            addToCart(code, data.product);
            input.value = "";
        })
        .catch(() => {
            alert("Produto não encontrado! Digite um código válido de 1 a 5.");
            input.value = "";
        });
}

function addToCart(code, productData) {
    const existingItem = cart.find(item => item.id === code);
    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({
            id: code,
            name: productData.name,
            price: productData.price,
            desc: productData.desc,
            qty: 1
        });
    }
    renderCart();
}

function changeQty(code, amount) {
    const item = cart.find(item => item.id === code);
    if (item) {
        item.qty += amount;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== code);
        renderCart();
    }
}

function renderCart() {
    const itemsContainer = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const btnPagamento = document.getElementById('btn-ir-pagamento');
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = '';
        itemsContainer.appendChild(emptyMsg);
        btnPagamento.disabled = true;
        btnPagamento.className = "w-full bg-gray-300 text-gray-500 text-xl font-bold py-4 rounded-2xl cursor-not-allowed transition-all mt-4 flex items-center justify-center gap-2";
        updateTotals(0);
        return;
    }

    if(emptyMsg) emptyMsg.remove();
    itemsContainer.innerHTML = '';

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += (item.price * item.qty);

        const div = document.createElement('div');
        div.className = "flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 container-animation";
        div.innerHTML = `
            <div class="flex-1">
                <h4 class="font-bold text-gray-800 text-base">${item.name}</h4>
                <p class="text-xs text-gray-400 mb-1">${item.desc}</p>
                <span class="text-sm font-bold text-purple-main">R$ ${item.price.toFixed(2)} un</span>
            </div>
            <div class="flex items-center gap-3">
                <div class="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-sm">
                    <button onclick="changeQty(${item.id}, -1)" class="px-3 py-1 bg-gray-50 hover:bg-gray-100 font-bold text-lg">-</button>
                    <span class="px-3 font-bold text-gray-800">${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)" class="px-3 py-1 bg-gray-50 hover:bg-gray-100 font-bold text-lg">+</button>
                </div>
                <span class="text-lg font-extrabold text-gray-700 min-w-[80px] text-right">R$ ${(item.price * item.qty).toFixed(2)}</span>
            </div>
        `;
        itemsContainer.appendChild(div);
    });

    document.getElementById('cart-count').innerText = `${totalItems} itens`;
    btnPagamento.disabled = false;
    btnPagamento.className = "w-full bg-orange-accent hover-orange text-white text-xl font-bold py-4 rounded-2xl shadow-lg transition-all mt-4 flex items-center justify-center gap-2";
    
    updateTotals(totalPrice);
}

function updateTotals(total) {
    document.getElementById('subtotal-val').innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById('total-val').innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById('pay-total-val').innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById('success-total-view').innerText = `R$ ${total.toFixed(2)}`;
}

function goToStep3() {
    changeStep(2, 3);
    document.getElementById('payment-details-box').classList.add('hidden');
}

// --- ABA 3: PAGAMENTO ---
function selectPaymentMethod(method) {
    const detailBox = document.getElementById('payment-details-box');
    const pixDetails = document.getElementById('pay-details-pix');
    const creditoDetails = document.getElementById('pay-details-credito');
    const debitoDetails = document.getElementById('pay-details-debito');

    pixDetails.classList.add('hidden');
    creditoDetails.classList.add('hidden');
    debitoDetails.classList.add('hidden');
    detailBox.classList.remove('hidden');

    let totalAtual = parseFloat(document.getElementById('total-val').innerText.replace("R$ ", "").replace(",", "."));

    if (method === 'pix') {
        pixDetails.classList.remove('hidden');
        document.getElementById('pix-qrcode').src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PixPetshopValue${totalAtual.toFixed(2)}`;
        
        setTimeout(() => { if(!detailBox.classList.contains('hidden')) executeCheckoutBackend(method); }, 4000);
    } 
    else if (method === 'credito') {
        creditoDetails.classList.remove('hidden');
        generateInstallmentsGrid(totalAtual);
    } 
    else if (method === 'debito') {
        debitoDetails.classList.remove('hidden');
        setTimeout(() => { if(!detailBox.classList.contains('hidden')) executeCheckoutBackend(method); }, 3000);
    }
    lucide.createIcons();
}

function generateInstallmentsGrid(total) {
    const container = document.getElementById('installments-grid');
    container.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        let valorParcela = total / i;
        const button = document.createElement('button');
        button.className = "p-4 border-2 border-purple-200 hover:border-purple-main rounded-xl bg-white text-center transition-all active:bg-purple-100 flex flex-col justify-center items-center shadow-sm";
        button.onclick = () => {
            button.classList.add('bg-purple-50', 'border-purple-main');
            setTimeout(() => executeCheckoutBackend('credito'), 1500);
        };
        button.innerHTML = `
            <span class="font-bold text-gray-800 text-xl">${i}x</span>
            <span class="text-sm font-semibold text-purple-main">R$ ${valorParcela.toFixed(2)}</span>
        `;
        container.appendChild(button);
    }
}

function executeCheckoutBackend(method) {
    let totalAtual = parseFloat(document.getElementById('total-val').innerText.replace("R$ ", "").replace(",", "."));
    
    fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cpf: hasCpf ? cpfValue : "Não informado",
            total: totalAtual,
            payment_method: method
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            document.getElementById('success-cpf-view').innerText = hasCpf ? cpfValue : "Não inserido";
            changeStep(3, 4);
        }
    });
}

function resetSystem() {
    cart = [];
    hasCpf = false;
    cpfValue = "";
    document.getElementById('cpf-field').value = "";
    document.getElementById('header-info').classList.add('hidden');
    document.getElementById('product-code').value = "";
    selectCpfOption(false);
    renderCart();
    changeStep(4, 1);
}