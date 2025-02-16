page = {
   get element() {
      let ele = document.createElement('div')
      ele.id = 'page'
      ele.appendChild(this.title)
      ele.appendChild(document.createElement('br'))
      ele.appendChild(document.createElement('br'))
      ele.appendChild(this.tagLine)
      ele.appendChild(document.createElement('br'))
      ele.appendChild(document.createElement('br'))
      ele.appendChild(this.getStarted)
      return ele
   },
   async load() {},
   get title() {
      let ele = document.createElement('div')

      // let welcome = document.createElement('h3')
      // welcome.innerHTML = "&nbsp;Welcome <span style='font-size:0.4em'>to</span>"
      // welcome.style.color = '#898989'
      // ele.appendChild(welcome)

      let subtitle = document.createElement('h2')
      subtitle.innerText = "Flash Cards"
      ele.appendChild(subtitle)

      let ignyos = document.createElement('h4')
      ignyos.innerHTML = "<span style='font-size:0.4em;vertical-align:top;top:.5em;position:relative;'>by</span> Ignyos&nbsp;"
      ignyos.style.color = '#898989'
      ele.appendChild(ignyos)

      return ele
   },
   get tagLine() {
      let ele = document.createElement('h3')
      
      let learn = document.createElement('h3')
      learn.innerHTML = "&nbsp;Learning <span style='font-size:0.4em;color:#898989'>by</span>"
      
      ele.appendChild(learn)

      let reinforcement = document.createElement('h5')
      reinforcement.innerText = "Reinforcement"
      reinforcement.style.color = '#898989'
      ele.appendChild(reinforcement)
      
      return ele
   },
   get getStarted() {
      let ele = document.createElement('div')
      ele.classList.add('get-started')
      ele.innerText = "Get Started"
      ele.onclick = async () => {
         await stateMgr.setPage(pages.FLASH_CARDS)
         let pgEle = document.getElementById('page')
         if (pgEle) pgEle.innerHTML = null
         await app.route()         
      }
      return ele
   }
}
