const stores = {
   ACCOUNT: "account",
   ACCOUNT_SUBJECT: "accountSubject",
   METADATA: "metaData",
   QUESTION: "question",
   QUESTION_ANSWER: "questionAnswer",
   QUIZ: "quiz",
   SUBJECT: "subject",
   TOPIC: "topic"
}

let db;
const request = indexedDB.open("ignyos.funtility", 1);

request.onupgradeneeded = function(event) {
   db = event.target.result;

   const accountStore = db.createObjectStore("account", { keyPath: "id" });
   accountStore.createIndex("name", "name", { unique: true });

   const accountSubjectStore = db.createObjectStore("accountSubject", { keyPath: "subjectId" });
   accountSubjectStore.createIndex("accountId", "accountId", { unique: false });

   const metaDataStore = db.createObjectStore("metaData", { keyPath: "id" });
   metaDataStore.add({ id: 1, selectedAccountId: 0 });

   const questionStore = db.createObjectStore("question", { keyPath: "id" });
   questionStore.createIndex("topicId", "topicId", { unique: false });

   const questionAnswerStore = db.createObjectStore("questionAnswer", { keyPath: "id" });
   questionAnswerStore.createIndex("quizId", "quizId", { unique: false });

   const quizStore = db.createObjectStore("quiz", { keyPath: "id" });
   quizStore.createIndex("accountId", "accountId", { unique: false });

   const subjectStore = db.createObjectStore("subject", { keyPath: "id" });
   subjectStore.createIndex("accountId", "accountId", { unique: false });

   const topicStore = db.createObjectStore("topic", { keyPath: "id" });
   topicStore.createIndex("subjectId", "subjectId", { unique: false });
};

request.onsuccess = function(event) {
   db = event.target.result;
};

request.onerror = function(event) {
  console.log("Database error: ", event.target.errorCode);
};

function getObjectStore(storeName, mode) {
   const transaction = db.transaction(storeName, mode);
   return transaction.objectStore(storeName);
}

function ensureDbReady() {
   return new Promise((resolve, reject) => {
      if (db) {
         resolve();
      } else {
         const interval = setInterval(() => {
            if (db) {
               clearInterval(interval);
               resolve();
            }
         }, 100);
      }
   });
}

