<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown, Lock, CreditCard, Send, ShieldCheck, CheckCircle, Volume2, VolumeX } from 'lucide-vue-next';

// Premium State
const isPremiumUnlocked = ref(false);
const showPaywall = ref(false);
const showPaymentModal = ref(false);
const paymentMethod = ref(null); // 'mpesa' | 'card' | null
const paymentConfirmed = ref(false);

// Audio State
const audioRef = ref(null);
const audioEnabled = ref(false);
const isAudioPlaying = ref(false);

const toggleAudio = () => {
  if (!audioRef.value) return;
  if (isAudioPlaying.value) {
    audioRef.value.pause();
    isAudioPlaying.value = false;
    audioEnabled.value = false;
  } else {
    audioRef.value.play().then(() => {
      isAudioPlaying.value = true;
      audioEnabled.value = true;
    }).catch(e => console.log("Áudio bloqueado pelo navegador", e));
  }
};

const pages = [
  {
    id: 1,
    title: "DO NADA\nTUDO VAI DAR CERTO",
    subtitle: "Às vezes a vida destrói tudo apenas para reconstruir você mais forte.",
    text: "Talvez esta seja a mensagem que você precisava ler hoje.",
    button: "Começar Jornada",
    type: "cover"
  },
  {
    id: 2,
    title: "O Fundo do Poço",
    text: "O problema não é começar do zero.\nO problema é ficar parado.",
    subtext: "Sentir-se perdido, cercado de ansiedade e de fracassos silenciosos. A solidão e a comparação sugam a sua energia.",
    type: "dark"
  },
  {
    id: 3,
    title: "O Silêncio da Dor",
    text: "Algumas pessoas estão cansadas…\nnão fisicamente…\nmas emocionalmente.",
    subtext: "Fingir estar bem custa caro. Carregar o mundo nas costas sem poder mostrar a exaustão.",
    type: "dark"
  },
  {
    id: 4,
    title: "Quando Tudo Parece Acabar",
    text: "O fim de uma fase pode ser o início da sua verdadeira história.",
    subtext: "As falhas, as perdas e o medo constante do futuro assombram as noites mal dormidas.",
    type: "hope-start"
  },
  {
    id: 5,
    title: "A Mudança Começa Dentro",
    text: "Ninguém vem salvar você. Mas você pode se reconstruir.",
    subtext: "A responsabilidade de dar o próximo pequeno passo é apenas sua.",
    type: "hope"
  },
  {
    id: 6,
    title: "A Vida Pode Mudar",
    text: "Você não passou por tudo isso por acaso.",
    subtext: "Cada dor ensinou algo. O crescimento mais profundo acontece no escuro e no silêncio.",
    type: "hope"
  },
  {
    id: 7,
    title: "O Recomeço",
    text: "Recomeçar também é um ato de coragem.",
    subtext: "Mesmo com medo, mesmo sem certezas. O importante é dar o primeiro passo hoje.",
    type: "light"
  },
  {
    id: 8,
    title: "O Futuro",
    text: "O futuro ainda pode ser bonito.",
    subtext: "Visualize novas possibilidades e deixe-se transformado. A dor de hoje é a sua força amanhã.",
    type: "light"
  },
  {
    id: 9,
    title: "A Decisão",
    text: "Depois de tudo… você ainda está aqui.",
    subtext: "Você sobreviveu a 100% dos seus piores dias.",
    button: "Escolher Continuar",
    type: "decision"
  },
  {
    id: 10,
    title: "A Revelação Final",
    text: "Talvez hoje você ainda não veja saída.\nTalvez tudo pareça confuso.\nMas a vida muda.",
    subtext: "As fases mudam.\nAs pessoas evoluem.\nAs feridas cicatrizam.\n\nE um dia…\nvocê vai olhar para trás e perceber:\n\nDo nada…\ntudo começou a dar certo.",
    author: "Afonso Domingos — 2026",
    type: "finale"
  }
];

const currentPageIndex = ref(0);
const currentPage = computed(() => pages[currentPageIndex.value]);

// Progress Bar
const progressPercentage = computed(() => {
  // If we are at paywall and premium not unlocked, don't show 100% yet.
  let max = pages.length - 1;
  return (currentPageIndex.value / max) * 100;
});

// Scrolljacking Logic
let isAnimating = false;
let touchStartY = 0;

