const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about-us.html', label: 'About' },
  { href: '/services.html', label: 'Services' },
  { href: '/products.html', label: 'Products' },
  { href: '/blog.html', label: 'Blog' },
  { href: '/faq.html', label: 'FAQ' },
]

function currentPath() {
  const path = window.location.pathname.replace(/index\.html$/, '')
  return path.endsWith('/') ? path : path
}

function isActive(href) {
  const path = currentPath()
  if (href === '/') return path === '/' || path.endsWith('/zos-drop-shop/') || path.endsWith('/zos-drop-shop')
  return path.endsWith(href) || path.endsWith(href.replace('.html', ''))
}

export function mountChrome() {
  const header = document.querySelector('[data-header]')
  const footer = document.querySelector('[data-footer]')
  if (header) header.innerHTML = renderHeader()
  if (footer) footer.innerHTML = renderFooter()

  const toggle = document.querySelector('[data-nav-toggle]')
  const mobile = document.querySelector('[data-mobile-nav]')
  toggle?.addEventListener('click', () => {
    const open = mobile?.classList.toggle('open')
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
  })

  const searchToggle = document.querySelector('[data-search-toggle]')
  const searchPanel = document.querySelector('[data-search-panel]')
  searchToggle?.addEventListener('click', (e) => {
    e.stopPropagation()
    searchPanel?.classList.toggle('open')
  })
  document.addEventListener('click', (e) => {
    if (!searchPanel?.classList.contains('open')) return
    if (searchPanel.contains(e.target) || searchToggle?.contains(e.target)) return
    searchPanel.classList.remove('open')
  })

  const cartOpen = document.querySelectorAll('[data-cart-open]')
  const cartClose = document.querySelectorAll('[data-cart-close]')
  const drawer = document.querySelector('[data-cart]')
  cartOpen.forEach((el) => el.addEventListener('click', () => drawer?.classList.add('open')))
  cartClose.forEach((el) => el.addEventListener('click', () => drawer?.classList.remove('open')))

  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const track = slider.querySelector('[data-slider-track]')
    const prev = slider.querySelector('[data-slider-prev]')
    const next = slider.querySelector('[data-slider-next]')
    if (!track) return
    const step = () => Math.min(track.clientWidth * 0.8, 380)
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }))
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }))
  })

  initServicesPin()
  initLogoMarquee()
  initWhySection()
  initTestimonials()
  initBlogSection()
  initFooter()
  initMotion()
}

function initLogoMarquee() {
  const section = document.querySelector('[data-logo-marquee]')
  const merge = document.querySelector('[data-logo-merge]')
  const loop = document.querySelector('[data-logo-loop]')
  const lines = document.querySelectorAll('[data-logo-line]')
  if (!section || !merge) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduce) {
    merge.classList.add('is-visible')
    lines.forEach((line) => line.classList.add('is-visible'))
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        merge.classList.add('is-visible')
        lines.forEach((line) => line.classList.add('is-visible'))
        loop?.classList.add('is-running')
        io.unobserve(entry.target)
      })
    },
    { threshold: 0.35, rootMargin: '0px 0px -10% 0px' },
  )

  io.observe(section)
}

