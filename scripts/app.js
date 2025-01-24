class App {
   constructor() {
      this.route()
   }

   async route() {
      this.hideModal()
      state.currentAccount = await dbCtx.account.current()
      state.currentPage = pages.HOME
      await this.initSiteHeader()
      if (state.currentAccount.name !== '') {
         await this.updateAccountLastUsed()
         state.currentPage = pages.FLASH_CARDS
         const q = await dbCtx.quiz.open(state.currentAccount.id)
         if (q) {
            state.quiz = q
            state.currentPage = pages.QUIZ
         }
      }
      this.initNav()
      await this.loadPage()
   }

   async initSiteHeader() {
      let siteHeader = document.getElementById('site-header')
      if (siteHeader)
      {
         siteHeader.remove()
      }
      document.body.appendChild(await new SiteHeader().getElement())
   }

   initNav() {
      let nav = document.getElementById('nav')
      if (nav) nav.remove()
      document.body.appendChild(navigation.element)
   }

   get title()
   {
      let ele = document.createElement('title')
      ele.innerHTML = "Ignyos"
      return ele
   }

   async loadPage()
   {
      try {
         this.removeScripts()
         await this.loadScripts(this.resources)
         .then(async (page) => {
            let pageEle = document.getElementById('page')
            if (pageEle) pageEle.remove()
            document.body.appendChild(page.element)
            await page.load()
         })
      } catch(err) {
         console.error(err)
         messageCenter.addError("Error loading page.")
      }
   }

   removeScripts() {
      let css = document.getElementById('css')
      if (css) css.remove()
      let script = document.getElementById('script')
      if (script) script.remove()
   }

   async loadScripts(resource)
   {
      return new Promise((resolve, reject) => {
         try {
            if(resource.href) {
               let ele = document.createElement('link')
               ele.id = 'css'
               ele.setAttribute('rel', 'stylesheet')
               ele.setAttribute('href',`${resource.href}?v=${resource.version}`)
               document.head.appendChild(ele)
            }

            if(resource.src) {
               let scr = document.createElement('script')
               scr.id = 'script'
               scr.setAttribute('async', true)
               scr.setAttribute('type','text/javascript')
               scr.setAttribute('src',`${resource.src}?v=${resource.version}`)
               scr.addEventListener('load',() => {
                  resolve(page)
               })
               document.head.appendChild(scr)
            }
         } catch (error) {
            reject(error)
         }
      })
   }

   get resources()
   {
      return {
         src: `./pages/${state.currentPage}/${state.currentPage}.js`,
         href: `./pages/${state.currentPage}/${state.currentPage}.css`,
         version: this.pageVersion[state.currentPage]
      }
   }

   get pageVersion()
   {
      const result = {}
      result[pages.HOME] = 0;
      result[pages.QUIZ] = 0;
      result[pages.FLASH_CARDS] = 0;
      return result
   }

   //#region Modals

   //#region Confirm Modal

   confirm(okFn, message = 'Are You Sure?') {
      this.hideModal()
      let bg = document.createElement('div')
      bg.id = 'modal-bg'
      bg.classList.add('std-modal-bg')
      bg.addEventListener('click', this.hideModal)
      bg.appendChild(this.getConfirmModal(okFn, message))
      document.body.appendChild(bg)
   }

   getConfirmModal(okFn, message) {
      let msg = document.createElement('div')
      msg.classList.add('msg')
      msg.innerText = message

      let ele = document.createElement('div')
      ele.classList.add('modal')
      ele.classList.add('confirm')
      ele.appendChild(msg)
      ele.appendChild(this.getOkayBtn(okFn))
      ele.appendChild(this.getCancelBtn())
      ele.addEventListener('click', (event) => { event.stopPropagation() })
      return ele
   }

   input(okFn, message = 'Enter Value') {
      this.getModal(okFn, message, 'input')
   }

   getModal(okFn, message, type) {
      this.hideModal()
      let ele = document.createElement('div')
      ele.classList.add('modal')

      let main;
      switch (type) {
         case 'confirm':
            main = document.createElement('div')
            main.classList.add('msg')
            main.innerText = message
            ele.classList.add('confirm')
            break
         case 'input':
            main = document.createElement('input')
            main.id = 'modal-input'
            main.type = 'text'
            main.placeholder = message
            ele.classList.add('input')
            break
         default:
            break
      }

      ele.appendChild(main)
      ele.appendChild(this.getOkayBtn(() => { okFn(main.value); }))
      ele.appendChild(this.getCancelBtn())
      ele.addEventListener('click', (event) => { event.stopPropagation() })
      
      let bg = document.createElement('div')
      bg.id = 'modal-bg'
      bg.classList.add('std-modal-bg')
      bg.addEventListener('click', this.hideModal)
      bg.appendChild(ele)
      document.body.appendChild(bg)
   }

   getOkayBtn(okFn) {
      let ok = document.createElement('div')
      ok.classList.add('btn')
      ok.classList.add('ok')
      ok.innerText = 'OK'
      ok.addEventListener('click', okFn)
      return ok
   }

   getCancelBtn() {
      let cancel = document.createElement('div')
      cancel.classList.add('btn')
      cancel.classList.add('cancel')
      cancel.innerText = 'CANCEL'
      cancel.addEventListener('click', this.hideModal)
      return cancel
   }

   //#endregion

   //#region Form Modal

   formModal(bgClass, form) {
      this.hideModal()

      let bg = document.createElement('div')
      bg.id = 'modal-bg'
      bg.classList.add(bgClass)
      bg.appendChild(form)
      document.body.appendChild(bg)
   }

   //#endregion
   
   hideModal() {
      let ele = document.getElementById('modal-bg')
      if (ele) ele.remove()
   }

   //#endregion

   async updateAccountLastUsed() {
      let acct = state.currentAccount
      if (!acct) return
      acct.lastUsed = new Date().toISOString()
      await dbCtx.account.update(acct)
   }
}

