/*==================== MENU SHOW Y HIDDEN ====================*/
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close')


/*===== MENU SHOW =====*/
/* Validate if constant exists */
if(navToggle){
    navToggle.addEventListener('click', () =>{
        navMenu.classList.add('show-menu')
    })
    navToggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            navMenu.classList.add('show-menu')
        }
    })
}

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if(navClose){
    navClose.addEventListener('click', () =>{
        navMenu.classList.remove('show-menu')
    })
    navClose.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            navMenu.classList.remove('show-menu')
        }
    })
}

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function pulseBodyClass(className, duration = 420){
    if(prefersReducedMotion) return
    document.body.classList.add(className)
    window.setTimeout(() => {
        document.body.classList.remove(className)
    }, duration)
}

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    if (navMenu) {
        navMenu.classList.remove('show-menu')
    }
}
navLink.forEach((n) => {
    n.addEventListener('click', linkAction)
    n.addEventListener('click', () => pulseBodyClass('is-section-transitioning', 460))
})

/*==================== ACCORDION SKILLS ====================*/
const skillsContent = document.getElementsByClassName('skills__content'),
      skillsHeader = document.querySelectorAll('.skills__header')

function resolveSkillTheme(skillBlock){
    const title = skillBlock.querySelector('.skills__title')?.textContent?.toLowerCase() || ''
    if(title.includes('devops') || title.includes('gitops') || title.includes('version control')){
        return 'devops'
    }
    if(title.includes('cloud') || title.includes('computing') || title.includes('backend') || title.includes('programming')){
        return 'k3s'
    }
    if(title.includes('analytics') || title.includes('visualization') || title.includes('engineering') || title.includes('etl')){
        return 'data'
    }
    return 'ai'
}

Array.from(skillsContent).forEach((block) => {
    block.setAttribute('data-skill-theme', resolveSkillTheme(block))
})

function toggleSkills(){
    let itemClass = this.parentNode.className
    const nextIsOpen = itemClass === 'skills__content skills__close'
    
    for(let i = 0; i < skillsContent.length; i++){
        skillsContent[i].className = 'skills__content skills__close'
        skillsContent[i].classList.remove('skills__content--pulse')
    }
    if(nextIsOpen){
        this.parentNode.className = 'skills__content skills__open'
        if(!prefersReducedMotion){
            this.parentNode.classList.add('skills__content--pulse')
        }
        const theme = this.parentNode.getAttribute('data-skill-theme') || 'ai'
        document.body.classList.remove('skills-theme-ai', 'skills-theme-devops', 'skills-theme-k3s', 'skills-theme-data')
        document.body.classList.add(`skills-theme-${theme}`)
        pulseBodyClass('is-skills-toggling')
    }
}

skillsHeader.forEach((el) => {
    el.addEventListener('click', toggleSkills)
    el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggleSkills.call(el)
        }
    })
})

/*==================== QUALIFICATION TABS ====================*/
const tabs = document.querySelectorAll('[data-target]'),
tabContents = document.querySelectorAll('[data-content]')

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.target)
        if (!target) return
        
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('qualification__active')
        })
        target.classList.add('qualification__active')
        
        tabs.forEach(tab => {
            tab.classList.remove('qualification__active')
        })
        tab.classList.add('qualification__active')
    })
})

/*==================== PORTFOLIO SWIPER  ====================*/
if (document.querySelector('.portfolio__container')) {
    const swiperPortfolioConfig = {
        effect: 'coverflow',
        loop: true,
        centeredSlides: true,
        slidesPerView: 1.05,
        speed: 700,
        grabCursor: true,
        coverflowEffect: {
          rotate: 12,
          stretch: 0,
          depth: 120,
          modifier: 1.1,
          slideShadows: false
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          768: {
            slidesPerView: 1.4
          },
          1024: {
            slidesPerView: 1.9
          }
        }
    }
    if (!prefersReducedMotion) {
        swiperPortfolioConfig.autoplay = {
          delay: 3600,
          disableOnInteraction: false
        }
    }
    let swiperPortfolio = new Swiper('.portfolio__container', {
        ...swiperPortfolioConfig
    })
}


/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

function scrollActive(){
    const scrollY = window.pageYOffset

    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight
        const sectionTop = current.offsetTop - 50;
        const sectionId = current.getAttribute('id')
        const navLink = document.querySelector('.nav__menu a[href*=' + sectionId + ']')
        if (!navLink) return

        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
            navLink.classList.add('active-link')
        }else{
            navLink.classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive, { passive: true })

// Typewriter Animation
const roles = [ 
    '🔎 Gen AI Developer 📑',
    '💻 Machine Learning Engineer🦾',
    '🤖 AI Engineer 🧠'
];

let roleIndex = 0, charIndex = 0, isDeleting = false;
const typingSpeed = 100, erasingSpeed = 50, delayBetweenRoles = 1500;

function typeText() {
    const typingText = document.getElementById("typing-text");
    if (!typingText) return;

    if (!isDeleting && charIndex <= roles[roleIndex].length) {
        typingText.innerHTML = roles[roleIndex].substring(0, charIndex++);
        setTimeout(typeText, typingSpeed);
    } else if (isDeleting && charIndex >= 0) {
        typingText.innerHTML = roles[roleIndex].substring(0, charIndex--);
        setTimeout(typeText, erasingSpeed);
    } else {
        isDeleting = !isDeleting;
        if (!isDeleting) roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeText, delayBetweenRoles);
    }
}

if (prefersReducedMotion) {
    const typingText = document.getElementById("typing-text");
    if (typingText) {
        typingText.textContent = 'Machine Learning Engineer';
    }
} else {
    setTimeout(typeText, 700);
}




/*==================== CHANGE BACKGROUND HEADER ====================*/ 
function scrollHeader(){
    const nav = document.getElementById('header');
    if (!nav) return
    if(window.scrollY >= 80) nav.classList.add('scroll-header'); else nav.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader, { passive: true })

/*==================== SHOW SCROLL TOP ====================*/ 
function scrollTop(){
    let scrollTop = document.getElementById('scroll-top');
    if (!scrollTop) return
    // When the scroll is higher than 560 viewport height, add the show-scroll class to the a tag with the scroll-top class
    if(window.scrollY >= 200) scrollTop.classList.add('show-scroll'); else scrollTop.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollTop, { passive: true })

/*==================== DARK LIGHT THEME ====================*/ 
const themeButton = document.getElementById('theme-button');
const darkTheme = 'dark-theme';
const iconTheme = 'uil-sun';

// Retrieve saved theme settings
const selectedTheme = localStorage.getItem('selected-theme');
const selectedIcon = localStorage.getItem('selected-icon');

// Function to get the current theme and icon state
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
const getCurrentIcon = () => themeButton && themeButton.classList.contains(iconTheme) ? 'uil-moon' : 'uil-sun';

// Apply saved theme on page load
if (selectedTheme) {
    document.body.classList.toggle(darkTheme, selectedTheme === 'dark');
    if (themeButton) {
        themeButton.classList.toggle(iconTheme, selectedIcon === 'uil-moon');
    }
}

// Toggle theme on button click
if (themeButton) {
    themeButton.addEventListener('click', () => {
        document.body.classList.toggle(darkTheme);
        themeButton.classList.toggle(iconTheme);

        // Save theme and icon state
        localStorage.setItem('selected-theme', getCurrentTheme());
        localStorage.setItem('selected-icon', getCurrentIcon());
    });  // ✅ Correctly closed
    themeButton.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            themeButton.click()
        }
    })
}