const goToNextPage = () => {
  if (isAnimating) return;
  
  if (currentPageIndex.value === 8 && !isPremiumUnlocked.value) {
    showPaywall.value = true;
    return;
  }
  
  if (currentPageIndex.value < pages.length - 1) {
    isAnimating = true;
    currentPageIndex.value++;
    setTimeout(() => { isAnimating = false; }, 1500); // Wait for transition
  }
};

const goToPrevPage = () => {
  if (isAnimating || showPaywall.value) return; // Cannot go back if paywall is shown
  
  if (currentPageIndex.value > 0) {
    isAnimating = true;
    currentPageIndex.value--;
    setTimeout(() => { isAnimating = false; }, 1500);
  }
};

// Handle manual button click
const nextPage = () => {
  // Se estamos na capa e o áudio não foi iniciado e o utilizador clica em começar:
  if (currentPageIndex.value === 0 && !audioEnabled.value && audioRef.value) {
     toggleAudio();
  }
  goToNextPage();
};

const handleWheel = (e) => {
  if (showPaymentModal.value) return; // Prevent scroll inside payment
  if (e.deltaY > 50) {
    goToNextPage();
  } else if (e.deltaY < -50) {
    goToPrevPage();
  }
};

const handleTouchStart = (e) => {
  touchStartY = e.touches[0].clientY;
};

const handleTouchMove = (e) => {
  if (showPaymentModal.value) return;
  const touchEndY = e.touches[0].clientY;
  const diff = touchStartY - touchEndY;
  
  // Need a significant swipe (e.g. 50px) to trigger change
  if (diff > 50) {
    goToNextPage();
    touchStartY = touchEndY; // Reset
  } else if (diff < -50) {
    goToPrevPage();
    touchStartY = touchEndY;
  }
};

// Keydown for accessibility
const handleKeyDown = (e) => {
  if (showPaymentModal.value) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
    goToNextPage();
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    goToPrevPage();
  }
};

onMounted(() => {
  window.addEventListener('wheel', handleWheel, { passive: true });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('wheel', handleWheel);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('keydown', handleKeyDown);
});

// Paywall Actions
const openPayment = () => {
  showPaymentModal.value = true;
};

const selectPayment = (method) => {
  paymentMethod.value = method;
};

const simulatePayment = () => {
  paymentConfirmed.value = true;
  setTimeout(() => {
    isPremiumUnlocked.value = true;
    showPaymentModal.value = false;
    showPaywall.value = false;
    isAnimating = false; // reset
    goToNextPage(); // Go to finale
  }, 2000);
};
</script>