class SiteHeader {
   constructor() {
   }

   async getElement()
   {
      let e = document.createElement('div')
      e.id = 'site-header'
      e.appendChild(await this.getSiteLabel())
      e.appendChild(document.createElement('div'))
      e.appendChild(this.acctName)
      return e
   }
   
   async getSiteLabel()
   {
      let e = document.createElement('div')
      e.id="menu-button"
      e.innerText = "|||"
      e.addEventListener('click', async () => {
         await this.displayMenu()
      })
      return e
   }

   async displayMenu() {
      let menu = document.getElementById('main-menu');
      if (menu) { menu.remove() }
      menu = await this.getMainMenu();
      document.body.appendChild(menu);
      menu.classList.toggle('hidden');
      document.addEventListener('click', this.hideMenuOnClickOutside.bind(this));
    }

    hideMenuOnClickOutside(event) {
        const menu = document.getElementById('main-menu');
        const button = document.getElementById('menu-button');
        if (menu && !menu.contains(event.target) && !button.contains(event.target)) {
            menu.classList.add('hidden');
            document.removeEventListener('click', this.hideMenuOnClickOutside.bind(this));
        }
    }

   async getMainMenu() {
      let e = document.createElement('div')
      e.id = 'main-menu'
      e.classList.add('hidden')
      e.classList.add('menu')
      let ul = document.createElement('ul')
      let newAcct = this.getMenuItem("New Student")
      newAcct.addEventListener('click', this.createNewAccount)
      ul.appendChild(newAcct)
      ul.appendChild(this.getMenuItem("Switch Student" , await this.getAcctSubMenu()))
      ul.appendChild(document.createElement('hr'))
      ul.appendChild(this.getMenuItem("Quiz Me!", false))
      e.appendChild(ul)
      return e
   }

   getMenuItem(txt, submenu = false) {
      let li = document.createElement('li')
      let span = document.createElement('span')
      span.innerText = txt
      li.appendChild(span)
      let arrowDiv = document.createElement('div')
      li.appendChild(arrowDiv)
      if (submenu) {
            arrowDiv.classList.add('chev-r')
            document.body.appendChild(submenu)
            li.addEventListener('click', (event) => {
               event.stopPropagation()
               const rect = li.getBoundingClientRect()
               submenu.style.top = `${rect.top - 7}px`
               submenu.style.left = `${rect.right + 3}px`
               submenu.classList.add('menu')
               submenu.classList.toggle('hidden')
               submenu.addEventListener('click', (event) => {
                  submenu.classList.add('hidden')
               })
               document.addEventListener('click', this.hideSubMenuOnClickOutside.bind(this, submenu));
         })
      }
      return li
   }

   hideSubMenuOnClickOutside(submenu, event) {
        if (!submenu.contains(event.target)) {
            submenu.classList.add('hidden');
            document.removeEventListener('click', this.hideSubMenuOnClickOutside.bind(this, submenu));
        }
    }