function initServicesPin() {
  const section = document.querySelector('[data-services-pin]')
  const frame = document.querySelector('[data-services-frame]')
  if (!section || !frame) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = () => window.matchMedia('(max-width: 991px)').matches
  const reveals = [...section.querySelectorAll('[data-services-reveal]')]
  const prev = section.querySelector('[data-services-prev]')
  const next = section.querySelector('[data-services-next]')
  let ticking = false

  const update = () => {
    ticking = false
    if (reduce || mobile()) {
      frame.style.transform = ''
      return
    }
    // Progress 0→1 while the pin section scrolls through the viewport.
    // At 0: cards 1–3. At 1: last card aligned to the left of the window.
    const rect = section.getBoundingClientRect()
    const height = section.offsetHeight || 1
    const progress = Math.min(1, Math.max(0, -rect.top / height))
    const items = frame.querySelectorAll('.services-item')
    const last = items[items.length - 1]
    const maxX = last ? Math.max(0, last.offsetLeft) : 0
    frame.style.transform = `translate3d(${-progress * maxX}px, 0, 0)`
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', update)

  if (reduce) {
    reveals.forEach((el) => el.classList.add('is-visible'))
  } else {
    const revealVisible = () => {
      reveals.forEach((el) => {
        if (el.classList.contains('is-visible')) return
        const r = el.getBoundingClientRect()
        const inView = r.bottom > 80 && r.top < window.innerHeight - 40 && r.right > 40 && r.left < window.innerWidth - 40
        if (inView) el.classList.add('is-visible')
      })
    }
    revealVisible()
    window.addEventListener('scroll', revealVisible, { passive: true })
    window.addEventListener('resize', revealVisible)
  }

  const step = () => {
    const item = section.querySelector('.services-item')
    return item ? item.getBoundingClientRect().width + 2 : Math.min(frame.clientWidth * 0.8, 400)
  }
  prev?.addEventListener('click', () => {
    frame.scrollBy({ left: -step(), behavior: 'smooth' })
  })
  next?.addEventListener('click', () => {
    frame.scrollBy({ left: step(), behavior: 'smooth' })
  })

  if (reduce || mobile()) return

  // Live IX2 a-27: mouse icon tracks pointer inside .item as -300%…300% of icon size
  frame.querySelectorAll('.services-card').forEach((card) => {
    const mouse = card.querySelector('.services-mouse')
    if (!mouse) return
    const item = card.closest('.services-item') || card

    item.addEventListener('pointerenter', () => card.classList.add('is-cursor'))
    item.addEventListener('pointerleave', () => {
      card.classList.remove('is-cursor')
      card.style.setProperty('--mx', '0%')
      card.style.setProperty('--my', '0%')
    })
    item.addEventListener('pointermove', (event) => {
      const rect = item.getBoundingClientRect()
      const px = rect.width ? (event.clientX - rect.left) / rect.width : 0.5
      const py = rect.height ? (event.clientY - rect.top) / rect.height : 0.5
      const mx = -300 + px * 600
      const my = -300 + py * 600
      card.style.setProperty('--mx', `${mx}%`)
      card.style.setProperty('--my', `${my}%`)
    })
  })
}

function initWhySection() {
  const section = document.querySelector('[data-why-section]')
  const heading = document.querySelector('[data-why-heading]')
  const rows = document.querySelectorAll('[data-why-row]')
  if (!section) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = () => window.matchMedia('(max-width: 991px)').matches

  if (reduce) {
    heading?.classList.add('is-visible')
    section.querySelectorAll('[data-why-card]').forEach((card) => {
      card.style.transform = ''
    })
    return
  }

  const headingIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        heading?.classList.add('is-visible')
        headingIo.unobserve(entry.target)
      })
    },
    { threshold: 0.4, rootMargin: '0px 0px -8% 0px' },
  )
  if (heading) headingIo.observe(heading)

  let ticking = false
  const update = () => {
    ticking = false
    if (mobile()) {
      section.querySelectorAll('[data-why-card]').forEach((card) => {
        card.style.transform = ''
      })
      return
    }

    const view = window.innerHeight || 1
    rows.forEach((row) => {
      const rect = row.getBoundingClientRect()
      const start = view * 0.92
      const end = view * 0.42
      const raw = (start - rect.top) / (start - end)
      const progress = Math.min(1, Math.max(0, raw))

      row.querySelectorAll('[data-why-card]').forEach((card) => {
        const from = Number(card.dataset.whyFrom || 0)
        const x = from * (1 - progress)
        card.style.transform = `translate3d(${x}px, 0, 0)`
      })
    })
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', update)
}