<template>
  <div class="min-h-screen bg-cinematic stars-bg text-brand-white relative overflow-hidden flex flex-col justify-center items-center select-none">
    
    <!-- Audio Player (Hidden) -->
    <!-- Substitua o URL src pelo seu MP3 local no futuro (ex: src="/ambient.mp3") -->
    <audio ref="audioRef" src="https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3" loop preload="auto"></audio>

    <!-- PROGRESS BAR -->
    <div class="fixed top-0 left-0 h-[2px] bg-brand-gold z-50 transition-all duration-[1500ms] ease-out shadow-[0_0_10px_rgba(195,163,67,0.5)]" :style="{ width: progressPercentage + '%' }"></div>
    
    <!-- AUDIO TOGGLE BUTTON (Global) -->
    <button @click="toggleAudio" class="fixed top-6 right-6 z-50 text-brand-white/50 hover:text-brand-gold transition-colors duration-500 backdrop-blur-md p-2 rounded-full bg-brand-white/5">
      <Volume2 v-if="isAudioPlaying" class="w-5 h-5" />
      <VolumeX v-else class="w-5 h-5" />
    </button>

    <!-- Background overlay particles effect (CSS handled) -->
    <div class="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/30 via-transparent to-brand-black transition-colors duration-[2000ms]"></div>

    <!-- Main Content Transition -->
    <Transition name="fade" mode="out-in">
      <div 
        :key="currentPage.id" 
        class="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center justify-center min-h-screen transition-all duration-[1500ms]"
        :class="{ 'blur-intense': showPaywall && !showPaymentModal }"
      >
        <!-- COVER PAGE -->
        <template v-if="currentPage.type === 'cover'">
          <h1 class="text-4xl md:text-6xl font-light tracking-widest leading-relaxed whitespace-pre-line animate-fade-in-up glow-text mb-8">
            {{ currentPage.title }}
          </h1>
          <p class="text-xl md:text-2xl text-brand-gold animate-fade-in-up delay-1000 mb-16 glow-gold italic font-light max-w-2xl">
            "{{ currentPage.subtitle }}"
          </p>
          <p class="text-sm md:text-base text-gray-400 tracking-wider uppercase animate-fade-in-up delay-2000 mb-12">
            {{ currentPage.text }}
          </p>
          
          <div class="flex flex-col items-center gap-6 animate-fade-in-up delay-3000 mt-8">
            <button 
              @click="nextPage" 
              class="px-8 py-4 border border-brand-white/30 rounded-full hover:bg-brand-white/10 hover:border-brand-white hover:scale-105 transition-all duration-700 uppercase tracking-widest text-sm flex items-center gap-3 backdrop-blur-sm"
            >
              {{ currentPage.button }}
            </button>
            <p class="text-[10px] uppercase tracking-widest text-brand-white/30 flex items-center gap-2">
              <Volume2 class="w-3 h-3" />
              Recomendado usar fones de ouvido
            </p>
          </div>
        </template>

        <!-- STANDARD CONTENT PAGES -->
        <template v-else-if="currentPage.type !== 'finale' && currentPage.type !== 'decision'">
          <h2 class="text-sm tracking-[0.3em] text-brand-gold/80 uppercase animate-fade-in-up mb-12">
            Capítulo {{ currentPage.id - 1 }}
          </h2>
          <h1 class="text-3xl md:text-5xl font-light tracking-wide leading-relaxed whitespace-pre-line animate-fade-in-up delay-1000 glow-text mb-12 max-w-3xl">
            {{ currentPage.text }}
          </h1>
          <p class="text-lg text-gray-400 font-light max-w-2xl leading-loose animate-fade-in-up delay-2000">
            {{ currentPage.subtext }}
          </p>
          
          <div class="mt-20 opacity-0 animate-fade-in-up delay-4000 text-gray-600 flex flex-col items-center gap-2">
            <span class="text-[10px] uppercase tracking-[0.3em]">Deslize para continuar</span>
            <ChevronDown class="w-4 h-4 animate-bounce mt-1" />
          </div>
        </template>

        <!-- DECISION PAGE (PAGE 9) -->
        <template v-else-if="currentPage.type === 'decision'">
          <h1 class="text-4xl md:text-6xl font-light tracking-wide leading-relaxed animate-fade-in-up glow-text mb-8">
            {{ currentPage.text }}
          </h1>
          <p class="text-xl text-gray-400 font-light max-w-2xl leading-loose animate-fade-in-up delay-1000 mb-16">
            {{ currentPage.subtext }}
          </p>
          
          <button 
            @click="nextPage" 
            class="animate-fade-in-up delay-2000 px-10 py-5 bg-brand-white text-brand-black rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(245,245,245,0.4)] transition-all duration-700 uppercase tracking-widest text-sm font-bold"
          >
            {{ currentPage.button }}
          </button>
        </template>

        <!-- FINALE PAGE (UNLOCKED) -->
        <template v-else-if="currentPage.type === 'finale'">
          <div class="relative max-w-3xl w-full flex flex-col items-center justify-center">
            <div class="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent top-0 animate-fade-in-up"></div>
            
            <h1 class="text-2xl md:text-4xl font-light tracking-wide leading-relaxed whitespace-pre-line animate-fade-in-up delay-1000 glow-text my-16 text-center">
              {{ currentPage.text }}
            </h1>
            
            <p class="text-lg md:text-xl text-brand-gold/90 font-light leading-loose whitespace-pre-line animate-fade-in-up delay-2000 mb-20 text-center italic">
              {{ currentPage.subtext }}
            </p>
            
            <div class="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent bottom-16 animate-fade-in-up delay-3000"></div>
            
            <p class="text-sm tracking-[0.2em] text-gray-500 uppercase animate-fade-in-up delay-4000">
              {{ currentPage.author }}
            </p>
          </div>
        </template>
      </div>
    </Transition>

    <!-- PAYWALL OVERLAY -->
    <Transition name="fade">
      <div v-if="showPaywall && !showPaymentModal" class="absolute inset-0 z-40 flex items-center justify-center px-4 bg-brand-black/60 backdrop-blur-sm">
        <div class="max-w-xl text-center flex flex-col items-center">
          <Lock class="w-8 h-8 text-brand-gold mb-6 animate-pulse" />
          <h2 class="text-3xl md:text-4xl font-light mb-6 glow-text drop-shadow-2xl">
            Toda transformação começa quando você decide continuar.
          </h2>
          <p class="text-gray-300 text-lg font-light mb-12 drop-shadow-lg">
            As próximas páginas guardam a parte mais profunda desta jornada.
          </p>
          
          <button 
            @click="openPayment"
            class="px-8 py-4 bg-transparent border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black transition-all duration-500 rounded-full uppercase tracking-widest text-sm flex items-center gap-3 backdrop-blur-md shadow-[0_0_30px_rgba(195,163,67,0.2)]"
          >
            <Lock class="w-4 h-4" />
            Desbloquear experiência completa — 3 USD
          </button>
          
          <p class="mt-8 text-sm text-gray-400 max-w-sm italic drop-shadow-md">
            "Menos que um simples gasto… mas talvez uma decisão que muda a forma como você vê a sua vida."
          </p>
        </div>
      </div>
    </Transition>

    <!-- PAYMENT MODAL -->
    <Transition name="fade">
      <div v-if="showPaymentModal" class="absolute inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/90 backdrop-blur-xl">
        <div class="bg-[#0a0f18] border border-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
          
          <!-- Payment Success State -->
          <div v-if="paymentConfirmed" class="flex flex-col items-center justify-center py-12">
            <CheckCircle class="w-16 h-16 text-green-500 mb-6 animate-bounce" />
            <h3 class="text-2xl font-light text-white mb-2">Acesso Liberado</h3>
            <p class="text-gray-400 text-center">A sua jornada continua agora.</p>
          </div>

          <!-- Payment Options State -->
          <div v-else>
            <button @click="showPaymentModal = false; showPaywall = true" class="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              &times; FECHAR
            </button>
            
            <h3 class="text-2xl font-light text-white mb-2">Concluir Acesso</h3>
            <p class="text-gray-400 mb-8 text-sm">Escolha como deseja desbloquear o final desta experiência.</p>
            
            <!-- Methods -->
            <div class="grid grid-cols-2 gap-4 mb-8">
              <button 
                @click="selectPayment('mpesa')"
                class="p-4 border rounded-xl flex flex-col items-center gap-3 transition-all duration-300"
                :class="paymentMethod === 'mpesa' ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' : 'border-gray-800 text-gray-400 hover:border-gray-600'"
              >
                <Send class="w-6 h-6" />
                <span class="text-sm font-medium">M-Pesa</span>
              </button>
              
              <button 
                @click="selectPayment('card')"
                class="p-4 border rounded-xl flex flex-col items-center gap-3 transition-all duration-300"
                :class="paymentMethod === 'card' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-800 text-gray-400 hover:border-gray-600'"
              >
                <CreditCard class="w-6 h-6" />
                <span class="text-sm font-medium">Cartão / PayPal</span>
              </button>
            </div>

            <!-- M-Pesa Info -->
            <div v-if="paymentMethod === 'mpesa'" class="bg-brand-black/50 p-4 rounded-lg border border-gray-800 mb-6 text-sm text-gray-400 text-center animate-fade-in-up">
              <p class="mb-2">Envie <strong>190 MT</strong> para o número:</p>
              <p class="text-xl text-brand-gold mb-2 font-mono">84 000 0000</p>
              <p class="text-xs">Após o envio, clique abaixo para confirmar.</p>
            </div>

            <!-- Card Info -->
            <div v-if="paymentMethod === 'card'" class="bg-brand-black/50 p-4 rounded-lg border border-gray-800 mb-6 text-sm text-gray-400 text-center animate-fade-in-up">
              <ShieldCheck class="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p>Pagamento seguro via PayPal.</p>
              <p class="text-xs mt-2">Irá ser redirecionado para concluir o pagamento de $3 USD.</p>
            </div>

            <!-- Action Button -->
            <button 
              @click="simulatePayment"
              :disabled="!paymentMethod"
              class="w-full py-4 rounded-full font-medium tracking-wide uppercase text-sm transition-all duration-500"
              :class="paymentMethod 
                ? 'bg-brand-white text-brand-black hover:scale-[1.02]' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'"
            >
              {{ paymentMethod === 'mpesa' ? 'Confirmar M-Pesa' : paymentMethod === 'card' ? 'Pagar com PayPal' : 'Selecione um método' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>
