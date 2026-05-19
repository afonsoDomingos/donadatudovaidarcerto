<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown, Lock, CreditCard, Send, ShieldCheck, CheckCircle, Volume2, VolumeX, AlertTriangle, Eye } from 'lucide-vue-next';

// Premium State
const isPremiumUnlocked = ref(false);
const showPaywall = ref(false);
const showPaymentModal = ref(false);
const paymentMethod = ref(null);
const paymentConfirmed = ref(false);

// Give up psychological state
const showGiveUpWarning = ref(false);

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
  // PARTE 1 - GRATUITA (0 a 8)
  {
    id: 1,
    title: "DO NADA\nTUDO VAI DAR CERTO",
    subtitle: "Às vezes a vida destrói tudo apenas para reconstruir você mais forte.",
    text: "Talvez esta seja a mensagem que você precisava ler hoje.",
    button: "Começar Jornada",
    baseViews: 18452,
    type: "cover"
  },
  {
    id: 2,
    title: "O Fundo do Poço",
    text: "O problema não é começar do zero.\nO problema é ficar parado.",
    subtext: "Sentir-se perdido, cercado de ansiedade e de fracassos silenciosos. A solidão e a comparação sugam a sua energia.",
    baseViews: 17120,
    type: "dark"
  },
  {
    id: 3,
    title: "O Silêncio da Dor",
    text: "Algumas pessoas estão cansadas…\nnão fisicamente…\nmas emocionalmente.",
    subtext: "Fingir estar bem custa caro. Carregar o mundo nas costas sem poder mostrar a exaustão.",
    baseViews: 15890,
    type: "dark"
  },
  {
    id: 4,
    title: "Quando Tudo Parece Acabar",
    text: "O fim de uma fase pode ser o início da sua verdadeira história.",
    subtext: "As falhas, as perdas e o medo constante do futuro assombram as noites mal dormidas.",
    baseViews: 14200,
    type: "hope-start"
  },
  {
    id: 5,
    title: "A Mudança Começa Dentro",
    text: "Ninguém vem salvar você. Mas você pode se reconstruir.",
    subtext: "A responsabilidade de dar o próximo pequeno passo é apenas sua.",
    baseViews: 13540,
    type: "hope"
  },
  {
    id: 6,
    title: "A Vida Pode Mudar",
    text: "Você não passou por tudo isso por acaso.",
    subtext: "Cada dor ensinou algo. O crescimento mais profundo acontece no escuro e no silêncio.",
    baseViews: 12900,
    type: "hope"
  },
  {
    id: 7,
    title: "O Recomeço",
    text: "Recomeçar também é um ato de coragem.",
    subtext: "Mesmo com medo, mesmo sem certezas. O importante é dar o primeiro passo hoje.",
    baseViews: 11450,
    type: "light"
  },
  {
    id: 8,
    title: "O Futuro",
    text: "O futuro ainda pode ser bonito.",
    subtext: "Visualize novas possibilidades e deixe-se transformado. A dor de hoje é a sua força amanhã.",
    baseViews: 10890,
    type: "light"
  },
  {
    id: 9,
    title: "A Decisão",
    text: "Depois de tudo… você ainda está aqui.",
    subtext: "Você sobreviveu a 100% dos seus piores dias.",
    button: "Escolher Continuar",
    baseViews: 10420,
    type: "decision"
  },

  // PARTE 2 - PREMIUM (9 a 19)
  {
    id: 10,
    title: "A Revelação",
    text: "Talvez hoje você ainda não veja saída.\nTalvez tudo pareça confuso.",
    subtext: "Mas a vida muda. As portas que pareciam trancadas de repente abrem-se.",
    baseViews: 5200,
    type: "premium-dark"
  },
  {
    id: 11,
    title: "O Reflexo",
    text: "Olhe para si. Não com julgamento, mas com compaixão.",
    subtext: "Você tem sido forte por tempo demais. Permita-se sentir orgulho de não ter desistido quando era o caminho mais fácil.",
    baseViews: 5150,
    type: "premium-hope"
  },
  {
    id: 12,
    title: "A Verdade Partilhada",
    text: "Você não está perdido.\nE definitivamente, não está sozinho.",
    subtext: "Neste exato momento, há milhares a chorar em silêncio. A sua dor é real, mas não é exclusiva. Você pertence a um exército invisível de sobreviventes.",
    baseViews: 5080,
    type: "premium-dark"
  },
  {
    id: 13,
    title: "E Se Nada Mudar?",
    text: "E se o esforço for em vão?\nE se depois de lutar, acabar no mesmo lugar?",
    subtext: "A água não esculpe a pedra pela força, mas pela constância. Mesmo que não veja os resultados hoje, as raízes estão a aprofundar-se.",
    baseViews: 4900,
    type: "premium-hope"
  },
  {
    id: 14,
    title: "O Momento de Fé",
    text: "Feche os olhos por um segundo.\nEntregue o peso que você não consegue carregar.",
    subtext: "Seja a Deus, ao Universo ou ao Tempo. Apenas solte. Você não precisa de ter o controlo sobre tudo.",
    baseViews: 4850,
    type: "premium-light"
  },
  {
    id: 15,
    title: "A Luz Invisível",
    text: "As raízes da árvore crescem na mais profunda escuridão antes da primeira folha ver o sol.",
    subtext: "O seu crescimento atual é invisível para os outros. Mas o seu interior está a preparar-se para florescer.",
    baseViews: 4700,
    type: "premium-hope"
  },
  {
    id: 16,
    title: "A Faísca",
    text: "A qualquer momento, num dia comum... tudo muda.",
    subtext: "Um telefonema inesperado, um encontro acidental, uma nova ideia. O universo reescreve a sua história num milésimo de segundo. Esteja pronto.",
    baseViews: 4620,
    type: "premium-light"
  },
  {
    id: 17,
    title: "A Cura e O Perdão",
    text: "As feridas não desaparecem,\nelas tornam-se parte da sua armadura.",
    subtext: "Perdoe-se pelas vezes que falhou ao tentar sobreviver. Você fez o melhor que podia com o nível de consciência e dor que tinha na altura.",
    baseViews: 4500,
    type: "premium-hope"
  },
  {
    id: 18,
    title: "A Promessa",
    text: "Respire fundo.\nA tempestade está finalmente a passar.",
    subtext: "Prepare-se para a colheita, porque a temporada de escassez ensinou-lhe a dar valor a cada gota de chuva.",
    baseViews: 4410,
    type: "premium-light"
  },
  {
    id: 19,
    title: "A Revelação Final",
    text: "As fases mudam.\nAs pessoas evoluem.\nAs feridas cicatrizam.\n\nE um dia…\nvocê vai olhar para trás e perceber:",
    subtext: "Do nada…\ntudo começou a dar certo.",
    author: "Afonso Domingos — 2026",
    baseViews: 4390,
    type: "finale"
  }
];