function initTestimonials() {
  const section = document.querySelector('[data-testimonials]')
  const heading = document.querySelector('[data-testimonials-heading]')
  const cards = [...document.querySelectorAll('[data-testimonial-card]')]
  if (!section || !cards.length) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = () => window.matchMedia('(max-width: 767px)').matches

  if (reduce) {
    heading?.classList.add('is-visible')
    cards.forEach((card) => {
      card.style.transform = ''
    })
    return
  }

  const headingIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        heading?.classList.add('is-visible')
        headingIo.unobserve(entry.target)
      })
    },
    { threshold: 0.4, rootMargin: '0px 0px -8% 0px' },
  )
  if (heading) headingIo.observe(heading)

  let ticking = false
  const update = () => {
    ticking = false
    if (mobile()) {
      cards.forEach((card) => {
        card.style.transform = ''
      })
      return
    }

    const stickyTop = window.matchMedia('(max-width: 991px)').matches ? 100 : 140

    cards.forEach((card) => {
      if (card.hasAttribute('data-testimonial-static')) {
        card.style.transform = ''
        return
      }

      const rect = card.getBoundingClientRect()
      const start = stickyTop + rect.height * 0.85
      const end = stickyTop
      const raw = (start - rect.top) / (start - end)
      const progress = Math.min(1, Math.max(0, raw))
      const scale = 0.8 + 0.2 * progress
      const ty = -11 * (1 - progress)
      card.style.transform = `translate3d(0, ${ty}%, 0) scale(${scale})`
    })
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', update)
}

function initBlogSection() {
  const section = document.querySelector('[data-blog-section]')
  const heading = document.querySelector('[data-blog-heading]')
  const cards = [...document.querySelectorAll('[data-blog-card]')]
  if (!section || !cards.length) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = () => window.matchMedia('(max-width: 767px)').matches

  if (reduce) {
    heading?.classList.add('is-visible')
    cards.forEach((card) => {
      card.style.transform = ''
    })
    return
  }

  const headingIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        heading?.classList.add('is-visible')
        headingIo.unobserve(entry.target)
      })
    },
    { threshold: 0.4, rootMargin: '0px 0px -8% 0px' },
  )
  if (heading) headingIo.observe(heading)

  let ticking = false
  const update = () => {
    ticking = false
    if (mobile()) {
      cards.forEach((card) => {
        card.style.transform = ''
      })
      return
    }

    const view = window.innerHeight || 1
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect()
      const start = view * 0.95
      const end = view * 0.55
      const raw = (start - rect.top) / (start - end)
      const progress = Math.min(1, Math.max(0, raw))
      const scale = 0.7 + 0.3 * progress

      if (card.hasAttribute('data-blog-side')) {
        const x = -766 * (1 - progress)
        card.style.transform = `translate3d(${x}px, 0, 0) scale(${scale})`
      } else {
        card.style.transform = `translate3d(0, 0, 0) scale(${scale})`
      }
    })
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', update)

  if (mobile()) return

  cards.forEach((card) => {
    const mouse = card.querySelector('.blog-mouse')
    if (!mouse) return

    card.addEventListener('pointerenter', () => card.classList.add('is-cursor'))
    card.addEventListener('pointerleave', () => card.classList.remove('is-cursor'))
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect()
      const x = event.clientX - rect.left - mouse.offsetWidth / 2
      const y = event.clientY - rect.top - mouse.offsetHeight / 2
      card.style.setProperty('--mx', `${x}px`)
      card.style.setProperty('--my', `${y}px`)
    })
  })
}

function initFooter() {
  const root = document.querySelector('[data-footer-root]')
  if (!root) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const els = [...root.querySelectorAll('[data-footer-reveal]')]

  const reveal = (el) => {
    el.classList.add('is-visible')
  }

  if (reduce) {
    els.forEach(reveal)
    return
  }

  // Do not inset the root from the bottom: the utility bar sits in the last
  // ~6% of the viewport at max scroll, so a negative bottom rootMargin left
  // those reveals permanently at opacity 0 (looked like a clipped footer).
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        reveal(entry.target)
        io.unobserve(entry.target)
      })
    },
    { threshold: 0, rootMargin: '0px 0px 12% 0px' },
  )

  els.forEach((el) => io.observe(el))

  const revealIfNearEnd = () => {
    const doc = document.documentElement
    const remaining = doc.scrollHeight - window.scrollY - window.innerHeight
    if (remaining > 160) return
    els.forEach((el) => {
      if (el.classList.contains('is-visible')) return
      reveal(el)
      io.unobserve(el)
    })
  }

  window.addEventListener('scroll', revealIfNearEnd, { passive: true })
  window.addEventListener('resize', revealIfNearEnd, { passive: true })
  revealIfNearEnd()
}

