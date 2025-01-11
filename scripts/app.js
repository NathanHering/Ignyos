class App {
   constructor(appName) {
      this.appName = appName
      document.head.appendChild(this.title)
      this.route()
   }

   async route() {
      this.initSiteHeader()
      if (api.userIsSignedIn) {
         await this.getOpenQuiz()
         if (state.quiz.id != 0) {
            state.currentPage = pages.QUIZ
         } else {
            state.currentPage = pages.MATERIAL
         }
         this.initNav()
      } else {
         state.currentPage = pages.HOME
      }
      await this.loadPage()
   }

   async getOpenQuiz() {
      let response = await api.GET("ignyos/quiz/open")
      let data = this.processApiResponse(response)
      state.quiz = data
   }

   initSiteHeader() {
      let siteHeader = document.getElementById('site-header')
      if (siteHeader) siteHeader.remove()
      document.body.appendChild(new SiteHeader(appName).element)
      this.funtilityUi = new FuntilityUI(api)
   }

   initNav() {
      let nav = document.getElementById('nav')
      if (nav) nav.remove()
      document.body.appendChild(navigation.element)
   }

   get title()
   {
      let ele = document.createElement('title')
      ele.innerHTML = this.appName;
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
         console.log(err)
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
      // result[pages.SETTINGS] = 0;
      // result[pages.STATS] = 0;
      result[pages.MATERIAL] = 0;
      return result
   }

   //#region Funtility API

   processApiResponse(apiResponse)
   {
      if (apiResponse.hasErrors) {
         apiResponse.errors.forEach(err => {
            console.error(err)
            messageCenter.addError(err)
         })
      }
      return apiResponse.result
   }

   //#endregion

   //#region Modals

   //#region Confirm Modal

   confirm(okFn, message = 'Are You Sure?') {
      this.hideModal()

      let bg = document.createElement('div')
      bg.id = 'modal-bg'
      bg.classList.add('confirm-modal-bg')
      bg.addEventListener('click', this.hideModal)
      bg.appendChild(this.getConfirmModal(okFn, message))
      document.body.appendChild(bg)
   }

   getConfirmModal(okFn, message) {
      let msg = document.createElement('div')
      msg.classList.add('msg')
      msg.innerText = message

      let ok = document.createElement('div')
      ok.classList.add('btn')
      ok.classList.add('ok')
      ok.innerText = 'OK'
      ok.addEventListener('click', okFn)

      let cancel = document.createElement('div')
      cancel.classList.add('btn')
      cancel.classList.add('cancel')
      cancel.innerText = 'CANCEL'
      cancel.addEventListener('click', this.hideModal)

      let ele = document.createElement('div')
      ele.classList.add('confirm-modal')
      ele.appendChild(msg)
      ele.appendChild(ok)
      ele.appendChild(cancel)
      return ele
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
}

class SiteHeader {
   constructor(siteName) {
      this.siteName = siteName
   }

   get element()
   {
      let e = document.createElement('div')
      e.id = 'site-header'
      e.appendChild(this.siteLabel)
      e.appendChild(document.createElement('div'))
      e.appendChild(this.signIn)
      return e
   }
   
   get siteLabel()
   {
      let img = document.createElement('img')
      img.src = './images/logo.svg'

      let span = document.createElement('span')
      span.innerText = this.siteName;

      let e = document.createElement('div')
      e.classList.add('site-label')
      e.appendChild(img)
      e.appendChild(span)

      e.addEventListener('click', async () => {
         if (state.currentPage == pages.QUIZ) {
            messageCenter.addInfo('Complete the quiz first.')
         } else {
            state.currentPage = pages.HOME
            await app.route()
         }
      })
      return e
   }

   get signIn()
   {
      let e = document.createElement('div')
      e.id = 'funtility'
      return e
   }
}

navigation = {
   get element() {
      let n = this.nav
      if (state.quiz.completeDateUTC || state.quiz.id == 0) {
         n.classList.add('standard')
         n.appendChild(this.materialBtn)
         n.appendChild(this.quizBtn)
         // n.appendChild(this.statsBtn)
         // n.appendChild(this.settingsBtn)
      } else {
         n.classList.add('quiz')
         n.appendChild(this.questionCounter)
         n.appendChild(this.showAnswerBtn)
         n.appendChild(this.quitQuizBtn)
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

   get materialBtn() {
      let ele = this.getNavItemPill("Study Material", state.currentPage == pages.MATERIAL)
      ele.id = 'study-material'
      if (state.currentPage != pages.MATERIAL) {
         ele.addEventListener('click', async () => {
            state.quiz = new Quiz()
            state.currentPage = pages.MATERIAL
            await app.route()
         })
      }
      return ele
   },

   get quizBtn() {
      let ele = this.getNavItemPill("Take a Quiz", state.currentPage == pages.QUIZ)
      ele.id = 'create-quiz'
      if (state.currentPage != pages.QUIZ) {
         ele.addEventListener('click', async () => {
            let response = await api.POST('ignyos/quiz')
            let data = app.processApiResponse(response)
            state.quiz = data
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