const currentPageIndex = ref(0);
const currentPage = computed(() => pages[currentPageIndex.value]);

const realViews = ref({});

const fetchViews = async () => {
  try {
    const res = await fetch('/api/views');
    if (res.ok) {
      const data = await res.json();
      realViews.value = data;
    }
  } catch (e) {
    console.error("Erro ao carregar views do MongoDB:", e);
  }
};

const saveViewToDatabase = async (pageId) => {
  try {
    const res = await fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId })
    });
    if (res.ok) {
      const data = await res.json();
      realViews.value[pageId] = data.count;
    }
  } catch (e) {
    console.error("Erro ao gravar view no MongoDB:", e);
  }
};

const getPageViews = (page) => {
  const dbCount = realViews.value[page.id] || 0;
  return page.baseViews + dbCount;
};

// Progress Bar
const progressPercentage = computed(() => {
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
    showGiveUpWarning.value = false;
    return;
  }
  
  if (currentPageIndex.value < pages.length - 1) {
    isAnimating = true;
    currentPageIndex.value++;
    saveViewToDatabase(pages[currentPageIndex.value].id); // Trigger view save
    setTimeout(() => { isAnimating = false; }, 1500); 
  }
};

const goToPrevPage = () => {
  if (isAnimating || showPaywall.value) return; 
  
  if (currentPageIndex.value > 0) {
    isAnimating = true;
    currentPageIndex.value--;
    setTimeout(() => { isAnimating = false; }, 1500);
  }
};

const nextPage = () => {
  if (currentPageIndex.value === 0 && !audioEnabled.value && audioRef.value) {
     toggleAudio();
  }
  goToNextPage();
};

const handleWheel = (e) => {
  if (showPaymentModal.value || showPaywall.value) return; 
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
  if (showPaymentModal.value || showPaywall.value) return;
  const touchEndY = e.touches[0].clientY;
  const diff = touchStartY - touchEndY;
  
  if (diff > 50) {
    goToNextPage();
    touchStartY = touchEndY; 
  } else if (diff < -50) {
    goToPrevPage();
    touchStartY = touchEndY;
  }
};

