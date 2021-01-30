//即時関数でモジュール化
const usersModule = (() => {
  const BASE_URL = "http://localhost:3000/api/v1/users"

  // ヘッダーの設定
  const headers = new Headers()
  // ヘッダーをJSON形式に
  headers.set("Content-type", "application/json")

  const handleError = async (res) => {
    // JsonをJavaScriptの形式に
    const resJson = await res.json()

    // ステータスコードの違い
     switch (res.status) {
      case 200:
        alert(resJson.message)
        window.location.href = "/"
        break;
      case 201:
        alert(resJson.message)
        window.location.href = "/"
        break;
      case 400:
        // リクエストのパラメータ間違い
        alert(resJson.error)
        break;
      case 404:
        // 指定したリソースが見つからない
        alert(resJson.error)
        break;
      case 500:
        // サーバーの内部エラー
        alert(resJson.error)
        break;
      default:
        alert("何らかのエラーが発生しました。")
        break;
    }
  }

  return {
    fetchAllUsers: async () => {
      // fetchではURLのレスポンスを取得できる
      const res = await fetch(BASE_URL)
      // json形式のresをJavascriptで扱えるようにする
      const users = await res.json()

      for(let i=0; i < users.length; i++) {
        const user = users[i]
        const body = `<tr>
                      <td>${user.id}</td>
                      <td>${user.name}</td>
                      <td>${user.profile}</td>
                      <td>${user.date_of_birth}</td>
                      <td>${user.created_at}</td>
                      <td>${user.updated_at}</td>
                      <td>
                      <a class="btn btn-outline-secondary" href="edit.html?uid=${user.id}" role="button">編集</a>
                      </td>
                     </tr> `

        document.getElementById('users-list').insertAdjacentHTML('beforeend', body)
      }
    },

    creteUsers: async () => {
      const name = document.getElementById("name").value
      const profile = document.getElementById("profile").value
      const dateOfBirth = document.getElementById("date_of_birth").value

      const body = {
        name: name,
        profile: profile,
        date_of_birth: dateOfBirth
      }

      // POSTメソッドを作る
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: headers,
        // JSON形式に変換して渡す
        body: JSON.stringify(body)
      })

      return handleError(res)
      
    },

    setExtingvalue: async (uid) => {
      const res = await fetch(BASE_URL + "/" + uid)
      const resJson = await res.json()

      document.getElementById("name").value = resJson.name
      document.getElementById("profile").value = resJson.profile
      document.getElementById("date_of_birth").value = resJson.date_of_birth
    },

    saveUsers: async (uid) => {
      const name = document.getElementById("name").value
      const profile = document.getElementById("profile").value
      const dateOfBirth = document.getElementById("date_of_birth").value

      const body = {
        name: name,
        profile: profile,
        date_of_birth: dateOfBirth
      }

      // POSTメソッドを作る
      const res = await fetch(BASE_URL + "/" + uid, {
        method: "PUT",
        headers: headers,
        // JSON形式に変換して渡す
        body: JSON.stringify(body)
      })

      return handleError(res)

    },
    deleteUsers: async (uid) => {
      const ret = window.confirm("このユーザーを削除しますか？")

      if (!ret) {
        return false
      } else {
        const res = await fetch(BASE_URL + "/" + uid, {
          method: "DELETE",
          headers: headers
          // DELETEはbodyがいらない
        })
       return handleError(res)

      }
    }
  }
})()