class SeedData {
   constructor(sCount = 4, tCount = 4, qCount = 4) {
      this.sCount = sCount
      this.tCount = tCount
      this.qCount = qCount

      this.account = new Account({name:newId(8)}) // N.Hügelhaus
      this.subjects = []
      this.acctSubs = []
      this.topics = []
      this.questions = []

      for (let s = 1; s <= this.sCount; s++) {
         let subject = new Subject({
            title:`${s}`
         })
         this.subjects.push(subject)

         let acctSub = new AccountSubject({
            accountId:this.account.id,
            subjectId:subject.id
         })
         this.acctSubs.push(acctSub)

         for (let t = 1; t <= this.tCount; t++) {
            let topic = new Topic({
               subjectId:subject.id,
               title:`${s}.${t}`
            })
            this.topics.push(topic)

            for (let q = 1; q <= this.qCount; q++) {
               let txt = `${s}.${t}.${q}`
               let question = new Question({
                  topicId:topic.id,
                  shortPhrase:txt,
                  phrase:`Q: ${txt}`
               })
               this.questions.push(question)
            }
         }
      }
   }
   async save() {
      await dbCtx.account.add(this.account)

      this.subjects.forEach(async subject => {
         await dbCtx.subject.add(subject)
      })

      this.acctSubs.forEach(async acctSub => {
         await dbCtx.accountSubject.add(acctSub)
      })

      this.topics.forEach(async topic => {
         await dbCtx.topic.add(topic)
      })

      this.questions.forEach(async question => {
         await dbCtx.question.add(question)
      })
   }
}