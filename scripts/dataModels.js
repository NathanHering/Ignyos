class Account {
   constructor(data = {}) {
      this.id = Object.hasOwn(data, 'id') ? data.id : newId(4)
      this.created = Object.hasOwn(data, 'created') ? data.created : new Date().toISOString()
      this.lastUsed = Object.hasOwn(data, 'lastUsed') ? data.lastUsed : new Date().toISOString()
      this.name = Object.hasOwn(data, 'name') ? data.name : ''
      this.settings = Object.hasOwn(data, 'settings') ? new AccountSettings(data.settings) : new AccountSettings()
   }
}

class AccountSettings {
   constructor(data = {}) {
      /**
       * @type {number} defaultQuestionCount The number of questions a quiz will have by default
       */
      this.defaultQuestionCount = Object.hasOwn(data, 'defaultQuestionCount') ? data.defaultQuestionCount : 10
   }
}

class AccountSubject {
   constructor(data = {}) {
      // this.id = Object.hasOwn(data, 'id') ? data.id : newId(4)
      this.accountId = Object.hasOwn(data, 'accountId') ? data.accountId : ''
      this.subjectId = Object.hasOwn(data, 'subjectId') ? data.subjectId : ''
      this.focusTopicIds = Object.hasOwn(data, 'focusTopicIds') ? data.focusTopicIds : []
   }
}

class MetaData {
   constructor(data = {}) {
      this.id = Object.hasOwn(data, 'id') ? data.id : 1
      this.selectedAccountId = Object.hasOwn(data, 'selectedAccountId') ? data.selectedAccountId : ''
   }
}

class Question {
   constructor(data = {}) {
      this.id = Object.hasOwn(data, 'id') ? data.id : newId(4)
      this.topicId = Object.hasOwn(data, 'topicId') ? data.topicId : ''
      this.shortPhrase = Object.hasOwn(data, 'shortPhrase') ? data.shortPhrase : ''
      this.phrase = Object.hasOwn(data, 'phrase') ? data.phrase : ''
      this.answer = Object.hasOwn(data, 'answer') ? data.answer : ''
      this.deletedDate = Object.hasOwn(data, 'deletedDate') ? data.deletedDate : null
   }
}

class QuestionAnswer {
   constructor(data = {}) {
      this.id = Object.hasOwn(data, 'id') ? data.id : newId(4)
      this.quizId = Object.hasOwn(data, 'quizId') ? data.quizId : ''
      this.accountId = Object.hasOwn(data, 'accountId') ? data.accountId : ''
      this.questionId = Object.hasOwn(data, 'questionId') ? data.questionId : ''
      this.answeredDate = Object.hasOwn(data, 'answeredDate') ? data.answeredDate : new Date().toISOString()
      this.answeredCorrectly = Object.hasOwn(data, 'answeredCorrectly') ? data.answeredCorrectly : false
   }
}

class Quiz {
   constructor(data = {})
   {
      this.id = Object.hasOwn(data, 'id') ? data.id : newId(4)
      this.accountId = Object.hasOwn(data, 'accountId') ? data.accountId : ''
      this.completeDate = Object.hasOwn(data, 'completeDate') ? data.completeDate : null
      this.allQuestionIds = Object.hasOwn(data, 'allQuestionIds') ? data.allQuestionIds : []
      this.answeredQuestionIds = Object.hasOwn(data, 'answeredQuestionIds') ? data.answeredQuestionIds : []
   }
}

class Subject {
   constructor(data = {}) {
      this.id = Object.hasOwn(data, 'id') ? data.id : newId(4)
      this.title = Object.hasOwn(data, 'title') ? data.title : ''
      this.deletedDate = Object.hasOwn(data, 'deletedDate') ? data.deletedDate : null
   }
}

class Topic {
   constructor(data = {}) {
      this.id = Object.hasOwn(data, 'id') ? data.id : newId(4)
      this.subjectId = Object.hasOwn(data, 'subjectId') ? data.subjectId : ''
      this.title = Object.hasOwn(data, 'title') ? data.title : ''
      this.deletedDate = Object.hasOwn(data, 'deletedDate') ? data.deletedDate : null
   }
}

//#region DTOs

class SubjectListItem {
   /**
    * Instantiates a new SubjectListItem object
    * @param {AccountSubject} accountSubject The AccountSubject object that contains the focusTopicIds
    * @param {Subject} subject The Subject object that contains the title and id
    */
   constructor(accountSubject, subject) {
      this.id = subject.id
      this.title = subject.title
      this.focusTopicIds = accountSubject.focusTopicIds
   }
}

//#endregion DTOs