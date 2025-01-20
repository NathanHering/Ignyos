const pages = {
   HOME: "home",
   MATERIAL: "material",
   QUIZ: "quiz",
}

class State {
   constructor(siteName) {
      this.name = siteName
      this.getLocal()
   }

   //#region Current Page

   _currentAccount = new Account()
   get currentAccount() {
      return this._currentAccount
   }
   set currentAccount(data) {
      this._currentAccount = new Account(data)
   }

   _currentPage
   get currentPage() {
      if (!this._currentPage) this._currentPage = pages.HOME
      return this._currentPage
   }
   set currentPage(data) {
      this._currentPage = data
      this.setLocal()
   }

   //#endregion

   //#region Quiz

   _quiz = new Quiz()
   get quiz()
   {
      if (!this._quiz) this._quiz = new Quiz()
      return this._quiz
   }
   set quiz(data)
   {
      if (data) {
         this._quiz = data ? new Quiz(data) : new Quiz()
         if (this._quiz.id > 0) this.currentPage = pages.QUIZ
      } else {
         this._quiz = new Quiz()
      }
      this.setLocal()
   }

   getNextQuestionId() {
      let unanswered = []
      this.quiz.allQuestionIds.forEach(q => {
         if (!this.quiz.answeredQuestionIds.includes(q)) unanswered.push(q)
      })
      let i = Math.floor(Math.random() * unanswered.length)
      return unanswered[i]
   }

   //#endregion

   //#region AccountSubjects

   _selectedSubjectId = 0
   get selectedSubjectId() {
      return this._selectedSubjectId
   }
   set selectedSubjectId(id) {
      if (this._selectedSubjectId == id) return
      this._selectedSubjectId = id
      this.selectedTopicId = 0
      this.topics = []
      this.selectedQuestionId = 0
      this.questions = []
      this.setLocal()
   }

   get selectedSubject() {
      let result = {}
      this.accountSubjects.forEach(sub => {
         if (sub.id == this.selectedSubjectId) {
            result = sub
         }
      })
      return result
   }

   _accountSubjects = []
   get accountSubjects()
   {
      if (!this._accountSubjects) this._accountSubjects = []
      return this._accountSubjects
   }
   set accountSubjects(data)
   {
      this._accountSubjects = data.length ? data : []
      let unsetSelectedSubjectId = true
      this._accountSubjects.forEach(subject => {
         // subject.focusTopicIds = JSON.parse(subject.focusTopicIds)
         if (subject.id == this._selectedSubjectId) unsetSelectedSubjectId = false
      });
      if (unsetSelectedSubjectId) this.selectedSubjectId = 0
      this.accountSubjects.sort((a,b) => {
         return a.title.localeCompare(b.title)
      })
      this.setLocal()
   }

   addNewAccountSubject(data) {
      this.selectedSubjectId = data.id
      this.accountSubjects.push(data)
      this.accountSubjects.sort((a,b) => {
         return a.title.localeCompare(b.title)
      })
      this.clearTopicsAndQuestions()
      this.setLocal()
   }

   updateAccountSubject(data) {
      this.selectedSubjectId = data.id
      let i = this.accountSubjects.findIndex((e) => {
         e.id == data.id
      })
      this.accountSubjects[i] = data
      this.accountSubjects.sort((a,b) => {
         return a.title.localeCompare(b.title)
      })
      this.setLocal()
   }

   deleteAccountSubject(id) {
      this.selectedSubjectId = 0
      let i = this.accountSubjects.findIndex((e) => {
         e.id == id
      })
      this.accountSubjects.splice(i,1)
      this.selectedTopicId = 0
      this.topics = []
      this.selectedQuestionId = 0
      this.questions = []
      this.setLocal()
   }

   //#endregion

   //#region Topics

   _selectedTopicId = 0
   get selectedTopicId() {
      return this._selectedTopicId
   }
   set selectedTopicId(id) {
      if (this._selectedTopicId == id) return
      this._selectedTopicId = id
      this.selectedQuestionId = 0
      this.questions = []
      this.setLocal()
   }

   _topics = []
   get topics()
   {
      if (!this._topics) this._topics = []
      return this._topics
   }
   set topics(data)
   {
      this._topics = data.length ? data : []
      this.topics.sort((a,b) => {
         return a.title.localeCompare(b.title)
      })
      this.setLocal()
   }

   toggleFocusTopic(id) {
      let i = this.selectedSubject.focusTopicIds.indexOf(id)
      if (i > -1) {
         this.selectedSubject.focusTopicIds.splice(i, 1)
      } else {
         this.selectedSubject.focusTopicIds.push(id)
      }
      this.setLocal()
   }