function playHeroEntrance() {
  const hero = document.querySelector('.hero')
  if (!hero) return

  const reduce =
    document.documentElement.classList.contains('reduced-motion') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const body = document.body
  const media = document.querySelector('.hero-video-wrapper')
  if (media) media.style.transform = ''

  // Clear finished state and force a clean pre-frame (no reverse tween)
  body.classList.add('hero-resetting')
  body.classList.remove('hero-in', 'hero-done')
  void hero.offsetWidth
  body.classList.remove('hero-resetting')
  void hero.offsetWidth

  if (reduce) {
    body.classList.add('hero-in', 'hero-done')
    return
  }

  const start = () => {
    // Re-trigger keyframes even if hero-in was already toggled this session
    body.classList.remove('hero-in')
    void hero.offsetWidth
    body.classList.add('hero-in')
    window.setTimeout(() => body.classList.add('hero-done'), 2600)
  }

  // Start after first paint of wiped state (don't wait on fonts — that hid the anim)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.setTimeout(start, 40)
    })
  })
}

function initMotion() {
  document.documentElement.classList.add('js-ready')

  playHeroEntrance()
  window.addEventListener('pageshow', (event) => {
    // Back/forward cache restores the finished page — replay entrance
    if (event.persisted) playHeroEntrance()
  })

  const reduce =
    document.documentElement.classList.contains('reduced-motion') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduce) {
    document.querySelectorAll('[data-reveal], [data-reveal-stagger] > *').forEach((el) => {
      el.classList.add('is-visible')
    })
    document.querySelector('[data-why-heading]')?.classList.add('is-visible')
    document.querySelector('[data-testimonials-heading]')?.classList.add('is-visible')
    document.querySelector('[data-blog-heading]')?.classList.add('is-visible')
    document.querySelectorAll('[data-footer-reveal]').forEach((el) => el.classList.add('is-visible'))
    initIntroSection(true)
    return
  }

  const revealEls = [...document.querySelectorAll('[data-reveal]')]
  document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
    ;[...group.children].forEach((el, i) => {
      el.style.setProperty('--delay', `${i * 90}ms`)
      revealEls.push(el)
    })
  })

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        io.unobserve(entry.target)
      })
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  )

  revealEls.forEach((el) => io.observe(el))

  // Soft parallax on hero video after entrance settles
  const hero = document.querySelector('.hero-shell')
  const media = document.querySelector('.hero-video-wrapper')
  if (hero && media) {
    window.addEventListener(
      'scroll',
      () => {
        if (!document.body.classList.contains('hero-done')) return
        const rect = hero.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) return
        const progress = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)))
        media.style.transform = `translate3d(0, ${progress * 28}px, 0)`
      },
      { passive: true },
    )
  }

  initIntroSection(reduce)
}

function initIntroSection(reduce) {
  const block = document.querySelector('.intro-block')
  const overlay = document.querySelector('.intro-overlay')
  const divider = document.querySelector('[data-intro-divider]')
  if (!block) return

  if (reduce) {
    if (overlay) overlay.style.transform = 'translate3d(0, 100%, 0)'
    divider?.classList.add('is-visible')
    return
  }

  const update = () => {
    const rect = block.getBoundingClientRect()
    const view = window.innerHeight || 1
    // Progress as section moves through viewport
    const start = view * 0.85
    const end = view * 0.15
    const raw = (start - rect.top) / (start - end)
    const progress = Math.min(1, Math.max(0, raw))

    if (overlay) {
      overlay.style.transform = `translate3d(0, ${progress * 100}%, 0)`
    }
    if (divider && progress > 0.55) {
      divider.classList.add('is-visible')
    }
  }

  update()
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
}