const dbCtx = {
   account: {
      byName(name) {
         try {
            const store = getObjectStore(stores.ACCOUNT, "readonly");
            const index = store.index("name");
            const request = index.get(name);
            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  if (event.target.result) {
                     resolve(event.target.result);
                  } else {
                     reject("Account not found");
                  }
               };
               request.onerror = function(event) {
                  reject("Account not found");
               };
            });
         } catch (error) {
            console.error(error);
         }
      },
      async exists(name) {
         try {
            await this.byName(name);
            return true;
         } catch (error) {
            return false;
         }
      },
      async add(account) {
         try {
            const store = getObjectStore(stores.ACCOUNT, "readwrite");
            const request = store.add(account);

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve();
               };

               request.onerror = function(event) {
                  reject("Account not added");
               };
            });
         } catch (error) {
            console.error(error);
         }
      },
      async current() {
         try {
            const metaDataStore = getObjectStore(stores.METADATA, "readonly");
            const metaDataRequest = metaDataStore.get(1);

            const metaData = await new Promise((resolve, reject) => {
               metaDataRequest.onsuccess = function(event) {
                  resolve(event.target.result);
               };
               metaDataRequest.onerror = function(event) {
                  reject("MetaData not found");
               };
            });

            const accountStore = getObjectStore(stores.ACCOUNT, "readonly");
            const accountRequest = accountStore.get(metaData.selectedAccountId);

            return await new Promise((resolve, reject) => {
               accountRequest.onsuccess = function(event) {
                  resolve(event.target.result);
               };
               accountRequest.onerror = function(event) {
                  reject("Selected account not found");
               };
            });
         } catch (error) {
            console.error(error);
            return new Account();
         }
      },
      async all() {
         try {
            const accountStore = getObjectStore(stores.ACCOUNT, "readonly");
            const accountRequest = accountStore.getAll();

            return await new Promise((resolve, reject) => {
               accountRequest.onsuccess = function(event) {
                  resolve(event.target.result);
               };
               accountRequest.onerror = function(event) {
                  reject("Selected account not found");
               };
            });
         } catch (error) {
            console.error(error);
            throw error;
         }
      },
      async delete(accountId) {
         try {
            const store = getObjectStore(stores.ACCOUNT, "readwrite");
            const request = store.delete(accountId);

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve();
               };

               request.onerror = function(event) {
                  reject("Account not deleted");
               };
            });
         } catch (error) {
            console.error(error);
         }
      },
      async update(account) {
         try {
            const store = getObjectStore(stores.ACCOUNT, "readwrite");
            const request = store.put(account);

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve();
               };

               request.onerror = function(event) {
                  reject("Account not updated");
               };
            });
         } catch (error) {
            console.error(error);
         }
      }
   },
   accountSubject: {
      /**
       * Creates an empty collection of SubjectListItem objects for the given account id.
       * Then looks up all the subjects for each AccountSubject. Then instantiates a
       * SubjectListItem object for each subject by passing in the accountSubject to the
       * constructor. Then returns the collection of SubjectListItem objects.
       * @param {*} accountId 
       * @returns {[SubjectListItem]}
       */
      async list(accountId) {
         try {
            const accountSubjects = await this.all(accountId);
            const subjects = await dbCtx.subject.all(accountId);

            return accountSubjects.map(accountSubject => {
               const subject = subjects.find(subject => subject.id === accountSubject.subjectId);
               return new SubjectListItem(accountSubject, subject);
            });
         } catch (error) {
            console.error(error);
            return [];
         }
      },
      async all(acctId) {
         try {
            const store = getObjectStore(stores.ACCOUNT_SUBJECT, "readonly");
            const index = store.index("accountId");
            const request = index.getAll(acctId);

            return await new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve(event.target.result);
               };

               request.onerror = function(event) {
                  resolve([]);
               };
            });
         } catch (error) {
            console.error(error);
            return [];
         }
      },
      async add(accountSubject) {
         try {
            const store = getObjectStore(stores.ACCOUNT_SUBJECT, "readwrite");
            const request = store.add(accountSubject);

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve();
               };

               request.onerror = function(event) {
                  reject("AccountSubject not added");
               };
            });
         } catch (error) {
            console.error(error);
         }
      },
      async update(accountSubject) {
         console.log("Updating account subject", accountSubject);
         try {
            const store = getObjectStore(stores.ACCOUNT_SUBJECT, "readwrite");
            const request = store.put(accountSubject);

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve();
               };

               request.onerror = function(event) {
                  reject("AccountSubject not updated");
               };
            });
         } catch (error) {
            console.error(error);
         }
      },
      /**
       * Finds the AccountSubject by AccountId and SubjectId, then removes the AccountSubject from the store.
       * @param {*} accountId 
       * @param {*} subjectId 
       * @returns 
       */
      async delete(accountId, subjectId) {
         // console.log("Deleting account subject", accountId, subjectId);
         try {
            const store = getObjectStore(stores.ACCOUNT_SUBJECT, "readwrite");
            const index = store.index("accountId");
            const request = index.openCursor(IDBKeyRange.only(accountId));

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  const cursor = event.target.result;
                  if (cursor) {
                     if (cursor.value.subjectId === subjectId) {
                        store.delete(cursor.value.id);
                        resolve();
                     } else {
                        cursor.continue();
                     }
                  } else {
                     reject("AccountSubject not found");
                  }
               };

               request.onerror = function(event) {
                  reject("AccountSubject not found");
               };
            });
         } catch (error) {
            console.error(error);
         }
      }
   },
   metadata: {
      /**
       * Gets the MetaData from the metadata store, then updates the selected account id.
       * @param {*} accountId The account id to set as the selected account.
       * @returns null
       */
      async setSelectedAccountId(accountId) {
         try {
            await ensureDbReady();
            const store = getObjectStore(stores.METADATA, "readwrite");
            const request = store.get(1);

            request.onsuccess = function(event) {
               const metaData = event.target.result;
               metaData.selectedAccountId = accountId;
               store.put(metaData);
            };
         } catch (error) {
            console.error(error);
         }
      },
   },
   question: {
      /**
       * Only returns the questions that have not been deleted.
       * @param {*} topicId 
       * @returns 
       */
      async all(topicId) {
         try {
            const store = getObjectStore(stores.QUESTION, "readonly");
            const index = store.index("topicId");
            const request = index.getAll(topicId);

            return await new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve(event.target.result.filter(question => !question.deletedDate));
               };

               request.onerror = function(event) {
                  resolve([]);
               };
            });
         } catch (error) {
            console.error(error);
            return [];
         }
      },
      async get(id) {
         try {
            const store = getObjectStore(stores.QUESTION, "readonly");
            const request = store.get(id);

            return await new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve(event.target.result);
               };

               request.onerror = function(event) {
                  resolve(false);
               };
            });
         } catch (error) {
            console.error(error);
            return new Question();
         }
      },
      async exists(id) {
         try {
            return await this.get(id) ? true : false;
         } catch (error) {
            return false;
         }
      },
      async add(question) {
         try {
            const store = getObjectStore(stores.QUESTION, "readwrite");
            const request = store.add(question);

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve();
               };

               request.onerror = function(event) {
                  reject("Question not added");
               };
            });
         } catch (error) {
            console.error(error);
         }
      },
      async update(question) {
         try {
            const store = getObjectStore(stores.QUESTION, "readwrite");
            const request = store.put(new Question(question));

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve(true);
               };

               request.onerror = function(event) {
                  resolve(false);
               };
            });
         } catch (error) {
            console.error(error);
            resolve(false);
         }
      }
   },
   quiz: {
      /**
       * Get the currently open quiz that matches the user account id and has not been completed.
       * Returns false if no quiz is found.
       * @param {string} acctId - The account of the active user.
       * @returns {Quiz} The active quiz or false.
       */
      async open(acctId) {
         try {
            const store = getObjectStore(stores.QUIZ, "readonly");
            const index = store.index("accountId");
            const request = index.get(acctId);

            return await new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  const quiz = event.target.result;
                  if (quiz && !quiz.completeDate) {
                     resolve(quiz);
                  } else {
                     resolve(false);
                  }
               };

               request.onerror = function(event) {
                  reject("Quiz not found");
               };
            });
         } catch (error) {
            console.error(error);
            return false;
         }
      }
   },
   subject: {
      /**
       * First gets all the AccountSubject associated with the account id. Then gets all the subjects
       * based on the subject ids from the AccountSubjects.  
       * @param {*} acctId 
       * @returns 
       */
      async all(acctId) {
         try {
            const accountSubjects = await dbCtx.accountSubject.all(acctId);
            const subjectIds = accountSubjects.map(as => as.subjectId);
            const store = getObjectStore(stores.SUBJECT, "readonly");
            const request = store.getAll();

            return await new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  const subjects = event.target.result;
                  resolve(subjects.filter(subject => subjectIds.includes(subject.id)));
               };

               request.onerror = function(event) {
                  reject("Subjects not found");
               };
            });
         } catch (error) {
            console.error(error);
            return [];
         }
      },
      async add(subject) {
         try {
            const store = getObjectStore(stores.SUBJECT, "readwrite");
            const request = store.add(subject);

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve();
               };

               request.onerror = function(event) {
                  reject("Subject not added");
               };
            });
         } catch (error) {
            console.error(error);
         }
      },
      async update(subject) {
         try {
            const store = getObjectStore(stores.SUBJECT, "readwrite");
            const request = store.put(new Subject(subject));

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve(true);
               };

               request.onerror = function(event) {
                  resolve(false);
               };
            });
         } catch (error) {
            console.error(error);
            resolve(false);
         }
      }
   },
   topic: {
      all(subjectId) {
         try {
            const store = getObjectStore(stores.TOPIC, "readonly");
            const index = store.index("subjectId");
            const request = index.getAll(subjectId);

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve(event.target.result);
               };

               request.onerror = function(event) {
                  resolve([]);
               };
            });
         } catch (error) {
            console.error(error);
            return [];
         }
      },
      async add(topic) {
         try {
            const store = getObjectStore(stores.TOPIC, "readwrite");
            const request = store.add(topic);

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve();
               };

               request.onerror = function(event) {
                  reject("Topic not added");
               };
            });
         } catch (error) {
            console.error(error);
         }
      },
      async update(topic) {
         try {
            const store = getObjectStore(stores.TOPIC, "readwrite");
            const request = store.put(new Topic(topic));

            return new Promise((resolve, reject) => {
               request.onsuccess = function(event) {
                  resolve(true);
               };

               request.onerror = function(event) {
                  resolve(false);
               };
            });
         } catch (error) {
            console.error(error);
            resolve(false);
         }
      }
   }
}
