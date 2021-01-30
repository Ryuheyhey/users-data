const indexModule = (() => {
  const path = window.location.pathname 

  switch(path) {
    case "/":
      // 検索ボタンをクリックした時の処理
        document.getElementById('search-btn').addEventListener('click', () => {return searchModule.searchUsers()})

        // UsersModuleのfetchAllUsersメソッドを実行
        return usersModule.fetchAllUsers() 

    case "/create.html":
      // 作成ボタンをクリックした時の処理
        document.getElementById('save-btn').addEventListener('click', () => {return usersModule.creteUsers()})

        document.getElementById('cancel-btn').addEventListener('click', () => {return window.location.href="/"})

        break;

      case "/edit.html":
        // ?id=のあとのuidを取得
        const uid = window.location.search.split("?uid=")[1]

        
        document.getElementById('save-btn').addEventListener('click', () => {return usersModule.saveUsers(uid)})
        
        document.getElementById('cancel-btn').addEventListener('click', () => {return window.location.href="/"})
        
        document.getElementById('delete-btn').addEventListener('click', () => {return usersModule.deleteUsers(uid)})
        
        return usersModule.setExtingvalue(uid)

    default:
    break;
  }

})()