   addNewTopic(data) {
      this.selectedTopicId = data.id
      this.topics.push(data)
      this.topics.sort((a,b) => {
         return a.title.localeCompare(b.title)
      })
      this.selectedQuestionId = 0
      this.questions = []
      this.setLocal()
   }

   updateTopic(data) {
      this.selectedTopicId = data.id
      let i = this.topics.findIndex((e) => {
         e.id == data.id
      })
      this.topics[i] = data
      this.topics.sort((a,b) => {
         return a.title.localeCompare(b.title)
      })
      this.setLocal()
   }

   deleteTopic(data) {
      let result = false
      this.selectedTopicId = 0
      let i = this.topics.findIndex((e) => {
         e.id == data.id
      })
      this.topics.splice(i,1)

      i = this.selectedSubject.focusTopicIds.indexOf(data.id)
      if (i > -1) {
         result = true
         this.selectedSubject.focusTopicIds.splice(i, 1)
      }
      this.setLocal()
      return result
   }

   //#endregion

   //#region Questions

   _selectedQuestionId = 0
   get selectedQuestionId() {
      return this._selectedQuestionId
   }
   set selectedQuestionId(id) {
      if (this._selectedQuestionId == id) return
      this._selectedQuestionId = id
   }

   _questions = []
   get questions()
   {
      if (!this._questions) this._questions = []
      return this._questions
   }
   set questions(data)
   {
      this._questions = data.length ? data : []
      this.setLocal()
   }

   addQuestion(data) {
      this.selectedQuestionId = data.id
      this.questions.push(data)
      this.questions.sort((a,b) => {
         return a.shortPhrase.localeCompare(b.shortPhrase)
      })
      this.setLocal()
   }

   updateQuestion(data) {
      this.selectedQuestionId = data.id
      let i = this.questions.findIndex((e) => {
         e.id == data.id
      })
      this.questions[i] = data
      this.questions.sort((a,b) => {
         return a.shortPhrase.localeCompare(b.shortPhrase)
      })
      this.setLocal()
   }

   deleteQuestion(data) {
      this.selectedQuestionId = 0
      let i = this.questions.findIndex((e) => {
         e.id == data.id
      })
      this.questions.splice(i,1)
      this.setLocal()
   }

   _question = false
   get question() {
      if (!this._question) {
         this._question = {
            id: 0,
            shortPhrase: '',
            phrase: '',
            answer: ''
         }
      }
      return this._question
   }
   set question(data) {
      if (data) {
         let _id = data.hasOwnProperty('id') ? data.id : 0
         let _shortPhrase = data.hasOwnProperty('shortPhrase') ? data.shortPhrase : ''
         let _phrase = data.hasOwnProperty('phrase') ? data.phrase : ''
         let _answer = data.hasOwnProperty('answer') ? data.answer : ''

         this._question = {
            id: _id,
            shortPhrase: _shortPhrase,
            phrase: _phrase,
            answer: _answer
         }
         this.setLocal()
      }
   }

   //#endregion

   clearTopicsAndQuestions() {
      this.selectedTopicId = 0
      this.topics = []
      this.selectedQuestionId = 0
      this.questions = []
   }

   //#region Browser Local Storage

   getLocal() {
      let local = localStorage.getItem(this.name)
      if (local == null)
      {
         this._currentPage = pages.HOME
         this._quiz = new Quiz()
         this._selectedSubjectId = 0
         this._accountSubjects = []
         this._selectedTopicId = 0
         this._topics = []
         this._selectedQuestionId = 0
         this._questions = []
         this._question = false
      }
      else
      {
         local = JSON.parse(local)
         this._currentPage = local.currentPage
         this._quiz = new Quiz(local.quiz)
         this._selectedSubjectId = local.selectedSubjectId
         this._accountSubjects = local.accountSubjects
         this._selectedTopicId = local.selectedTopicId
         this._topics = local.topics
         this._selectedQuestionId = local.selectedQuestionId
         this._questions = local.questions
         this._question = local.question
      }
      this.setLocal()
   }

   setLocal()
   {
      localStorage.setItem(this.name,this.toJson())
   }

   toJson()
   {
      return `{
         "currentPage": "${this.currentPage}",
         "quiz": ${JSON.stringify(this.quiz)},
         "selectedSubjectId": "${this.selectedSubjectId}",
         "accountSubjects": ${JSON.stringify(this.accountSubjects)},
         "selectedTopicId": "${this.selectedTopicId}",
         "topics": ${JSON.stringify(this.topics)},
         "selectedQuestionId": "${this.selectedQuestionId}",
         "questions": ${JSON.stringify(this.questions)},
         "question": ${JSON.stringify(this.question)}
      }`
   }

   //#endregion
}