page = {
   get element() {
      let ele = document.createElement('div')
      ele.id = 'page'
      ele.appendChild(this.title)
      ele.appendChild(document.createElement('br'))
      ele.appendChild(this.p1)
      ele.appendChild(document.createElement('br'))
      ele.appendChild(this.p2)
      return ele
   },
   async load() {},
   get title() {
      let ele = document.createElement('h2')
      ele.id = 'info'
      ele.innerText = "Welcome to Flash Cards by Ignyos!"
      return ele
   },
   get p1() {
      let ele = document.createElement('p')
      ele.id = 'description'
      ele.innerText = "Ignyos is a site for learning by testing your knowlege."
      return ele
   },
   get p2() {
      let ele = document.createElement('p')
      ele.id = 'description'
      ele.innerText = "Create your own flash cards and test yourself on them."
      return ele
   }
}