    hideElementOnClickOutside(element, event) {
      if (!element.contains(event.target)) {
            element.classList.add('hidden');
            document.removeEventListener('click', this.hideElementOnClickOutside.bind(this, element));
      }
   }

   async getAcctSubMenu() {
      let subMenu = document.createElement('div')
      subMenu.classList.add('sub-menu')
      subMenu.classList.add('hidden')
      let ul = document.createElement('ul')

      let accounts = await dbCtx.account.all()
      accounts.sort((a,b) => new Date(b.lastUsed) - new Date(a.lastUsed))
      accounts.forEach (acct => {
         let li = this.getAcctListItem(acct.name)
         li.addEventListener('click', async () => {
            await this.switchToAccount(acct.id)
         })
         ul.appendChild(li)
      })
      subMenu.appendChild(ul)
      return subMenu
   }

   getAcctListItem(txt) {
      let li = document.createElement('li');
      let span = document.createElement('span');
      span.innerText = txt;
      li.appendChild(span);
      return li;
   }

   createNewAccount(){
      app.input(async (val) => { 
         let n = val.trim()
         if (n.length > 0) {
            if (await dbCtx.account.exists(n)) {
               messageCenter.addError(`Account '${n}' already exists.`)
            } else {
               const newAccount = new Account({ name: n });
               await dbCtx.account.add(newAccount)
               await dbCtx.metadata.setSelectedAccountId(newAccount.id)
               app.route()
            }
         } else {
            messageCenter.addError('Account Name cannot be blank.')
         }
      }, "Student's Name...");
      document.getElementById('main-menu').remove();
   }

   async switchToAccount(id) {
      await dbCtx.metadata.setSelectedAccountId(id)
      app.route()
   }

   get acctName()
   {
      let div = document.createElement('div')
      div.classList.add('acct-name')
      div.innerText = state.currentAccount.name
      return div
   }
}

navigation = {
   get element() {
      let n = this.nav
      if (state.currentPage == pages.QUIZ) {
         n.classList.add('quiz')
         n.appendChild(this.questionCounter)
         n.appendChild(this.showAnswerBtn)
         n.appendChild(this.quitQuizBtn)
      } else {
         n.classList.add('standard')
         n.appendChild(this.quizBtn)
      }
      return n
   },

   get nav() {
      let nav = document.getElementById('nav')
      if (nav) {
         nav.innerHTML = null
      } else {
         nav = document.createElement('div')
         nav.id = 'nav'
      }
      return nav
   },

   get questionCounter() {
      let ele = document.createElement('div')
      let n = state.quiz.answeredQuestionIds.length + 1
      let total = state.quiz.allQuestionIds.length
      ele.innerText= `Question ${n} of ${total}`
      ele.id = 'question-counter'
      return ele
   },

   get showAnswerBtn() {
      let ele = this.getNavItemPill("Show Answer", false)
      ele.id = 'show-answer'
      ele.addEventListener('click', () => {
         page.showAnswer()
      })
      return ele
   },

   get quitQuizBtn() {
      let ele = this.getNavItemPill("End Quiz", false)
      ele.id = 'quit-quiz'
      ele.addEventListener('click', async () => {
         await page.quitQuiz()
      })
      return ele
   },

   get quizBtn() {
      let ele = this.getNavItemPill("Quiz Me!", state.currentPage == pages.QUIZ)
      ele.id = 'create-quiz'
      if (state.currentPage != pages.QUIZ) {
         ele.addEventListener('click', async () => {
            state.quiz = await dbCtx.quiz.create(state.currentAccount.id, state.currentAccount.settings.defaultQuestionCount)
            state.currentPage = pages.QUIZ
            await app.route()
         })
      }
      return ele
   },

   getNavItemPill(text, selected) {
      let ele = document.createElement('div')
      ele.innerText = text
      if (selected) {
         ele.classList.add('pill-selected')
      } else {
         ele.classList.add('pill')
      }
      return ele
   },
}

messageCenter = {
   get element() {
      let ele = document.getElementById('msg-cntr')
      if (!ele) {
         ele = document.createElement('div')
         ele.id = ('msg-cntr')
         document.body.appendChild(ele)
      }
      return ele
   },
   addError(msg) {
      this.addItem(msg,'err')
   },
   addInfo(msg) {
      this.addItem(msg,'nfo')
   },
   addItem(msg,cls) {
      let ele = document.createElement('div')
      ele.classList.add(cls)
      ele.innerText = msg
      setTimeout(()=>{ele.remove()},3000)
      this.element.appendChild(ele)
   }
}

