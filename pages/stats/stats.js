page = {
   get element() {
      let ele = document.createElement('div')
      ele.id = 'page'
      ele.appendChild(this.quizPane)
      return ele
   },
}