const handleKeyDown = (e) => {
  if (showPaymentModal.value || showPaywall.value) return;
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
  
  // Connect to backend and save initial cover view
  fetchViews().then(() => {
    saveViewToDatabase(pages[0].id);
  });
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

const triggerGiveUpWarning = () => {
  showGiveUpWarning.value = true;
};

const finalGiveUp = () => {
  showGiveUpWarning.value = false;
  showPaywall.value = false;
  isAnimating = false;
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
    showGiveUpWarning.value = false;
    isAnimating = false; 
    goToNextPage(); 
  }, 2000);
};

// Formata os números de views para ter pontos (ex: 18.452)
const formatViews = (views) => {
  return new Intl.NumberFormat('pt-PT').format(views);
};
</script>

<template>
  <div class="min-h-screen bg-cinematic stars-bg text-brand-white relative overflow-hidden flex flex-col justify-center items-center select-none">
    
    <audio ref="audioRef" src="https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3" loop preload="auto"></audio>

    <div class="fixed top-0 left-0 h-[2px] bg-brand-gold z-50 transition-all duration-[1500ms] ease-out shadow-[0_0_10px_rgba(195,163,67,0.5)]" :style="{ width: progressPercentage + '%' }"></div>
    
    <button @click="toggleAudio" class="fixed top-6 right-6 z-50 text-brand-white/50 hover:text-brand-gold transition-colors duration-500 backdrop-blur-md p-3 rounded-full bg-brand-white/5 hover:bg-brand-white/10 hover:scale-110">
      <Volume2 v-if="isAudioPlaying" class="w-5 h-5" />
      <VolumeX v-else class="w-5 h-5" />
    </button>

    <div class="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/30 via-transparent to-brand-black transition-colors duration-[2000ms]"></div>

    <!-- MAIN CONTENT -->
    <Transition name="fade" mode="out-in">
      <div 
        :key="currentPage.id" 
        class="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center justify-center min-h-screen transition-all duration-[1500ms]"
        :class="{ 'blur-intense': showPaywall && !showPaymentModal }"
      >
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
              class="group relative overflow-hidden px-10 py-4 border border-brand-white/20 rounded-full hover:border-brand-white/60 hover:bg-brand-white/5 transition-all duration-700 uppercase tracking-[0.2em] text-xs flex items-center gap-4 backdrop-blur-md shadow-lg"
            >
              {{ currentPage.button }}
              <span class="w-1.5 h-1.5 rounded-full bg-brand-gold group-hover:scale-150 transition-transform duration-500"></span>
            </button>
            <p class="text-[10px] uppercase tracking-[0.2em] text-brand-white/30 flex items-center gap-2 mt-2 opacity-70">
              <Volume2 class="w-3 h-3" />
              Recomendado usar fones de ouvido
            </p>
          </div>
        </template>

        <template v-else-if="currentPage.type === 'decision'">
          <h1 class="text-4xl md:text-6xl font-light tracking-wide leading-relaxed animate-fade-in-up glow-text mb-8">
            {{ currentPage.text }}
          </h1>
          <p class="text-xl text-gray-400 font-light max-w-2xl leading-loose animate-fade-in-up delay-1000 mb-16">
            {{ currentPage.subtext }}
          </p>
          <button 
            @click="nextPage" 
            class="group relative animate-fade-in-up delay-2000 px-12 py-5 bg-brand-white text-brand-black rounded-full hover:scale-[1.03] shadow-[0_0_30px_rgba(245,245,245,0.2)] hover:shadow-[0_0_60px_rgba(245,245,245,0.5)] transition-all duration-700 uppercase tracking-[0.2em] text-sm font-bold"
          >
            {{ currentPage.button }}
          </button>
        </template>

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

        <template v-else>
          <h2 class="text-sm tracking-[0.3em] text-brand-gold/80 uppercase animate-fade-in-up mb-12">
            Capítulo {{ currentPage.id - 1 }}
          </h2>
          <h1 class="text-3xl md:text-5xl font-light tracking-wide leading-relaxed whitespace-pre-line animate-fade-in-up delay-1000 glow-text mb-12 max-w-3xl">
            {{ currentPage.text }}
          </h1>
          <p class="text-lg text-gray-400 font-light max-w-2xl leading-loose animate-fade-in-up delay-2000">
            {{ currentPage.subtext }}
          </p>
          <div class="mt-20 opacity-0 animate-fade-in-up delay-4000 text-gray-500 flex flex-col items-center gap-3">
            <span class="text-[10px] uppercase tracking-[0.3em]">Deslize para continuar</span>
            <div class="w-[1px] h-8 bg-gradient-to-b from-brand-gold/50 to-transparent opacity-50"></div>
          </div>
        </template>
        
        <!-- SOCIAL PROOF (VIEW COUNTER) -->
        <div v-if="currentPage.type !== 'cover'" class="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in-up delay-[4500ms] flex items-center gap-2 text-brand-white/40 bg-brand-black/50 px-5 py-2.5 rounded-full backdrop-blur-md border border-brand-white/5 shadow-xl">
          <Eye class="w-3.5 h-3.5 text-brand-gold/70" />
          <span class="text-[11px] tracking-[0.1em] uppercase font-light">{{ formatViews(getPageViews(currentPage)) }} pessoas chegaram aqui</span>
        </div>
      </div>
    </Transition>

    <!-- PAYWALL / GIVE UP OVERLAY -->
    <Transition name="fade">
      <div v-if="showPaywall && !showPaymentModal" class="absolute inset-0 z-40 flex items-center justify-center px-4 bg-brand-black/80 backdrop-blur-lg">
        
        <!-- INITIAL PAYWALL -->
        <div v-if="!showGiveUpWarning" class="max-w-xl text-center flex flex-col items-center animate-fade-in-up">
          <Lock class="w-8 h-8 text-brand-gold mb-6 animate-pulse" />
          <h2 class="text-3xl md:text-4xl font-light mb-6 glow-text drop-shadow-2xl">
            Toda transformação começa quando você decide continuar.
          </h2>
          <p class="text-gray-300 text-lg font-light mb-8 drop-shadow-lg">
            A jornada a partir daqui aprofunda a cura, a esperança e o verdadeiro renascimento.
          </p>

          <!-- SOCIAL PROOF MARKETING -->
          <div class="bg-gradient-to-b from-brand-gold/10 to-brand-gold/5 border border-brand-gold/20 rounded-2xl p-5 mb-10 w-full max-w-sm shadow-[0_0_30px_rgba(195,163,67,0.05)]">
            <p class="text-brand-gold text-sm font-light leading-relaxed">
              Mais de <strong class="font-semibold">{{ formatViews(getPageViews(pages[8])) }} pessoas</strong> decidiram não desistir e desbloquearam esta jornada.
            </p>
          </div>
          
          <button 
            @click="openPayment"
            class="group relative px-10 py-5 bg-gradient-to-r from-brand-gold/10 to-brand-gold/5 border border-brand-gold/40 text-brand-gold hover:from-brand-gold hover:to-[#d4b353] hover:text-brand-black transition-all duration-700 rounded-full uppercase tracking-widest text-sm flex items-center gap-4 backdrop-blur-md shadow-[0_0_40px_rgba(195,163,67,0.15)] hover:shadow-[0_0_60px_rgba(195,163,67,0.4)] hover:scale-[1.02]"
          >
            <Lock class="w-4 h-4" />
            Desbloquear os 10 Capítulos Finais — 3 USD
          </button>
          
          <button @click="triggerGiveUpWarning" class="text-xs text-gray-500 hover:text-red-400/80 underline uppercase tracking-widest transition-colors duration-500 mt-6 pt-4 border-t border-gray-800/50 w-3/4">
            Não estou pronto. Quero desistir.
          </button>
        </div>

        <!-- GIVE UP WARNING -->
        <div v-else class="max-w-xl text-center flex flex-col items-center animate-fade-in-up">
          <AlertTriangle class="w-10 h-10 text-red-900/80 mb-6 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]" />
          <h2 class="text-2xl md:text-3xl font-light mb-6 text-gray-200">
            Tem certeza de que vai desistir agora?
          </h2>
          <p class="text-gray-400 text-base font-light mb-12 leading-relaxed">
            Desistir agora significa aceitar que tudo continuará exatamente igual. A dor de ficar no mesmo lugar é muito maior do que a dor de mudar. Se não der o próximo passo, nada vai dar certo do nada. A decisão é sua.
          </p>
          
          <div class="flex flex-col md:flex-row gap-5 w-full justify-center">
            <button 
              @click="openPayment"
              class="px-8 py-4 bg-brand-white text-brand-black hover:scale-105 transition-all duration-500 rounded-full uppercase tracking-widest text-xs font-bold shadow-[0_0_30px_rgba(245,245,245,0.2)]"
            >
              Eu quero mudar
            </button>
            <button 
              @click="finalGiveUp"
              class="px-8 py-4 border border-gray-700 text-gray-500 hover:bg-gray-900 hover:text-gray-400 transition-all duration-500 rounded-full uppercase tracking-widest text-xs"
            >
              Aceito ficar igual
            </button>
          </div>
        </div>

      </div>
    </Transition>

    <!-- PAYMENT MODAL -->
    <Transition name="fade">
      <div v-if="showPaymentModal" class="absolute inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-2xl">
        <div class="bg-[#0a0f18] border border-gray-800 rounded-3xl max-w-md w-full p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          <div v-if="paymentConfirmed" class="flex flex-col items-center justify-center py-12 animate-fade-in-up">
            <div class="relative mb-6">
              <div class="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full"></div>
              <CheckCircle class="w-16 h-16 text-green-500 relative z-10" />
            </div>
            <h3 class="text-2xl font-light text-white mb-3">Acesso Liberado</h3>
            <p class="text-gray-400 text-center leading-relaxed">Você escolheu a mudança. A sua jornada continua agora.</p>
          </div>

          <div v-else>
            <button @click="showPaymentModal = false; showPaywall = true" class="absolute top-6 right-6 text-gray-600 hover:text-white transition-colors duration-300">
              &times; FECHAR
            </button>
            
            <h3 class="text-2xl font-light text-white mb-2">Compromisso de Mudança</h3>
            <p class="text-gray-400 mb-8 text-sm">Escolha como deseja desbloquear os 10 Capítulos Finais.</p>
            
            <div class="grid grid-cols-2 gap-4 mb-8">
              <button 
                @click="selectPayment('mpesa')"
                class="p-5 border rounded-2xl flex flex-col items-center gap-3 transition-all duration-300"
                :class="paymentMethod === 'mpesa' ? 'border-brand-gold bg-brand-gold/10 text-brand-gold scale-[1.02] shadow-[0_0_20px_rgba(195,163,67,0.15)]' : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:bg-gray-800/30'"
              >
                <Send class="w-7 h-7" />
                <span class="text-sm font-medium tracking-wide">M-Pesa</span>
              </button>
              
              <button 
                @click="selectPayment('card')"
                class="p-5 border rounded-2xl flex flex-col items-center gap-3 transition-all duration-300"
                :class="paymentMethod === 'card' ? 'border-blue-500 bg-blue-500/10 text-blue-400 scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:bg-gray-800/30'"
              >
                <CreditCard class="w-7 h-7" />
                <span class="text-sm font-medium tracking-wide">PayPal</span>
              </button>
            </div>

            <div v-if="paymentMethod === 'mpesa'" class="bg-gradient-to-b from-brand-black/50 to-transparent p-5 rounded-xl border border-gray-800/50 mb-8 text-sm text-gray-400 text-center animate-fade-in-up">
              <p class="mb-2">Envie <strong>190 MT</strong> para o número:</p>
              <p class="text-2xl text-brand-gold mb-3 font-mono tracking-widest font-light">84 000 0000</p>
              <p class="text-[11px] uppercase tracking-widest opacity-60">Após o envio, clique abaixo para confirmar.</p>
            </div>

            <div v-if="paymentMethod === 'card'" class="bg-gradient-to-b from-brand-black/50 to-transparent p-5 rounded-xl border border-gray-800/50 mb-8 text-sm text-gray-400 text-center animate-fade-in-up">
              <ShieldCheck class="w-10 h-10 text-blue-500/80 mx-auto mb-3" />
              <p class="tracking-wide">Pagamento seguro via PayPal.</p>
              <p class="text-[11px] uppercase tracking-widest opacity-60 mt-3">Irá ser redirecionado para concluir o pagamento de $3 USD.</p>
            </div>

            <button 
              @click="simulatePayment"
              :disabled="!paymentMethod"
              class="w-full py-5 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-500 shadow-xl"
              :class="paymentMethod 
                ? 'bg-brand-white text-brand-black hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(245,245,245,0.3)] cursor-pointer' 
                : 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-gray-800'"
            >
              {{ paymentMethod === 'mpesa' ? 'Confirmar M-Pesa' : paymentMethod === 'card' ? 'Pagar com PayPal' : 'Selecione um método' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>
