page = {
   get element() {
      let ele = document.createElement('div')
      ele.id = 'page'
      ele.appendChild(this.subjectPane)
      ele.appendChild(this.topicPane)
      ele.appendChild(this.questionPane)
      return ele
   },

   async load() {
      await this.loadSubjects()
      await this.loadTopics()
      await this.loadQuestions()
   },

   //#region Subject Pane
   
   async loadSubjects()
   {
      state.accountSubjects = await dbCtx.accountSubject.list(state.currentAccount.id)
      this.populateSubjectList()
   },

   async refreshSubjectPane(reload = false) {
      document.getElementById('subject-pane').remove()
      let page = document.getElementById('page')
      page.appendChild(this.subjectPane)
      if (reload) {
         await this.loadSubjects()
      }
      this.populateSubjectList()
   },

   get subjectPane() {
      let ele = document.createElement('div')
      ele.id = 'subject-pane'
      ele.classList.add('pane')
      ele.appendChild(this.getPaneHeader('S U B J E C T'))
      ele.appendChild(this.subjectPaneControls)
      ele.appendChild(this.subjectList)
      if (state.selectedSubjectId == "0") {
         state.selectedTopicId = 0
         state.topics = [] 
      }
      return ele
   },

   get subjectPaneControls() {
      let ele = document.createElement('div')
      ele.classList.add('controls')
      ele.appendChild(this.newSubjectControl)
      return ele
   },

   get newSubjectControl() {
      let ele = document.createElement('div')
      ele.id = 'new-subject-control'
      ele.appendChild(this.newSubjectInput)
      ele.appendChild(this.newSubjectButton)
      return ele
   },

   get newSubjectInput() {
      let input = document.createElement('input')
      input.type = 'text'
      input.placeholder = 'New Subject'
      input.spellcheck = false
      input.id = 'new-subject'
      input.classList.add('new-subject')
      input.addEventListener('keyup',async (event) => {
         if (event.key == 'Enter') {
            await this.createNewSubject()
         } else if (event.key == 'Escape') {
            document.getElementById('new-subject').value = ''
         }
      })
      return input
   },

   get newSubjectButton() {
      let btn = document.createElement('div')
      btn.classList.add('btn')
      btn.classList.add('plus')
      btn.addEventListener('click', async () => {
         await this.createNewSubject()
      })
      return btn
   },

   async createNewSubject() {
      let val = document.getElementById('new-subject').value.trim()
      if (val == '') return
      let newSubject = new Subject({title: val})
      let newAcctSub = new AccountSubject({accountId: state.currentAccount.id, subjectId: newSubject.id})
      let subListItem = new SubjectListItem(newAcctSub,newSubject)
      await dbCtx.subject.add(newSubject)
      await dbCtx.accountSubject.add(newAcctSub)
      state.addNewAccountSubject(subListItem)
      await this.refreshSubjectPane(true)
      await this.refreshTopicPane()
      await this.refreshQuestionPane()
   },

   get subjectList() {
      let ele = document.createElement('div')
      ele.id = 'subject-list'
      ele.classList.add('v-loading')
      return ele
   },

   populateSubjectList() {
      let subList = document.getElementById('subject-list')
      subList.innerHTML = null
      subList.classList.remove('v-loading')
      state.accountSubjects.forEach(aSub => {
         subList.appendChild(this.subjectListItem(aSub))
      })
   },

   subjectListItem(subject) {
      let ele = document.createElement('div')
      ele.id = `sub-${subject.id}`

      let txt = document.createElement('div')
      txt.innerText = subject.title
      ele.appendChild(txt)

      let focus = document.createElement('span')
      if (subject.focusTopicIds.length > 0) focus.innerText = '*'
      ele.appendChild(focus)

      if (state.selectedSubjectId == subject.id) {
         ele.classList.add('item-selected')
         ele.appendChild(this.editSubjectBtn(subject))
         ele.appendChild(this.deleteSubjectBtn(subject))
      } else {
         ele.classList.add('item')
         ele.addEventListener('click', async () => {
            state.selectedSubjectId = subject.id
            await this.refreshSubjectPane()
            await this.refreshTopicPane(true)
            await this.refreshQuestionPane()
         })
      }
      return ele
   },

   editSubjectBtn(subject) {
      let ele = document.createElement('div')
      ele.classList.add('edit')
      ele.addEventListener('click', () => {
         let item = document.getElementById(`sub-${subject.id}`)
         let edit = this.subjectListItemEditing(subject)
         item.replaceWith(edit)
         document.getElementById('edit-subject').focus()
      })
      return ele
   },

   deleteSubjectBtn(subject) {
      let ele = document.createElement('div')
      ele.classList.add('trash')
      ele.addEventListener('click', () => {
         app.confirm(async () => {
            await this.deleteSubject(subject)
         },`Delete "${subject.title}"?`)
      })
      return ele
   },

   async deleteSubject(subject) {
      subject.deletedDate = new Date().toISOString()
      await dbCtx.subject.update(subject)
      await dbCtx.accountSubject.delete(state.currentAccount.id,subject.id)
      state.deleteAccountSubject(subject.id)
      await this.refreshSubjectPane()
      await this.refreshTopicPane()
      await this.refreshQuestionPane()
   },

   subjectListItemEditing(subject) {
      let ele = document.createElement('div')
      ele.id = `sub-${subject.id}`
      ele.classList.add('item-editing')
      ele.appendChild(this.getEditSubjectInput(subject))
      ele.appendChild(this.getEditSubjectButton(subject))
      return ele
   },

   getEditSubjectInput(subject) {
      let input = document.createElement('input')
      input.type = 'text'
      input.spellcheck = false
      input.placeholder = 'A title is required!'
      input.value = subject.title
      input.id = 'edit-subject'
      input.classList.add('edit-subject')
      input.addEventListener('keyup',async (event) => {
         if (event.key == 'Enter') {
            await this.editSubject(subject)
         } else if (event.key == 'Escape') {
            await app.route()
         }
      })
      return input
   },

   getEditSubjectButton(subject) {
      let btn = document.createElement('div')
      btn.classList.add('btn')
      btn.classList.add('check')
      btn.addEventListener('click', async () => {
         await this.editSubject(subject)
      })
      return btn
   },

   async editSubject(subject) {
      let val = document.getElementById('edit-subject').value.trim()
      if (val == '') return
      subject.title = val
      if (await dbCtx.subject.update(subject))
      {
         state.updateAccountSubject(subject)
         await this.refreshSubjectPane()
         await this.refreshTopicPane()
         await this.refreshQuestionPane()
      }
   },

   //#endregion

   //#region Topic Pane
   
   async loadTopics()
   {
      if (state.selectedSubjectId == "0") {
         state.selectedTopicId = 0
         state.topics = []
      } else {
         state.topics = await dbCtx.topic.all(state.selectedSubjectId)
         this.populateTopicList()
      }
   },

   async refreshTopicPane(reload = false) {
      document.getElementById('topic-pane').remove()
      let page = document.getElementById('page')
      page.appendChild(this.topicPane)
      if (reload) {
         await this.loadTopics()
      } else {
         this.populateTopicList()
      }
   },

   get topicPane() {
      let ele = document.createElement('div')
      ele.id = 'topic-pane'
      ele.classList.add('pane')
      ele.appendChild(this.getPaneHeader('T O P I C'))
      if (state.selectedSubjectId != 0) {
         ele.appendChild(this.topicPaneControls)
         ele.appendChild(this.topicList)
      }
      return ele
   },

   get topicPaneControls() {
      let ele = document.createElement('div')
      ele.classList.add('controls')
      ele.appendChild(this.newTopicControl)
      return ele
   },

   get newTopicControl() {
      let ele = document.createElement('div')
      ele.id = 'new-topic-control'
      ele.appendChild(this.newTopicInput)
      ele.appendChild(this.newTopicButton)
      return ele
   },

   get newTopicInput() {
      let input = document.createElement('input')
      input.type = 'text'
      input.placeholder = 'New Topic'
      input.spellcheck = false
      input.id = 'new-topic'
      input.classList.add('new-topic')
      input.addEventListener('keyup',async (event) => {
         if (event.key == 'Enter') {
            await this.createTopic()
         } else if (event.key == 'Escape') {
            document.getElementById('new-topic').value = ''
         }
      })
      return input
   },

   get newTopicButton() {
      let btn = document.createElement('div')
      btn.classList.add('btn')
      btn.classList.add('plus')
      btn.addEventListener('click', async () => {
         await this.createTopic()
      })
      return btn
   },

   async createTopic() {
      let val = document.getElementById('new-topic').value.trim()
      if (val == '') return
      let newTopic = new Topic({subjectId: state.selectedSubjectId, title: val})
      await dbCtx.topic.add(newTopic)
      state.addNewTopic(newTopic)
      this.refreshTopicPane()
      this.refreshQuestionPane()
   },

   get topicList() {
      let ele = document.createElement('div')
      ele.id = 'topic-list'
      ele.classList.add('v-loading')
      return ele
   },

   populateTopicList() {
      let topicList = document.getElementById('topic-list')
      if (!topicList) return
      topicList.innerHTML = null
      topicList.classList.remove('v-loading')
      state.topics.forEach(topic => {
         topicList.appendChild(this.topicListItem(topic))
      })
   },

   topicListItem(topic) {
      let ele = document.createElement('div')
      ele.id = `top-${topic.id}`

      ele.appendChild(this.getFocusTopicBtn(topic))

      let txt = document.createElement('div')
      txt.innerText = topic.title
      ele.appendChild(txt)

      if (state.selectedTopicId == topic.id) {
         ele.classList.add('item-selected')
         ele.appendChild(this.editTopicBtn(topic))
         ele.appendChild(this.deleteTopicBtn(topic))
      } else {
         ele.classList.add('item')
         ele.addEventListener('click', async () => {
            state.selectedTopicId = topic.id
            this.refreshTopicPane()
            this.refreshQuestionPane(true)
         })
      }
      return ele
   },

   getFocusTopicBtn(topic) {
      let ele = document.createElement('div')
      ele.classList.add('focus-btn')
      if (state.selectedSubject.focusTopicIds.includes(topic.id)) {
         ele.innerText = '*'
      }
      ele.addEventListener('click', async (event) => {
         event.stopImmediatePropagation()
         state.toggleFocusTopic(topic.id)
         let acctSub = {
            accountId: state.currentAccount.id,
            subjectId: state.selectedSubjectId,
            focusTopicIds: state.selectedSubject.focusTopicIds
         }
         await dbCtx.accountSubject.update(acctSub)
         await this.refreshSubjectPane()
         await this.refreshTopicPane()
      })
      return ele
   },

   editTopicBtn(topic) {
      let ele = document.createElement('div')
      ele.classList.add('edit')
      ele.addEventListener('click', () => {
         let item = document.getElementById(`top-${topic.id}`)
         let edit = this.topictListItemEditing(topic)
         item.replaceWith(edit)
         document.getElementById('edit-topic').focus()
      })
      return ele
   },

   deleteTopicBtn(topic) {
      let ele = document.createElement('div')
      ele.classList.add('trash')
      ele.addEventListener('click', () => {
         app.confirm(async () => {
            await this.deleteTopic(topic)
         },`Delete "${topic.title}"?`)
      })
      return ele
   },

   async deleteTopic(topic) {
      topic.deletedDate = new Date().toISOString()
      if (await dbCtx.topic.update(topic)) {
         if (state.deleteTopic(topic)) {
            let acctSub = {
               accountId: state.currentAccount.id,
               subjectId: state.selectedSubjectId,
               focusTopicIds: state.selectedSubject.focusTopicIds
            }
            await dbCtx.accountSubject.update(acctSub)
         }
      }
      this.refreshTopicPane()
      this.refreshQuestionPane()
   },

   topictListItemEditing(topic) {
      let ele = document.createElement('div')
      ele.id = `top-${topic.id}`
      ele.classList.add('item-editing')
      ele.appendChild(this.getEditTopicInput(topic))
      ele.appendChild(this.getEditTopicButton(topic))
      return ele
   },

   getEditTopicInput(topic) {
      let input = document.createElement('input')
      input.type = 'text'
      input.spellcheck = false
      input.placeholder = 'A title is required!'
      input.value = topic.title
      input.id = 'edit-topic'
      input.classList.add('edit-topic')
      input.addEventListener('keyup',async (event) => {
         if (event.key == 'Enter') {
            await this.editTopic(topic)
         } else if (event.key == 'Escape') {
            this.refreshTopicPane()
         }
      })
      return input
   },

   getEditTopicButton(topic) {
      let btn = document.createElement('div')
      btn.classList.add('btn')
      btn.classList.add('check')
      btn.addEventListener('click', async () => {
         await this.editTopic(topic)
      })
      return btn
   },

   async editTopic(topic) {
      let val = document.getElementById('edit-topic').value.trim()
      if (val == '') return
      topic.subjectId = state.selectedSubjectId
      topic.title = val
      await dbCtx.topic.update(topic)
      state.updateTopic(topic)
      this.refreshTopicPane(true)
   },

   //#endregion

   //#region Question Pane
   
   async loadQuestions()
   {
      if (state.selectedTopicId == "0") {
         state.selectedQuestionId = 0
         state.questions = []
      } else {
         state.questions = await dbCtx.question.byTopicId(state.selectedTopicId)
         this.populateQuestionList()
      }
   },

   async refreshQuestionPane(reload = false) {
      document.getElementById('question-pane').remove()
      let page = document.getElementById('page')
      page.appendChild(this.questionPane)
      if (reload) {
         await this.loadQuestions()
      } else {
         this.populateQuestionList()
      }
   },

   get questionPane() {
      let ele = document.createElement('div')
      ele.id = 'question-pane'
      ele.classList.add('pane')
      ele.appendChild(this.getPaneHeader('Q U E S T I O N'))
      if (state.selectedTopicId != 0) {
         ele.appendChild(this.questionPaneControls)
         ele.appendChild(this.questionList)
      }
      return ele
   },

   get questionPaneControls() {
      let ele = document.createElement('div')
      ele.classList.add('controls')
      ele.appendChild(this.newQuestionControl)
      return ele
   },

   get newQuestionControl() {
      let ele = document.createElement('div')
      ele.id = 'new-question-control'
      ele.appendChild(this.newQuestionInput)
      ele.appendChild(this.newQuestionButton)
      return ele
   },

   get newQuestionInput() {
      let input = document.createElement('input')
      input.type = 'text'
      input.placeholder = 'New Question'
      input.spellcheck = false
      input.id = 'new-question'
      input.classList.add('new-question')
      input.addEventListener('keyup',async (event) => {
         if (event.key == 'Enter') {
            await this.initNewQuestion()
         } else if (event.key == 'Escape') {
            document.getElementById('new-question').value = ''
         }
      })
      return input
   },

   get newQuestionButton() {
      let btn = document.createElement('div')
      btn.classList.add('btn')
      btn.classList.add('plus')
      btn.addEventListener('click', async () => {
         await this.initNewQuestion()
      })
      return btn
   },

   async initNewQuestion() {
      let val = document.getElementById('new-question')?.value.trim()
      if (!val || val == '') return
      state.selectedQuestionId = 0
      document.getElementById('new-question').value = ''
      await this.showQuestionModal({ id: false, shortPhrase: val })
   },

   get questionList() {
      let ele = document.createElement('div')
      ele.id = 'question-list'
      ele.classList.add('v-loading')
      return ele
   },

   populateQuestionList() {
      let questionList = document.getElementById('question-list')
      if (questionList) {
         questionList.innerHTML = null
         questionList.classList.remove('v-loading')
         state.questions.forEach(question => {
            questionList.appendChild(this.questionListItem(question))
      })
      }
   },

   questionListItem(question) {
      let ele = document.createElement('div')
      ele.id = `que-${question.id}`
      ele.innerText = question.shortPhrase
      if (state.selectedQuestionId == question.id) {
         ele.classList.add('item-selected')
         ele.appendChild(this.editQuestionBtn(question))
         ele.appendChild(this.deleteQuestionBtn(question))
      } else {
         ele.classList.add('item')
         ele.addEventListener('click', async () => {
            state.selectedQuestionId = question.id
            this.refreshQuestionPane()
         })
      }
      return ele
   },

   editQuestionBtn(question) {
      let ele = document.createElement('div')
      ele.classList.add('edit')
      ele.addEventListener('click', async () => {
         await this.showQuestionModal(question)
      })
      return ele
   },

   deleteQuestionBtn(question) {
      let ele = document.createElement('div')
      ele.classList.add('trash')
      ele.addEventListener('click', () => {
         app.confirm(async () => {
            await this.deleteQuestion(question)
         },`Delete "${question.shortPhrase}"?`)
      })
      return ele
   },

   async deleteQuestion(question) {
      question.deletedDate = new Date().toISOString()
      if (await dbCtx.question.update(question)) {
         state.deleteQuestion(question)
      }
      app.hideModal()
      this.refreshQuestionPane(true)
   },

   //#endregion

   //#region Question Modal

   async showQuestionModal(question)
   {
      document.getElementById('site-header').classList.add('blur')
      document.getElementById('nav').classList.add('blur')
      await this.loadQuestion(question)
      app.formModal('question-modal-bg', this.getQuestionModal(question))
   },

   async loadQuestion(question) {
      if (question.id !== false) {
         question = await dbCtx.question.get(question.id)
         if (question) {
            state.question = question
         } else {
            app.messageCenter.addError('The selected question could not be found.')
         }
      }
      document.getElementById('new-question').value = ''
   },

   getQuestionModal(question) {
      let sp = document.createElement('input')
      sp.id = 'short-phrase'
      sp.type = 'text'
      sp.value = question.shortPhrase

      let ph = document.createElement('textarea')
      ph.id = 'phrase'
      ph.placeholder = 'Enter the full phrasing of the question here.'
      ph.rows = 5
      ph.innerText = question.phrase ?? ''

      let an = document.createElement('textarea')
      an.id = 'answer'
      an.placeholder = 'Enter the answer to the question here.'
      an.innerText = question.answer ?? ''

      let frm = document.createElement('div')
      frm.classList.add('question-form')
      frm.appendChild(sp)
      frm.appendChild(ph)
      frm.appendChild(an)
      frm.appendChild(this.questionControls)

      let ele = document.createElement('div')
      ele.classList.add('question-modal')
      ele.appendChild(frm)
      return ele
   },

   get questionControls() {
      let save = document.createElement('div')
      save.innerText = "SAVE"
      save.classList.add('btn')
      save.classList.add('save')
      save.addEventListener('click', async () => {
         await this.saveQuestion()
      })

      let cancel = document.createElement('div')
      cancel.innerText = "CANCEL"
      cancel.classList.add('btn')
      cancel.classList.add('cancel')
      cancel.addEventListener('click', () => {
         document.getElementById('site-header').classList.remove('blur')
         document.getElementById('nav').classList.remove('blur')
         app.hideModal()
      })

      let ele = document.createElement('div')
      ele.classList.add('question-controls')
      ele.appendChild(save)
      ele.appendChild(cancel)
      return ele
   },

   async saveQuestion() {
      let form = this.questionForm
      if (form.isValid())
      {
         if (form.id == 0) {
            let newQuestion = new Question(form)
            newQuestion.id = newId(4)
            let i = 0;
            while (await dbCtx.question.exists(newQuestion.id) && i < 10) {
               newQuestion.id = newId(4)
               i++
            }
            if (i >= 10) {
               messageCenter.addError('Could not create a new question. Please try again.')
               return
            }
            await dbCtx.question.add(newQuestion)
            state.addQuestion(newQuestion)
         } else {
            let updatedQuestion = new Question(form)
            await dbCtx.question.update(updatedQuestion)
            state.updateQuestion(updatedQuestion)
         }
         this.refreshQuestionPane(true)
         document.getElementById('site-header').classList.remove('blur')
         document.getElementById('nav').classList.remove('blur')
         app.hideModal()
      }
   },

   get questionForm() {
      let shortPhrase = document.getElementById('short-phrase')?.value.trim()
      let phrase = document.getElementById('phrase')?.value.trim()
      let answer = document.getElementById('answer')?.value.trim()

      let isValid = () => {
         let result = true
         if (shortPhrase == '') {
            result = false
            messageCenter.addError('A short phrasing of the question is required.')
         }
         if (phrase == '') {
            result = false
            messageCenter.addError('The full phrasing of the question is required.')
         }
         if (answer == '') {
            result = false
            messageCenter.addError('The answer to the question is required.')
         }
         return result
      }

      return {
         'id': state.selectedQuestionId,
         'topicId': state.selectedTopicId,
         'shortPhrase': shortPhrase,
         'phrase': phrase,
         'answer': answer,
         'isValid': isValid
      }
   },

   //#endregion

   getPaneHeader(name) {
      let ele = document.createElement('div')
      ele.classList.add('header')

      let left = document.createElement('div')
      left.classList.add('left-line')
      ele.appendChild(left)

      let txt = document.createElement('div')
      txt.classList.add('txt')
      txt.innerText = name
      ele.appendChild(txt)

      let right = document.createElement('div')
      right.classList.add('right-line')
      ele.appendChild(right)

      return ele
   },
}