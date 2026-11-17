document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "sedu_es_faltas_v3";
  const DEFAULT_END_DATE = `${new Date().getFullYear()}-12-15`;

  const state = {
    activeTab: "trimestres",
    t1: 0,
    t2: 0,
    t3: 0,
    totalDireto: 0,
    aulasPorDia: 7,
    totalAulasAno: 1400,
    dataFim: DEFAULT_END_DATE,
    incluirHoje: true,
    descontarFeriados: true
  };

  // Elementos DOM existentes
  const tabTrimestres = document.getElementById("tab-trimestres");
  const tabTotal = document.getElementById("tab-total");
  const panelTrimestres = document.getElementById("panel-trimestres");
  const panelTotal = document.getElementById("panel-total");

  const inputT1 = document.getElementById("input-t1");
  const inputT2 = document.getElementById("input-t2");
  const inputT3 = document.getElementById("input-t3");
  const inputTotalDireto = document.getElementById("input-total-direto");
  const somaTrimestresPreview = document.getElementById("soma-trimestres-preview");

  const cfgAulasDia = document.getElementById("cfg-aulas-dia");
  const cfgTotalAulas = document.getElementById("cfg-total-aulas");
  const cfgDataFim = document.getElementById("cfg-data-fim");
  const cfgIncluirHoje = document.getElementById("cfg-incluir-hoje");
  const cfgDescontarFeriados = document.getElementById("cfg-descontar-feriados");
  const cfgResumo = document.getElementById("cfg-resumo");
  const configPanel = document.getElementById("config-panel");
  const btnToggleConfig = document.getElementById("btn-toggle-config");
  const btnLimpar = document.getElementById("btn-limpar");

  const statusTitulo = document.getElementById("status-titulo");
  const statusPill = document.getElementById("status-pill");
  const progressFill = document.getElementById("progress-fill");
  const metaFaltas = document.getElementById("meta-faltas");
  const metaFrequencia = document.getElementById("meta-frequencia");

  const resTotalFaltas = document.getElementById("res-total-faltas");
  const resDiasFaltados = document.getElementById("res-dias-faltados");
  const resFrequencia = document.getElementById("res-frequencia");
  const resPodeDias = document.getElementById("res-pode-dias");
  const resPodeAulas = document.getElementById("res-pode-aulas");
  const resReprovaDias = document.getElementById("res-reprova-dias");
  const resReprovaAulas = document.getElementById("res-reprova-aulas");

  // Elementos DOM da nova seção: Reta Final até 15/12
  const fimSubtituloData = document.getElementById("fim-subtitulo-data");
  const fimStatusPill = document.getElementById("fim-status-pill");
  const fimVereditoBox = document.getElementById("fim-veredito-box");
  const fimVereditoTitulo = document.getElementById("fim-veredito-titulo");
  const fimVereditoDesc = document.getElementById("fim-veredito-desc");
  const fimDiasRestantes = document.getElementById("fim-dias-restantes");
  const fimAulasRestantes = document.getElementById("fim-aulas-restantes");
  const fimPresencaDias = document.getElementById("fim-presenca-dias");
  const fimPresencaAulas = document.getElementById("fim-presenca-aulas");
  const fimProjecaoFaltas = document.getElementById("fim-projecao-faltas");
  const fimProjecaoFreq = document.getElementById("fim-projecao-freq");

  // Feriados nacionais fixos (MM-DD)
  const FERIADOS_FIXOS = new Set([
    "01-01", // Confraternização Universal
    "04-21", // Tiradentes
    "05-01", // Dia do Trabalho
    "09-07", // Independência do Brasil
    "10-12", // Nossa Senhora Aparecida
    "11-02", // Finados
    "11-15", // Proclamação da República
    "11-20", // Dia Nacional de Zumbi e da Consciência Negra
    "12-25"  // Natal
  ]);

  function toNonNegativeInt(value) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  function formatDiasEAulas(totalAulas, aulasPorDia) {
    const diasInteiros = Math.floor(totalAulas / aulasPorDia);
    const aulasRestantes = totalAulas % aulasPorDia;
    if (diasInteiros === 0 && aulasRestantes === 0) return "0 dias";
    if (aulasRestantes === 0) {
      return `${diasInteiros} ${diasInteiros === 1 ? "dia" : "dias"}`;
    }
    if (diasInteiros === 0) {
      return `${aulasRestantes} ${aulasRestantes === 1 ? "aula" : "aulas"}`;
    }
    return `${diasInteiros}d + ${aulasRestantes}a`;
  }

  function parseLocalDate(isoDateStr) {
    if (!isoDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(isoDateStr)) {
      return new Date(new Date().getFullYear(), 11, 15);
    }
    const [y, m, d] = isoDateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDateBR(dateObj) {
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function contarDiasLetivosAte(dataFimStr, incluirHoje, descontarFeriados) {
    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const fim = parseLocalDate(dataFimStr);

    if (fim < hoje) {
      return { diasLetivos: 0, diasCorridos: 0, encerrado: true, dataFimFormatada: formatDateBR(fim) };
    }

    const msPorDia = 24 * 60 * 60 * 1000;
    const diasCorridos = Math.max(0, Math.round((fim - hoje) / msPorDia));

    const cursor = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + (incluirHoje ? 0 : 1));
    let diasLetivos = 0;

    while (cursor <= fim) {
      const diaSemana = cursor.getDay(); // 0 = Dom, 6 = Sáb
      if (diaSemana !== 0 && diaSemana !== 6) {
        const mm = String(cursor.getMonth() + 1).padStart(2, "0");
        const dd = String(cursor.getDate()).padStart(2, "0");
        const chaveFeriado = `${mm}-${dd}`;
        if (!descontarFeriados || !FERIADOS_FIXOS.has(chaveFeriado)) {
          diasLetivos++;
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      diasLetivos,
      diasCorridos,
      encerrado: false,
      dataFimFormatada: formatDateBR(fim)
    };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      // Ignora erro caso o navegador bloqueie localStorage
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("sedu_es_faltas_v2");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        state.activeTab = parsed.activeTab === "total" ? "total" : "trimestres";
        state.t1 = toNonNegativeInt(parsed.t1);
        state.t2 = toNonNegativeInt(parsed.t2);
        state.t3 = toNonNegativeInt(parsed.t3);
        state.totalDireto = toNonNegativeInt(parsed.totalDireto);
        state.aulasPorDia = Math.max(1, toNonNegativeInt(parsed.aulasPorDia) || 7);
        state.totalAulasAno = Math.max(100, toNonNegativeInt(parsed.totalAulasAno) || 1400);
        if (typeof parsed.dataFim === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.dataFim)) {
          state.dataFim = parsed.dataFim;
        }
        if (typeof parsed.incluirHoje === "boolean") {
          state.incluirHoje = parsed.incluirHoje;
        }
        if (typeof parsed.descontarFeriados === "boolean") {
          state.descontarFeriados = parsed.descontarFeriados;
        }
      }
    } catch (err) {
      // Segue com valores padrão
    }
  }

  function syncInputsFromState() {
    inputT1.value = state.t1 > 0 ? state.t1 : "";
    inputT2.value = state.t2 > 0 ? state.t2 : "";
    inputT3.value = state.t3 > 0 ? state.t3 : "";
    inputTotalDireto.value = state.totalDireto > 0 ? state.totalDireto : "";
    cfgAulasDia.value = state.aulasPorDia;
    cfgTotalAulas.value = state.totalAulasAno;
    cfgDataFim.value = state.dataFim;
    cfgIncluirHoje.checked = state.incluirHoje;
    cfgDescontarFeriados.checked = state.descontarFeriados;
    setActiveTab(state.activeTab, false);
  }

  function setActiveTab(tabName, shouldRecalc = true) {
    state.activeTab = tabName;
    const isTrimestres = tabName === "trimestres";

    tabTrimestres.classList.toggle("active", isTrimestres);
    tabTotal.classList.toggle("active", !isTrimestres);

    panelTrimestres.classList.toggle("active", isTrimestres);
    panelTotal.classList.toggle("active", !isTrimestres);

    if (shouldRecalc) {
      saveState();
      calculate();
    }
  }

  function updateRetaFinal(totalFaltas, limiteFaltas, aulasAindaPodeFaltar, aulasPorDia, totalAulasAno) {
    const infoCalendario = contarDiasLetivosAte(
      state.dataFim,
      state.incluirHoje,
      state.descontarFeriados
    );

    const { diasLetivos, diasCorridos, encerrado, dataFimFormatada } = infoCalendario;
    const aulasLetivasRestantes = diasLetivos * aulasPorDia;

    fimSubtituloData.textContent = `Reta Final • Encerramento em ${dataFimFormatada}`;
    fimDiasRestantes.textContent = `${diasLetivos} ${diasLetivos === 1 ? "dia" : "dias"}`;
    fimAulasRestantes.textContent = `${aulasLetivasRestantes} aulas (${diasCorridos} ${diasCorridos === 1 ? "dia corrido" : "dias corridos"})`;

    // Projeção se faltar tudo até o fim das aulas
    const faltasSeFaltarTudo = totalFaltas + aulasLetivasRestantes;
    const pctFaltasFinal = (faltasSeFaltarTudo / totalAulasAno) * 100;
    const freqFinal = Math.max(0, 100 - pctFaltasFinal);
    const passaFaltandoTudo = faltasSeFaltarTudo <= limiteFaltas;

    fimProjecaoFaltas.textContent = `${faltasSeFaltarTudo} ${faltasSeFaltarTudo === 1 ? "falta" : "faltas"}`;
    fimProjecaoFreq.textContent = `Freq. final: ${freqFinal.toFixed(1)}% (${passaFaltandoTudo ? "Aprovado" : "Reprova"})`;

    // Limpa classes de estado
    fimStatusPill.classList.remove("warn", "danger");
    fimVereditoBox.classList.remove("ok", "warn", "danger");

    if (encerrado) {
      fimPresencaDias.textContent = "0 dias";
      fimPresencaAulas.textContent = "Período letivo encerrado";

      if (totalFaltas > limiteFaltas) {
        fimStatusPill.textContent = "Reprovado por faltas";
        fimStatusPill.classList.add("danger");
        fimVereditoBox.classList.add("danger");
        fimVereditoTitulo.textContent = `Ano letivo encerrado (${dataFimFormatada}) acima do limite`;
        fimVereditoDesc.textContent = `Você fechou com ${totalFaltas} faltas, ultrapassando o máximo de ${limiteFaltas} faltas permitidas.`;
      } else {
        fimStatusPill.textContent = "Aprovado por frequência";
        fimVereditoBox.classList.add("ok");
        fimVereditoTitulo.textContent = `Ano letivo encerrado (${dataFimFormatada}) dentro do limite!`;
        fimVereditoDesc.textContent = `Você fechou com ${totalFaltas} faltas de ${limiteFaltas} permitidas. Frequência dentro da regra da SEDU-ES.`;
      }
      return;
    }

    if (totalFaltas > limiteFaltas) {
      const excesso = totalFaltas - limiteFaltas;
      fimStatusPill.textContent = "Limite já ultrapassado";
      fimStatusPill.classList.add("danger");
      fimVereditoBox.classList.add("danger");

      fimPresencaDias.textContent = "Excedido";
      fimPresencaAulas.textContent = `Passou ${excesso} ${excesso === 1 ? "aula" : "aulas"} do teto`;

      fimVereditoTitulo.textContent = "NÃO — Você já ultrapassou o limite de faltas permitidas";
      fimVereditoDesc.textContent = `Mesmo indo a todos os ${diasLetivos} dias letivos restantes (${aulasLetivasRestantes} aulas) até ${dataFimFormatada}, você já está com ${totalFaltas} faltas (limite: ${limiteFaltas}).`;
      return;
    }

    if (aulasAindaPodeFaltar >= aulasLetivasRestantes) {
      const sobraAulas = aulasAindaPodeFaltar - aulasLetivasRestantes;
      fimStatusPill.textContent = "Pode faltar até o fim!";
      fimVereditoBox.classList.add("ok");

      fimPresencaDias.textContent = "0 dias";
      fimPresencaAulas.textContent = "Nenhuma aula obrigatória";

      fimVereditoTitulo.textContent = "SIM! Você consegue faltar até as aulas acabarem sem reprovar";
      if (diasLetivos === 0) {
        fimVereditoDesc.textContent = `Não há mais dias letivos até ${dataFimFormatada} e você está dentro do limite (${totalFaltas}/${limiteFaltas} faltas).`;
      } else {
        fimVereditoDesc.textContent = `Faltam ${diasLetivos} ${diasLetivos === 1 ? "dia letivo" : "dias letivos"} (${aulasLetivasRestantes} aulas) até ${dataFimFormatada}, e você ainda pode faltar ${aulasAindaPodeFaltar} aulas. Mesmo faltando todos os dias restantes, você não reprova e ainda sobram ${formatDiasEAulas(sobraAulas, aulasPorDia)} (${sobraAulas} aulas) de margem!`;
      }
      return;
    }

    // Não consegue faltar tudo até 15/12 sem reprovar
    const aulasMinimasPresenca = aulasLetivasRestantes - aulasAindaPodeFaltar;
    const diasMinimosPresenca = Math.ceil(aulasMinimasPresenca / aulasPorDia);

    fimPresencaDias.textContent = `${diasMinimosPresenca} ${diasMinimosPresenca === 1 ? "dia" : "dias"}`;
    fimPresencaAulas.textContent = `Mínimo de ${aulasMinimasPresenca} ${aulasMinimasPresenca === 1 ? "aula" : "aulas"}`;

    if (aulasAindaPodeFaltar === 0) {
      fimStatusPill.textContent = "0 faltas disponíveis";
      fimStatusPill.classList.add("danger");
      fimVereditoBox.classList.add("danger");

      fimVereditoTitulo.textContent = "NÃO! Você não pode faltar mais nenhum dia até as aulas acabarem";
      fimVereditoDesc.textContent = `Você já atingiu exatamente ${limiteFaltas} faltas. Para não reprovar, precisa comparecer a todos os ${diasLetivos} dias letivos restantes (${aulasLetivasRestantes} aulas) até ${dataFimFormatada}.`;
    } else {
      fimStatusPill.textContent = `Ir pelo menos ${diasMinimosPresenca}d`;
      fimStatusPill.classList.add("warn");
      fimVereditoBox.classList.add("warn");

      fimVereditoTitulo.textContent = `NÃO dá para faltar tudo — você precisa ir pelo menos ${diasMinimosPresenca} ${diasMinimosPresenca === 1 ? "dia" : "dias"}`;
      fimVereditoDesc.textContent = `Faltam ${diasLetivos} dias letivos (${aulasLetivasRestantes} aulas) até ${dataFimFormatada}, mas você só pode faltar mais ${formatDiasEAulas(aulasAindaPodeFaltar, aulasPorDia)} (${aulasAindaPodeFaltar} aulas). Compareça a pelo menos ${aulasMinimasPresenca} aulas para fechar o ano aprovado.`;
    }
  }

  function calculate() {
    const aulasPorDia = Math.max(1, toNonNegativeInt(cfgAulasDia.value) || 7);
    const totalAulasAno = Math.max(100, toNonNegativeInt(cfgTotalAulas.value) || 1400);

    state.aulasPorDia = aulasPorDia;
    state.totalAulasAno = totalAulasAno;
    state.dataFim = cfgDataFim.value || DEFAULT_END_DATE;
    state.incluirHoje = cfgIncluirHoje.checked;
    state.descontarFeriados = cfgDescontarFeriados.checked;

    state.t1 = toNonNegativeInt(inputT1.value);
    state.t2 = toNonNegativeInt(inputT2.value);
    state.t3 = toNonNegativeInt(inputT3.value);
    state.totalDireto = toNonNegativeInt(inputTotalDireto.value);

    const somaTrimestres = state.t1 + state.t2 + state.t3;
    somaTrimestresPreview.textContent = `${somaTrimestres} ${somaTrimestres === 1 ? "falta" : "faltas"}`;

    const limiteFaltas = Math.floor(totalAulasAno * 0.25); // 350 no padrão 1400
    const faltasParaReprovarAbsoluto = limiteFaltas + 1;   // 351 no padrão 1400

    cfgResumo.textContent = `Regra atual: ${aulasPorDia} aulas/dia • Limite máximo de ${limiteFaltas} faltas (25% de ${totalAulasAno} aulas).`;

    const totalFaltas = state.activeTab === "trimestres" ? somaTrimestres : state.totalDireto;

    // Porcentagens
    const pctFaltas = (totalFaltas / totalAulasAno) * 100;
    const pctFrequencia = Math.max(0, 100 - pctFaltas);
    const pctLimiteUsado = limiteFaltas > 0 ? (totalFaltas / limiteFaltas) * 100 : 100;

    // Margem segura (ainda pode faltar)
    const aulasAindaPodeFaltar = Math.max(0, limiteFaltas - totalFaltas);
    const diasInteirosPodeFaltar = Math.floor(aulasAindaPodeFaltar / aulasPorDia);
    const sobraAulasPodeFaltar = aulasAindaPodeFaltar % aulasPorDia;

    // Quantos dias faltando para reprovar
    const aulasRestantesParaReprovar = Math.max(0, faltasParaReprovarAbsoluto - totalFaltas);
    const diasInteirosParaReprovar = Math.ceil(aulasRestantesParaReprovar / aulasPorDia);

    // Atualiza UI principal
    resTotalFaltas.textContent = `${totalFaltas} ${totalFaltas === 1 ? "aula" : "aulas"}`;
    const diasJaFaltados = (totalFaltas / aulasPorDia).toFixed(1).replace(".0", "");
    resDiasFaltados.textContent = `Equivale a ${diasJaFaltados} ${diasJaFaltados === "1" ? "dia letivo" : "dias letivos"}`;

    resFrequencia.textContent = `${pctFrequencia.toFixed(1)}%`;
    metaFaltas.textContent = `${totalFaltas} / ${limiteFaltas} faltas permitidas`;
    metaFrequencia.textContent = `Frequência: ${pctFrequencia.toFixed(1)}%`;

    // Atualiza cartões de "Ainda pode faltar" e "Reprova se faltar"
    if (totalFaltas > limiteFaltas) {
      resPodeDias.textContent = "0 dias";
      resPodeAulas.textContent = "Limite já ultrapassado";

      const excesso = totalFaltas - limiteFaltas;
      resReprovaDias.textContent = "Reprovado";
      resReprovaAulas.textContent = `Passou ${excesso} ${excesso === 1 ? "aula" : "aulas"} do limite`;
    } else {
      resPodeDias.textContent = `${diasInteirosPodeFaltar} ${diasInteirosPodeFaltar === 1 ? "dia" : "dias"}`;
      resPodeAulas.textContent =
        sobraAulasPodeFaltar > 0
          ? `${aulasAindaPodeFaltar} aulas (${diasInteirosPodeFaltar}d e ${sobraAulasPodeFaltar}a)`
          : `${aulasAindaPodeFaltar} aulas exatas`;

      resReprovaDias.textContent = `${diasInteirosParaReprovar} ${diasInteirosParaReprovar === 1 ? "dia" : "dias"}`;
      resReprovaAulas.textContent = `Faltando mais ${aulasRestantesParaReprovar} ${aulasRestantesParaReprovar === 1 ? "aula" : "aulas"} (atinge ${faltasParaReprovarAbsoluto})`;
    }

    // Barra de progresso e status
    const barWidth = Math.min(100, Math.max(0, pctLimiteUsado));
    progressFill.style.width = `${barWidth}%`;

    statusPill.classList.remove("warn", "danger");

    if (totalFaltas > limiteFaltas) {
      statusTitulo.textContent = "Limite Ultrapassado (Risco de Reprovação)";
      statusPill.textContent = `${pctLimiteUsado.toFixed(0)}% do limite`;
      statusPill.classList.add("danger");
      progressFill.style.backgroundColor = "var(--danger)";
    } else if (pctLimiteUsado >= 80) {
      statusTitulo.textContent = "Atenção Crítica — Muito Perto do Limite";
      statusPill.textContent = `${pctLimiteUsado.toFixed(0)}% do limite usado`;
      statusPill.classList.add("danger");
      progressFill.style.backgroundColor = "var(--danger)";
    } else if (pctLimiteUsado >= 50) {
      statusTitulo.textContent = "Atenção Moderada — Controle suas Faltas";
      statusPill.textContent = `${pctLimiteUsado.toFixed(0)}% do limite usado`;
      statusPill.classList.add("warn");
      progressFill.style.backgroundColor = "var(--warn)";
    } else {
      statusTitulo.textContent = "Frequência Segura";
      statusPill.textContent = `${pctLimiteUsado.toFixed(0)}% do limite usado`;
      progressFill.style.backgroundColor = "var(--ok)";
    }

    // Atualiza seção de reta final até 15/12
    updateRetaFinal(totalFaltas, limiteFaltas, aulasAindaPodeFaltar, aulasPorDia, totalAulasAno);

    saveState();
  }

  // Eventos das Abas
  tabTrimestres.addEventListener("click", () => setActiveTab("trimestres", true));
  tabTotal.addEventListener("click", () => setActiveTab("total", true));

  // Eventos de Digitação e Alteração
  [inputT1, inputT2, inputT3, inputTotalDireto, cfgAulasDia, cfgTotalAulas, cfgDataFim].forEach((el) => {
    el.addEventListener("input", calculate);
    el.addEventListener("change", calculate);
  });

  [cfgIncluirHoje, cfgDescontarFeriados].forEach((el) => {
    el.addEventListener("change", calculate);
  });

  // Abrir/Fechar Configurações
  btnToggleConfig.addEventListener("click", () => {
    configPanel.classList.toggle("open");
  });

  // Botão Limpar
  btnLimpar.addEventListener("click", () => {
    state.t1 = 0;
    state.t2 = 0;
    state.t3 = 0;
    state.totalDireto = 0;
    inputT1.value = "";
    inputT2.value = "";
    inputT3.value = "";
    inputTotalDireto.value = "";
    calculate();
  });

  // Inicialização
  loadState();
  syncInputsFromState();
  calculate();
});