function renderHeader() {
  const links = NAV_LINKS.map(
    (l) => `
      <li class="nav-list">
        <div class="nav-icon-and-text-wrapper">
          <a href="${l.href}" class="nav-link ${isActive(l.href) ? 'is-active' : ''}">${l.label}</a>
          <div class="nav-border" aria-hidden="true"></div>
        </div>
      </li>`,
  ).join('')

  const mobileLinks = NAV_LINKS.map(
    (l) => `<a href="${l.href}" class="${isActive(l.href) ? 'is-active' : ''}">${l.label}</a>`,
  ).join('')

  return `
    <header class="site-header">
      <div class="navbar" role="banner">
        <div class="container">
          <div class="navbar-wrapper">
            <a class="site-logo-wrapper" href="/" aria-label="home">
              <img class="site-logo" src="/images/zos-drop-shop-logo.png" width="160" height="99" alt="ZOS Drop Shop" />
            </a>

            <nav class="nav-menu-wrapper" aria-label="Primary">
              <ul class="nav-menu">${links}</ul>
            </nav>

            <div class="navbar-right">
              <div class="navbar-icons">
                <button class="navbar-icons-btn" type="button" aria-label="Search" data-search-toggle>
                  <img class="navbar-icons-svg" src="/images/icons/search.svg" alt="" width="24" height="24" />
                </button>
                <div class="search-panel" data-search-panel>
                  <form action="#" onsubmit="event.preventDefault()">
                    <input type="search" name="query" placeholder="Search…" aria-label="Search" />
                  </form>
                </div>
                <button class="navbar-icons-btn" type="button" aria-label="Open cart" data-cart-open>
                  <img class="navbar-icons-svg" src="/images/icons/cart.svg" alt="" width="24" height="24" />
                  <span class="cart-qty">0</span>
                </button>
              </div>
              <a class="nav-contact" href="/contact-us.html">
                <span>Talk to us</span>
                <span class="arrow">east</span>
              </a>
              <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-nav-toggle>
                <span class="material-icons">menu</span>
              </button>
            </div>
          </div>
        </div>
        <div class="mobile-nav" data-mobile-nav>
          ${mobileLinks}
          <a class="nav-contact" href="/contact-us.html"><span>Talk to us</span><span class="arrow">east</span></a>
        </div>
      </div>
    </header>
    <div class="cart-drawer" data-cart>
      <div class="cart-backdrop" data-cart-close></div>
      <aside class="cart-panel" aria-label="Cart">
        <h2>Your Bag</h2>
        <p class="cart-empty">Nothing in here yet.</p>
        <a class="btn btn-primary" href="/checkout.html">Head to Checkout</a>
      </aside>
    </div>
  `
}

function renderFooter() {
  const year = new Date().getFullYear()
  return `
    <footer class="site-footer" data-footer-root>
      <div class="footer-container">
        <div class="footer-wrapper">
          <div class="newsletter-block">
            <div class="footer-newsletter-title" data-footer-reveal="left">
              Get Shop Notes, Seasonal Deals, and Maintenance Reminders
            </div>
            <form
              class="footer-form-block"
              data-footer-reveal="right"
              onsubmit="event.preventDefault(); this.reset(); alert('Thanks for joining the list—we will be in touch!');"
            >
              <label class="visually-hidden" for="footer-subscribe">Email for shop updates</label>
              <input
                class="subscribe-input"
                id="footer-subscribe"
                type="email"
                name="email"
                placeholder="you@email.com"
                required
                autocomplete="email"
              />
              <button class="subscribe-button" type="submit" aria-label="Subscribe"></button>
            </form>
          </div>
        </div>

        <div class="footer-logo">
          <a class="get-in-touch-button" href="/contact-us.html" data-footer-reveal="up">
            <span>Say Hello</span>
            <span class="footer-touch-icon material-icons" aria-hidden="true">call_made</span>
          </a>
          <div class="logo-wrap">
            <img
              class="footer-wordmark"
              src="/images/footer/wordmark.png"
              alt="ZOS Drop Shop"
              width="1238"
              height="200"
              loading="lazy"
              data-footer-reveal="logo"
            />
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-wrapper">
          <div class="footer-bottom-list" data-footer-reveal="up">
            <a class="footer-link footer-link-home" href="/" aria-label="Home">
              <img class="footer-home-icon" src="/images/footer/home.svg" alt="" width="24" height="24" />
            </a>
            <a class="footer-link" href="/about-us.html">About</a>
            <a class="footer-link" href="/faq.html">FAQ</a>
            <a class="footer-link" href="/checkout.html">Checkout</a>
            <a class="footer-link" href="/404.html">404</a>
          </div>
          <div class="footer-copyright" data-footer-reveal="up">
            <span class="footer-copyright-text">© ${year} ZOS Drop Shop. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  `
}

document.addEventListener('DOMContentLoaded', mountChrome)
