(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════ Custom cursor (text caret) ══════════ */
  var caret = document.getElementById('cursorCaret');
  var halo = document.getElementById('cursorHalo');
  var mx = 0, my = 0, hx = 0, hy = 0;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (caret) { caret.style.left = mx + 'px'; caret.style.top = my + 'px'; }
    var el = e.target.closest && e.target.closest('a, button, input, .chip, .quick-cmds button');
    document.body.classList.toggle('cursor-hover', !!el);
  });

  function animateHalo() {
    hx += (mx - hx) * 0.15;
    hy += (my - hy) * 0.15;
    if (halo) { halo.style.left = hx + 'px'; halo.style.top = hy + 'px'; }
    requestAnimationFrame(animateHalo);
  }
  animateHalo();

  /* ══════════ Scroll progress ══════════ */
  var progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', function () {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? scrollTop / docHeight : 0;
    if (progressBar) progressBar.style.transform = 'scaleX(' + progress + ')';
  }, { passive: true });

  /* ══════════ Scroll reveal ══════════ */
  var revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(function (el) { observer.observe(el); });

  /* ══════════ Active nav link on scroll ══════════ */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.term-nav a');
  window.addEventListener('scroll', function () {
    var current = '';
    sections.forEach(function (section) {
      var top = section.offsetTop - 220;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  /* ══════════ Tab title easter egg ══════════ */
  var originalTitle = document.title;
  document.addEventListener('visibilitychange', function () {
    document.title = document.hidden ? ':( volte logo — core-router' : originalTitle;
  });

  /* ══════════ Boot screen ══════════ */
  var bootScreen = document.getElementById('bootScreen');
  var bootLog = document.getElementById('bootLog');
  var bootSkip = document.getElementById('bootSkip');
  var termInput = document.getElementById('termInput');

  var BOOT_LINES = [
    '[ <span class="ok">OK</span> ] Iniciando kernel jefferson-os 9.5.0-network',
    '[ <span class="ok">OK</span> ] Montando /home/infraestrutura',
    '[ <span class="ok">OK</span> ] Carregando módulos: redes, automação, ia',
    '[ <span class="ok">OK</span> ] Detectando hardware: Cisco, Juniper, Huawei, MikroTik',
    '[ <span class="info">INFO</span> ] 9+ anos de uptime em produção',
    '[ <span class="ok">OK</span> ] Estabelecendo uplink com o backbone...',
    '[ <span class="ok">OK</span> ] Sessão pronta.',
    '',
    'login: jefferson',
    'senha: ********',
    'Bem-vindo, jefferson. Carregando shell interativo...'
  ];

  function finishBoot() {
    if (!bootScreen || bootScreen.classList.contains('hidden')) return;
    bootScreen.classList.add('hidden');
    setTimeout(function () {
      bootScreen.style.display = 'none';
      runInitialCommand();
      if (termInput && window.innerWidth > 900) termInput.focus();
    }, 620);
  }

  function playBoot() {
    if (!bootScreen || !bootLog) { runInitialCommand(); return; }
    if (reduceMotion) { finishBoot(); return; }
    var i = 0;
    function next() {
      if (i >= BOOT_LINES.length) { setTimeout(finishBoot, 500); return; }
      var line = document.createElement('div');
      line.className = 'boot-line';
      line.innerHTML = BOOT_LINES[i];
      bootLog.appendChild(line);
      requestAnimationFrame(function () { line.classList.add('show'); });
      i++;
      setTimeout(next, 180);
    }
    next();
  }

  if (bootSkip) bootSkip.addEventListener('click', finishBoot);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Enter') finishBoot();
  }, { once: false });

  /* ══════════ Live metrics ══════════ */
  var CAREER_START = new Date(2017, 2, 1).getTime(); // 1 mar 2017
  var uptimeEl = document.getElementById('uptimeVal');
  var pingEl = document.getElementById('pingVal');

  function updateUptime() {
    if (!uptimeEl) return;
    var now = Date.now();
    var diffMs = now - CAREER_START;
    var years = Math.floor(diffMs / (365.25 * 24 * 3600 * 1000));
    var rem = diffMs - years * 365.25 * 24 * 3600 * 1000;
    var days = Math.floor(rem / (24 * 3600 * 1000));
    uptimeEl.textContent = years + 'a ' + days + 'd';
  }
  updateUptime();
  setInterval(updateUptime, 60000);

  function updatePing() {
    if (!pingEl) return;
    var val = (2 + Math.random() * 5).toFixed(1);
    pingEl.textContent = val + 'ms';
  }
  updatePing();
  setInterval(updatePing, 2200);

  /* sparkline */
  var sparkPoly = document.getElementById('sparkPoly');
  var sparkData = [8, 6, 9, 5, 7, 10, 6, 8, 5, 9, 7, 6];
  function renderSpark() {
    if (!sparkPoly) return;
    sparkData.shift();
    sparkData.push(3 + Math.random() * 10);
    var w = 200, h = 40, step = w / (sparkData.length - 1);
    var pts = sparkData.map(function (v, idx) {
      return (idx * step).toFixed(1) + ',' + (h - v * 3).toFixed(1);
    }).join(' ');
    sparkPoly.setAttribute('points', pts);
  }
  renderSpark();
  setInterval(renderSpark, 1500);

  /* ══════════ Interactive terminal REPL ══════════ */
  var termHistory = document.getElementById('termHistory');
  var cmdHistory = [];
  var cmdIndex = -1;

  var SECTION_MAP = { home: 'home', sobre: 'sobre', stack: 'stack', projetos: 'projetos', contato: 'contato' };

  function appendLine(html, cls) {
    var div = document.createElement('div');
    div.className = 'out' + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    termHistory.appendChild(div);
    scrollToBottom();
  }

  function appendCmdEcho(cmd) {
    var div = document.createElement('div');
    div.className = 'line-cmd';
    div.textContent = cmd;
    termHistory.appendChild(div);
    scrollToBottom();
  }

  function scrollToBottom() {
    var body = document.getElementById('termBodyInner');
    if (body) body.scrollTop = body.scrollHeight;
  }

  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var COMMANDS = {
    help: function () {
      appendLine(
        'Comandos disponíveis:\n' +
        '  whoami          → quem sou eu\n' +
        '  about           → resumo profissional\n' +
        '  experience      → trajetória\n' +
        '  stack           → tecnologias\n' +
        '  projects        → projetos\n' +
        '  contact         → contato\n' +
        '  ping &lt;host&gt;     → simula um ping\n' +
        '  traceroute      → simula uma rota até mim\n' +
        '  nmap &lt;host&gt;     → simula um scan de portas\n' +
        '  neofetch        → system info estilizado\n' +
        '  ls              → lista seções\n' +
        '  cd &lt;secao&gt;      → navega até a seção\n' +
        '  open &lt;rede&gt;     → abre linkedin / github / instagram\n' +
        '  sudo hire jefferson\n' +
        '  clear           → limpa o terminal'
      );
    },
    whoami: function () {
      appendLine('jefferson', 'out-ok');
      appendLine('Jefferson Byller Gomes dos Santos\nNetwork Engineer & AI Student — Campina Grande, PB');
    },
    about: function () {
      appendLine(
        'Mais de 9 anos em provedores de internet, construindo uma trajetória sólida em\n' +
        'infraestrutura, redes e administração de sistemas — alta disponibilidade,\n' +
        'virtualização, monitoramento e automação.\n\n' +
        'Formado em Análise e Desenvolvimento de Sistemas, atualmente cursando\n' +
        'Inteligência Artificial, direcionando a carreira para a integração entre\n' +
        'infraestrutura tradicional e soluções baseadas em IA.'
      );
    },
    experience: function () {
      appendLine(
        '9+ anos em provedores de internet (ISP)\n' +
        'Infraestrutura, redes, administração de sistemas\n' +
        'Alta disponibilidade · virtualização · monitoramento · automação\n' +
        'Formado em Análise e Desenvolvimento de Sistemas\n' +
        'Cursando Inteligência Artificial'
      );
    },
    stack: function () {
      appendLine(
        '[redes]     Cisco, Juniper, Huawei, MikroTik, OLT/GPON, Backbone, Roteamento\n' +
        '[infra]     Linux, Proxmox, VMware, Docker, AWS, CI/CD, Microserviços, SQL\n' +
        '[dev/ia]    Python, Node.js, PHP, Git'
      );
    },
    projects: function () {
      appendLine(
        '📡 J-SPOT Network — Captive Portal Multi-tenant\n' +
        '   Node.js/Express, MySQL, RADIUS+MikroTik, PIX, LGPD e Marco Civil\n' +
        '   → <a href="jspot.html">jspot.html</a>'
      );
    },
    contact: function () {
      appendLine(
        'Host linkedin\n  HostName <a href="https://www.linkedin.com/in/jefferson-byller-647464249/" target="_blank" rel="noopener">linkedin.com/in/jefferson-byller</a>\n' +
        'Host github\n  HostName <a href="https://github.com/JeffByller" target="_blank" rel="noopener">github.com/JeffByller</a>\n' +
        'Host instagram\n  HostName <a href="https://www.instagram.com/jeffgsan/" target="_blank" rel="noopener">instagram.com/jeffgsan</a>'
      );
    },
    neofetch: function () {
      appendLine(
        'jefferson@core-router\n' +
        '---------------------\n' +
        'OS: Jefferson-OS 9.5 LTS\n' +
        'Uptime: 9+ anos (produção)\n' +
        'Shell: bash + automação\n' +
        'Stack: Cisco / MikroTik / Linux / Python\n' +
        'Formação: ADS + IA (cursando)\n' +
        'Local: Campina Grande, PB'
      );
    },
    ls: function () {
      appendLine('sobre.md   stack.sh   projetos/   contato.cfg');
    },
    clear: function () {
      termHistory.innerHTML = '';
    }
  };

  function runPing(target) {
    target = target || 'jefferson.dev';
    appendLine('PING ' + target + ': 56 data bytes', 'out-dim');
    var seq = 0;
    var iv = setInterval(function () {
      if (seq >= 3) {
        clearInterval(iv);
        appendLine('--- ' + target + ' ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss', 'out-dim');
        return;
      }
      var t = (2 + Math.random() * 6).toFixed(1);
      appendLine('64 bytes from ' + target + ': icmp_seq=' + seq + ' ttl=59 time=' + t + ' ms', 'out-ok');
      seq++;
    }, 350);
  }

  function runTraceroute() {
    appendLine('traceroute to jefferson.dev', 'out-dim');
    var hops = [
      ' 1  isp-gateway (192.168.1.1)        1.021 ms',
      ' 2  core-router.pb (10.20.0.1)       4.512 ms',
      ' 3  backbone-ne.br (172.16.5.9)      8.774 ms',
      ' 4  ia-cluster.local (10.0.99.2)    12.303 ms',
      ' 5  jefferson.dev (203.0.113.42)    14.987 ms  ✔ destino alcançado'
    ];
    var i = 0;
    var iv = setInterval(function () {
      if (i >= hops.length) { clearInterval(iv); return; }
      appendLine(hops[i], i === hops.length - 1 ? 'out-ok' : 'out-dim');
      i++;
    }, 300);
  }

  function runNmap(target) {
    target = target || 'jefferson.dev';
    appendLine('Starting Nmap 7.94 ( https://nmap.org )', 'out-dim');
    var ports = [
      ['22/tcp', 'open', 'ssh', 'network engineer'],
      ['80/tcp', 'open', 'http', 'portfolio'],
      ['443/tcp', 'open', 'https', 'jspot.network'],
      ['3306/tcp', 'open', 'mysql', 'dados'],
      ['1812/udp', 'open', 'radius', 'freeradius + mikrotik'],
      ['8728/tcp', 'open', 'mikrotik-api', 'gerência de rede'],
      ['6443/tcp', 'filtered', 'ia-cluster', 'em treinamento']
    ];
    var i = -1;
    var iv = setInterval(function () {
      if (i < 0) {
        appendLine('Nmap scan report for ' + target + ' (203.0.113.42)', 'out-dim');
        appendLine('Host is up (0.014s latency).', 'out-dim');
        appendLine('', null);
        appendLine('PORT       STATE      SERVICE       INFO', 'out-dim');
        i++;
        return;
      }
      if (i >= ports.length) {
        clearInterval(iv);
        appendLine('', null);
        appendLine('Nmap done: 1 IP address (1 host up) scanned in 2.14 seconds', 'out-dim');
        return;
      }
      var p = ports[i];
      var cls = p[1] === 'open' ? 'out-ok' : 'out-warn';
      var line = p[0].padEnd(11, ' ') + p[1].padEnd(11, ' ') + p[2].padEnd(14, ' ') + p[3];
      appendLine(line, cls);
      i++;
    }, 280);
  }

  function handleCommand(raw) {
    var trimmed = raw.trim();
    if (!trimmed) return;
    appendCmdEcho(trimmed);
    cmdHistory.push(trimmed);
    cmdIndex = cmdHistory.length;

    var parts = trimmed.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var args = parts.slice(1);

    if (cmd === 'sudo' && args.join(' ').toLowerCase() === 'hire jefferson') {
      appendLine('[sudo] password for visitante: ********', 'out-dim');
      setTimeout(function () {
        appendLine('Permissão concedida. Redirecionando para contato...', 'out-ok');
        setTimeout(function () { scrollToSection('contato'); }, 500);
      }, 500);
      return;
    }
    if (cmd === 'ping') { runPing(args[0]); return; }
    if (cmd === 'traceroute' || cmd === 'tracert') { runTraceroute(); return; }
    if (cmd === 'nmap') { runNmap(args[0]); return; }
    if (cmd === 'cd') {
      var target = (args[0] || '').replace(/^~?\/*/, '').replace(/\/$/, '');
      if (SECTION_MAP[target]) {
        appendLine('→ navegando para #' + target, 'out-ok');
        scrollToSection(target);
      } else {
        appendLine('cd: no such file or directory: ' + (args[0] || ''), 'out-err');
      }
      return;
    }
    if (cmd === 'open') {
      var net = (args[0] || '').toLowerCase();
      var urls = {
        linkedin: 'https://www.linkedin.com/in/jefferson-byller-647464249/',
        github: 'https://github.com/JeffByller',
        instagram: 'https://www.instagram.com/jeffgsan/'
      };
      if (urls[net]) {
        appendLine('abrindo ' + net + '...', 'out-ok');
        window.open(urls[net], '_blank', 'noopener');
      } else {
        appendLine('open: rede desconhecida. tente: linkedin, github, instagram', 'out-err');
      }
      return;
    }
    if (COMMANDS[cmd]) { COMMANDS[cmd](); return; }

    appendLine('bash: ' + cmd + ': command not found. Digite \'help\' para ver os comandos.', 'out-err');
  }

  function runInitialCommand() {
    if (!termHistory) return;
    handleCommand('whoami');
  }

  if (termInput) {
    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var val = termInput.value;
        termInput.value = '';
        handleCommand(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdIndex > 0) { cmdIndex--; termInput.value = cmdHistory[cmdIndex] || ''; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (cmdIndex < cmdHistory.length - 1) { cmdIndex++; termInput.value = cmdHistory[cmdIndex] || ''; }
        else { cmdIndex = cmdHistory.length; termInput.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        var partial = termInput.value.toLowerCase();
        var all = Object.keys(COMMANDS).concat(['ping', 'traceroute', 'nmap', 'cd', 'open', 'sudo hire jefferson']);
        var match = all.find(function (c) { return c.indexOf(partial) === 0; });
        if (match) termInput.value = match;
      }
    });
  }

  document.querySelectorAll('.quick-cmds button[data-cmd]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      handleCommand(btn.getAttribute('data-cmd'));
      if (termInput) termInput.focus();
    });
  });

  var termBody = document.getElementById('termBodyInner');
  if (termBody) {
    termBody.addEventListener('click', function () {
      if (termInput && window.innerWidth > 900) termInput.focus();
    });
  }

  /* kick things off */
  playBoot();

})();
