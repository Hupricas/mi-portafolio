(() => {
  'use strict';

  const data = window.PORTAFOLIO || {};
  const perfil = data.perfil || {};
  const proyectos = Array.isArray(data.proyectos) ? data.proyectos : [];
  const certificados = Array.isArray(data.certificados) ? data.certificados : [];
  const habilidades = Array.isArray(data.habilidades) ? data.habilidades : [];
  const proyectoDestacado = proyectos.find(p => p && p.destacado) || proyectos[0] || null;
  const $ = id => document.getElementById(id);
  const text = (el, value) => { if (el) el.textContent = value ?? ''; return el; };
  const make = (tag, className, content) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content !== undefined) el.textContent = content;
    return el;
  };

  function urlSegura(valor) {
    if (typeof valor !== 'string' || !valor.trim()) return '';
    const url = valor.trim();
    if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+/i.test(url)) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (!url.startsWith('/') && !url.includes('..') && /^[\wÀ-ÿ.\/%()\- ?=&:#]+$/i.test(url)) return url;
    return '';
  }

  const correoTotem = 'hugo03pricas@gmail.com';
  const asuntoTotem = 'Solicitud de acceso a la prueba cerrada de TOTEM';
  const cuerpoTotem = 'Hola Hugo,\n\nMe gustaría solicitar acceso a la prueba cerrada de TOTEM.\n\nGracias.';

  function abrirOpcionesCorreo() {
    let modal = $('correo-totem-modal');
    if (!modal) {
      modal = make('div', 'email-choice-backdrop');
      modal.id = 'correo-totem-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'correo-totem-titulo');
      modal.hidden = true;
      const box = make('div', 'email-choice-box');
      const close = make('button', 'email-choice-close', '×');
      close.type = 'button';
      close.setAttribute('aria-label', 'Cerrar opciones de correo');
      close.addEventListener('click', () => { modal.hidden = true; });
      const title = make('h2', '', 'Solicitar acceso a TOTEM');
      title.id = 'correo-totem-titulo';
      const intro = make('p', '', 'Elige cómo quieres redactar la solicitud. No necesitas tener un programa de correo instalado.');
      const opts = make('div', 'email-choice-options');
      const gmail = enlace('Redactar en Gmail ↗', 'https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(correoTotem)+'&su='+encodeURIComponent(asuntoTotem)+'&body='+encodeURIComponent(cuerpoTotem), 'email-choice-link');
      const outlook = enlace('Redactar en Outlook ↗', 'https://outlook.live.com/mail/0/deeplink/compose?to='+encodeURIComponent(correoTotem)+'&subject='+encodeURIComponent(asuntoTotem)+'&body='+encodeURIComponent(cuerpoTotem), 'email-choice-link');
      const app = make('a', 'email-choice-link', 'Usar mi aplicación de correo ↗');
      app.href = 'mailto:'+correoTotem+'?subject='+encodeURIComponent(asuntoTotem)+'&body='+encodeURIComponent(cuerpoTotem);
      const copy = make('button', 'email-choice-link', 'Copiar dirección de correo');
      copy.type = 'button';
      copy.addEventListener('click', async () => {
        try {
          if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard no disponible');
          await navigator.clipboard.writeText(correoTotem);
          mostrarToast('Dirección copiada: '+correoTotem);
        } catch (_) {
          mostrarToast('Dirección para copiar: '+correoTotem);
        }
      });
      opts.append(gmail, outlook, app, copy);
      box.append(close, title, intro, opts, make('p', 'email-choice-address', correoTotem));
      modal.append(box);
      modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) modal.hidden = true; });
      document.body.append(modal);
    }
    modal.hidden = false;
    modal.querySelector('.email-choice-close').focus();
  }

  function enlace(label, url, clase) {
    const href = urlSegura(url);
    if (!href) return null;
    if (href.startsWith('mailto:') && href.toLowerCase().includes(correoTotem)) {
      const b = make('button', clase || '', label);
      b.type = 'button';
      b.addEventListener('click', abrirOpcionesCorreo);
      return b;
    }
    const a = make('a', clase || '', label);
    a.href = href;
    if (!href.startsWith('mailto:')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    return a;
  }

  function mostrarToast(mensaje) {
    let toast = document.querySelector('.site-toast');
    if (!toast) {
      toast = make('div', 'site-toast');
      document.body.append(toast);
    }
    toast.textContent = mensaje;
    toast.classList.add('show');
    window.clearTimeout(mostrarToast.timer);
    mostrarToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function ensureLightbox() {
    let lightbox = $('project-lightbox');
    if (lightbox) return lightbox;
    lightbox = make('div', 'project-lightbox hidden');
    lightbox.id = 'project-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    const frame = make('div', 'lightbox-frame');
    const close = make('button', 'lightbox-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Cerrar imagen ampliada');
    const img = make('img', 'lightbox-image');
    img.alt = '';
    const caption = make('p', 'lightbox-caption');
    frame.append(close, img, caption);
    lightbox.append(frame);
    document.body.append(lightbox);

    const cerrar = () => {
      lightbox.classList.add('hidden');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
    };
    close.addEventListener('click', cerrar);
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) cerrar();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) cerrar();
    });
    return lightbox;
  }

  function abrirLightbox(src, alt) {
    const lightbox = ensureLightbox();
    const img = lightbox.querySelector('.lightbox-image');
    const caption = lightbox.querySelector('.lightbox-caption');
    img.src = src;
    img.alt = alt || 'Captura ampliada';
    caption.textContent = alt || '';
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  }

  function inicializarHeroSpotlight() {
    const wrap = $('hero-featured-project');
    if (!wrap || !proyectoDestacado) return;
    const imageSrc = urlSegura(proyectoDestacado.imagen || (Array.isArray(proyectoDestacado.galeria) ? proyectoDestacado.galeria[0] : ''));
    wrap.replaceChildren();
    wrap.classList.add('reveal');

    const copy = make('div', 'hero-spotlight-copy');
    copy.append(
      make('span', 'hero-spotlight-kicker', 'PROYECTO DESTACADO'),
      make('h3', 'hero-spotlight-title', proyectoDestacado.titulo || 'Proyecto destacado'),
      make('p', 'hero-spotlight-text', 'Descubre mi videojuego para Android con batallas por turnos, colección de tótems y estética pixel art.')
    );
    const actions = make('div', 'hero-spotlight-actions');
    const verProyecto = make('a', 'button button-primary', 'Ver TOTEM ↗');
    verProyecto.href = '#proyectos';
    const verCapturas = make('button', 'button button-secondary');
    verCapturas.type = 'button';
    verCapturas.textContent = 'Abrir captura ↗';
    if (imageSrc) {
      verCapturas.addEventListener('click', () => abrirLightbox(imageSrc, 'Captura principal de ' + (proyectoDestacado.titulo || 'TOTEM')));
    }
    actions.append(verProyecto, verCapturas);
    copy.append(actions);

    const visual = make('button', 'hero-spotlight-visual');
    visual.type = 'button';
    if (imageSrc) {
      const img = make('img');
      img.src = imageSrc;
      img.alt = 'Imagen destacada de ' + (proyectoDestacado.titulo || 'TOTEM');
      img.loading = 'lazy';
      visual.append(img);
      visual.addEventListener('click', () => abrirLightbox(imageSrc, img.alt));
    } else {
      visual.append(make('span', 'preview-glyph', '</>'));
    }

    wrap.append(copy, visual);
  }

  function emptyState(icon, title, description) {
    const wrap = make('div', 'empty-state reveal in-view');
    wrap.append(make('div', 'empty-icon', icon), make('h3', '', title), make('p', '', description));
    return wrap;
  }

  function categorizarCertificado(cert) {
    const t = `${cert.titulo || ''} ${cert.descripcion || ''}`.toLowerCase();
    if (/(python|php|javascript|java|sql|programaci|prompt|copilot|notebooklm|ia)/.test(t)) return 'Programación e IA';
    if (/(android|móvil|mobile)/.test(t)) return 'Desarrollo móvil';
    if (/(excel|ofimática|gráficos|funciones)/.test(t)) return 'Ofimática';
    if (/(redes|tcp\/ip)/.test(t)) return 'Redes';
    if (/(liderazgo|equipo|igualdad|feedback|tiempo)/.test(t)) return 'Habilidades profesionales';
    return 'Otros';
  }

  function extraerHoras() {
    return certificados.reduce((total, cert) => {
      const texto = `${cert.descripcion || ''} ${cert.titulo || ''}`;
      const m = texto.match(/(\d+)\s*hora/i);
      return total + (m ? Number(m[1]) : 0);
    }, 0);
  }

  function inicializarPerfil() {
    const nombre = perfil.nombre || 'Tu nombre';
    const titular = perfil.titular || 'Transformando ideas en aplicaciones.';
    const titulo = $('hero-title');
    text($('brand-name'), '');
    $('brand-name').append(document.createTextNode(nombre), make('span', 'brand-period', '.'));
    text($('hero-name-panel'), nombre);
    text($('hero-role-panel'), perfil.cargo || 'Desarrollo de aplicaciones');
    text($('hero-description'), perfil.presentacion || 'Proyectos, conocimientos y certificados en un solo lugar.');
    text($('hero-location'), perfil.ubicacion || '');
    text($('about-text'), perfil.sobreMi || 'Este portafolio reúne mis proyectos y certificados.');
    text($('footer-brand'), nombre + '.');
    text($('year'), new Date().getFullYear());
    document.title = `${nombre} | Portafolio`;

    titulo.replaceChildren();
    const partes = titular.split(/(soluciones digitales\.?|aplicaciones\.?|con código\.?)/i).filter(Boolean);
    if (partes.length >= 2) {
      titulo.append(document.createTextNode(partes[0].trim() + ' '), make('em', '', partes[1].trim()));
    } else {
      text(titulo, titular);
    }

    const nav = $('main-nav');
    const menu = document.querySelector('.menu-toggle');
    if (menu && nav) {
      menu.addEventListener('click', () => {
        const abierto = nav.classList.toggle('open');
        menu.setAttribute('aria-expanded', String(abierto));
        menu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      });
      nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      }));
    }

    const skills = $('skill-list');
    habilidades.filter(x => typeof x === 'string' && x.trim()).forEach(x => skills.append(make('span', 'skill', x)));
    if (!skills.childElementCount) skills.append(make('p', 'muted', 'Próximamente añadiré más tecnologías.'));

    text($('code-cert-count'), certificados.length);
    text($('code-skill-count'), habilidades.length);

    const actions = $('contact-actions');
    if (!actions) return;
    if (perfil.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email)) {
      const a = make('a', 'button button-primary', 'Escríbeme ↗');
      a.href = 'mailto:' + perfil.email;
      actions.append(a);
    }
    const github = enlace('Mi GitHub ↗', perfil.github, 'button button-secondary');
    const linkedin = enlace('LinkedIn ↗', perfil.linkedin, 'button button-secondary');
    const cv = enlace('Descargar CV ↗', perfil.cv, 'button button-secondary');
    if (github) actions.append(github);
    if (linkedin) actions.append(linkedin);
    if (cv) actions.append(cv);
    if (!actions.childElementCount) {
      const a = make('a', 'button button-primary', 'Ver certificados ↘');
      a.href = '#certificados';
      actions.append(a);
    }
  }

  function inicializarEstadisticas() {
    text($('stat-certificados'), certificados.length);
    $('stat-certificados')?.setAttribute('data-target', certificados.length);
    text($('stat-horas'), extraerHoras());
    $('stat-horas')?.setAttribute('data-target', extraerHoras());
    text($('stat-skills'), habilidades.length);
    $('stat-skills')?.setAttribute('data-target', habilidades.length);
    text($('stat-proyectos'), proyectos.length);
    $('stat-proyectos')?.setAttribute('data-target', proyectos.length);
  }

  function animarContadores() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.getAttribute('data-target') || el.textContent || 0);
        const duration = 1200;
        const start = performance.now();
        const from = 0;
        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(from + (target - from) * eased);
          el.textContent = value;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.45 });
    counters.forEach(counter => observer.observe(counter));
  }

  function mostrarProyectos(filtro = 'Todos') {
    const out = $('project-list');
    if (!out) return;
    out.replaceChildren();
    const items = filtro === 'Todos' ? proyectos : proyectos.filter(p => p.categoria === filtro);
    if (!items.length) {
      out.append(emptyState('⌘', proyectos.length ? 'No hay proyectos en esta categoría' : 'Próximamente, mis proyectos', proyectos.length ? 'Prueba con otro filtro para ver más resultados.' : 'Aquí aparecerán mis aplicaciones y proyectos personales con enlaces a GitHub y capturas.'));
      return;
    }

    items.forEach((p, i) => {
      const featured = !!p.destacado;
      const card = make('article', 'project-card reveal' + (featured ? ' featured-project' : '') + (p.modoImagen === 'icono' ? ' prototype-project' : ''));
      const preview = make('div', 'project-preview' + (p.modoImagen === 'icono' ? ' preview-icon-card' : ''));
      const imagenPrincipal = urlSegura(p.imagen || (Array.isArray(p.galeria) ? p.galeria[0] : ''));
      let previewImage = null;

      if (imagenPrincipal) {
        const img = make('img');
        img.src = imagenPrincipal;
        img.loading = 'lazy';
        img.alt = 'Vista principal de ' + (p.titulo || 'proyecto');
        img.onerror = () => {
          img.remove();
          preview.append(make('span', 'preview-glyph', i % 2 === 0 ? '</>' : '{ }'));
          preview.classList.remove('has-image');
        };
        preview.append(img);
        preview.classList.add('has-image');
        previewImage = img;
      } else {
        preview.append(make('span', 'preview-glyph', i % 2 === 0 ? '</>' : '{ }'));
      }

      if (featured) preview.append(make('span', 'project-featured-badge', 'PROYECTO DESTACADO'));
      preview.append(make('span', 'project-kind', p.categoria || 'Proyecto'));
      const zoomable = !!previewImage && (featured || (Array.isArray(p.galeria) && p.galeria.length));
      if (zoomable) {
        const zoom = make('button', 'preview-zoom', 'Ver en grande');
        zoom.type = 'button';
        zoom.addEventListener('click', event => {
          event.stopPropagation();
          abrirLightbox(previewImage.src, previewImage.alt);
        });
        preview.append(zoom);
        preview.addEventListener('click', () => abrirLightbox(previewImage.src, previewImage.alt));
      }

      const body = make('div', 'project-body');
      body.append(make('h3', '', p.titulo || 'Proyecto sin título'), make('p', '', p.descripcion || ''));

      const tags = make('div', 'pill-row');
      (Array.isArray(p.tecnologias) ? p.tecnologias : []).forEach(t => tags.append(make('span', 'pill', t)));
      if (tags.childElementCount) body.append(tags);

      if (Array.isArray(p.galeria) && p.galeria.length) {
        const galleryWrap = make('div', 'project-gallery-wrap');
        galleryWrap.append(make('p', 'project-gallery-title', 'Galería de capturas'));
        galleryWrap.append(make('p', 'project-gallery-hint', 'Pulsa las miniaturas para cambiar la vista principal y usa “Ver en grande” para abrir la captura.'));
        const gallery = make('div', 'project-gallery');

        p.galeria.forEach((src, index) => {
          const safeSrc = urlSegura(src);
          if (!safeSrc) return;
          const button = make('button', 'project-thumb' + (index === 0 ? ' active' : ''));
          button.type = 'button';
          button.setAttribute('aria-label', 'Mostrar captura ' + (index + 1) + ' de ' + (p.titulo || 'proyecto'));
          const img = make('img');
          img.src = safeSrc;
          img.loading = 'lazy';
          img.alt = 'Captura ' + (index + 1) + ' de ' + (p.titulo || 'proyecto');
          button.append(img);
          button.addEventListener('click', () => {
            gallery.querySelectorAll('.project-thumb').forEach(t => t.classList.remove('active'));
            button.classList.add('active');
            if (previewImage) previewImage.src = safeSrc;
          });
          gallery.append(button);
        });

        if (gallery.childElementCount) {
          galleryWrap.append(gallery);
          body.append(galleryWrap);
        }
      }

      const links = make('div', 'project-links');
      if (Array.isArray(p.enlaces) && p.enlaces.length) {
        p.enlaces.forEach(link => {
          const a = enlace(link.texto || 'Abrir ↗', link.url, link.clase || '');
          if (a) links.append(a);
        });
      } else {
        const github = enlace('Ver código ↗', p.github);
        const demo = enlace('Ver aplicación ↗', p.demo);
        if (github) links.append(github);
        if (demo) links.append(demo);
      }
      if (links.childElementCount) body.append(links);
      if (Array.isArray(p.enlaces) && p.enlaces.some(link => link.url && link.url.endsWith('.apk'))) {
        body.append(make('p', 'project-apk-note', 'Versión experimental (APK debug). Instalación manual en Android; no es una versión de tienda.'));
      }

      if (Array.isArray(p.enlaces) && p.enlaces.some(link => typeof link.url === 'string' && link.url.startsWith('mailto:'))) {
        body.append(make('p', 'project-mail-hint', 'Puedes elegir Gmail, Outlook o copiar la dirección sin configurar un programa de correo.')); 
      }

      card.append(preview, body);
      out.append(card);
    });

    activarRevelado();
  }

  function inicializarProyectos() {
    const filtros = $('project-filters');
    if (!filtros) return;
    const categorias = [...new Set(proyectos.map(p => p.categoria).filter(Boolean))];
    if (categorias.length < 2) return mostrarProyectos();
    ['Todos', ...categorias].forEach(cat => {
      const b = make('button', 'filter' + (cat === 'Todos' ? ' active' : ''), cat);
      b.type = 'button';
      b.addEventListener('click', () => {
        filtros.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        mostrarProyectos(cat);
      });
      filtros.append(b);
    });
    mostrarProyectos();
  }

  function inicializarCertificados() {
    const out = $('certificate-list');
    const search = $('cert-search');
    const filtersWrap = $('cert-filters');
    const summary = $('cert-summary-text');
    if (!out || !search || !filtersWrap || !summary) return;

    if (!certificados.length) {
      out.append(emptyState('✦', 'Próximamente, mis certificados', 'Aquí se mostrarán las acreditaciones y formaciones que vaya incorporando.'));
      return;
    }

    const enriquecidos = certificados.map(cert => ({ ...cert, categoria: categorizarCertificado(cert) }));
    const categorias = ['Todos', ...new Set(enriquecidos.map(c => c.categoria))];
    let filtroActivo = 'Todos';
    let textoBusqueda = '';

    categorias.forEach(cat => {
      const chip = make('button', 'chip' + (cat === 'Todos' ? ' active' : ''), cat);
      chip.type = 'button';
      chip.addEventListener('click', () => {
        filtroActivo = cat;
        filtersWrap.querySelectorAll('.chip').forEach(el => el.classList.remove('active'));
        chip.classList.add('active');
        render();
      });
      filtersWrap.append(chip);
    });

    search.addEventListener('input', () => {
      textoBusqueda = search.value.trim().toLowerCase();
      render();
    });

    function render() {
      out.replaceChildren();
      let items = enriquecidos.slice();
      if (filtroActivo !== 'Todos') items = items.filter(c => c.categoria === filtroActivo);
      if (textoBusqueda) {
        items = items.filter(c => (`${c.titulo} ${c.entidad} ${c.descripcion} ${c.categoria}`).toLowerCase().includes(textoBusqueda));
      }

      summary.textContent = items.length
        ? `Mostrando ${items.length} certificado${items.length !== 1 ? 's' : ''}${filtroActivo !== 'Todos' ? ` en ${filtroActivo}` : ''}${textoBusqueda ? ` para “${search.value.trim()}”` : ''}.`
        : 'No hay certificados que coincidan con la búsqueda o el filtro seleccionado.';

      if (!items.length) {
        out.append(emptyState('🔎', 'Sin resultados', 'Prueba con otra palabra clave o selecciona una categoría diferente.'));
        return;
      }

      items.forEach(cert => {
        const card = make('article', 'certificate-card reveal');
        const top = make('div', 'certificate-top');
        top.append(make('span', 'cert-mark', '✦'), make('span', 'cert-date', cert.fecha || ''));

        const title = make('h3', '', cert.titulo || 'Certificado');
        const issuer = make('p', 'issuer', cert.entidad || '');
        const description = make('p', 'cert-description', cert.descripcion || '');
        const links = make('div', 'certificate-links');
        const ver = enlace(cert.entidad === 'OpenWebinars' ? 'Verificar certificado ↗' : 'Ver certificado PDF ↗', cert.archivo, 'cert-primary-link');
        if (ver) links.append(ver);
        links.append(make('span', 'pill cert-category', cert.categoria));
        

        // Miniatura auténtica del PDF, con texto alternativo accesible.
        if (cert.imagen) {
          const visual = make('div', 'certificate-preview');
          const image = make('img');
          image.src = urlSegura(cert.imagen);
          image.alt = 'Vista previa del certificado: ' + (cert.titulo || 'Certificado');
          image.loading = 'lazy';
          image.decoding = 'async';
          visual.append(image);
          const badge = make('span', 'preview-label', 'VISTA PREVIA');
          visual.append(badge);
          card.append(visual);
        }
        card.append(top, title, issuer, description, links);
        out.append(card);
      });

      activarRevelado();
    }

    render();
  }

  function activarRevelado() {
    const nodes = document.querySelectorAll('.reveal:not(.observed), .stat-card:not(.observed), .project-card:not(.observed), .certificate-card:not(.observed), .section-header:not(.observed), .about-card:not(.observed), .skills-panel:not(.observed), .contact-box:not(.observed), .certificate-tools:not(.observed), .certificate-summary:not(.observed), .hero-copy:not(.observed), .hero-panel:not(.observed)');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    nodes.forEach(node => {
      node.classList.add('observed');
      observer.observe(node);
    });
  }

  inicializarPerfil();
  inicializarEstadisticas();
  inicializarHeroSpotlight();
  inicializarProyectos();
  inicializarCertificados();
  ensureLightbox();
  activarRevelado();
  animarContadores();
})();
