// データベース

// nodeのフレームワークexpressをrequire
const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const dbPath = "app/db/database.sqlite3"
const path = require('path')
const bodyParser = require('body-parser')
const { resolve } = require('path')
const { rejects } = require('assert')

// リクエストのbodyをパースする設定
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

// publicディレクトリを静的ファイルのルートディレクトリとする
app.use(express.static(path.join(__dirname, 'public')))

// Get all user...GET
app.get('/api/v1/users', (req, res) => {
  // データベースに接続
  const db = new sqlite3.Database(dbPath)
  
  // 全てのユーザー情報を取得
  db.all('SELECT * FROM users', (err, rows) => {
    res.json(rows)
  })

  // 接続終了
  db.close()
})

// Get a user...GET
app.get('/api/v1/users/:id', (req, res) => {
  const db = new sqlite3.Database(dbPath)
  // user idを取得
  const id = req.params.id
  db.get(`SELECT * FROM users WHERE id = ${id}`, (err,row) => {

    if(!row) {
      // 404...Not Found
      res.status(404).send({error: "Not Found"})
    } else {
      // 200...成功
      res.status(200).json(row)
    }
    
  })

  db.close()
})

// Get following user...GET
app.get('/api/v1/users/:id/following', (req, res) => {
  // Connect database
  const db = new sqlite3.Database(dbPath)
  const id = req.params.id

  db.all(`SELECT * FROM following LEFT JOIN users ON following.followed_id = users.id WHERE following_id = ${id};`, (err, rows) => {
    if (!rows) {
      res.status(404).send({error: "Not Found!"})
    } else {
      res.status(200).json(rows)
    }
  })

  db.close()
})

// Search(部分一致の検索機能)...GET
app.get('/api/v1/search', (req,res) => {
  const db = new sqlite3.Database(dbPath)
  const keyword = req.query.q 

  // %をつけたところはどんなあたいが入ってもいい
  // つまり、前後につけると部分一致
  db.all(`SELECT * FROM users WHERE name LIKE "%${keyword}%" `, (err,rows) => {
    res.json(rows)
  })

  db.close()
})

const run = async (sql, db) => {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if(err) {
        // エラーの処理
        return reject(err)

      } else {
        return resolve()
      }
    })
  })
}

// Create a new user...POST
app.post('/api/v1/users', async (req,res) => {
  
  if(!req.body.name || req.body.name === "") {
    res.status(400).send({error: "ユーザー名が指定されていません。"})
  } else {
    const db = new sqlite3.Database(dbPath)

    // 入力するデータの定数を作る(profile, birthはあってもなくてもいい)
    const name = req.body.name
    const profile = req.body.profile ? req.body.profile : ""
    const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : ""
    
    try {
      await run(
      `INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dateOfBirth}") `,
      db,
      )
      res.status(201).send({message: "新規ユーザーを作成しました。"})
    } catch (e) {
      // e...データベースのエラーメッセージ
      res.status(500).send({error: e})
    }
      db.close()
    }
  })
    
    // Update a users
app.put('/api/v1/users/:id', async (req,res) => {
  // ユーザー情報が指定されているかどうか
  if(!req.body.name || req.body.name === "") {
    res.status(404).send({message: "ユーザー名が指定されていません。"})
  } else {
    const id = req.params.id
    const db = new sqlite3.Database(dbPath)
    
    // 現在のユーザー情報を取得 => 更新したいデータがあったら書き換える
    db.get(`SELECT * FROM users WHERE id=${id} `, async (err,row) => {

      // 指定したidの情報が存在しているか
      if(!row) {
        res.status(404).send({error: "指定されたユーザーが見つかりません"})
      } else {
        const name = req.body.name ? req.body.name : row.name
        const profile = req.body.profile ? req.body.profile : row.profile
        const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : row.date_of_birth
        
        try {
          // 成功した時の処理
          await run(
            // 選択したIDのユーザー情報を更新する関数
            `UPDATE users SET name="${name}", profile="${profile}", date_of_birth="${dateOfBirth}" WHERE id=${id} `,
            db,
            )
            res.status(200).send({message: "ユーザーを更新しました。"})
          } catch(e) {
            // 失敗した時の処理
            res.status(500).send({error: e})
          }
      }
      })
      db.close()
    }
  })
    
// Delete a user data
app.delete('/api/v1/users/:id', async (req,res) => {
  const db = new sqlite3.Database(dbPath)
  const id = req.params.id

  // 現在のユーザー情報を取得 => 更新したいデータがあったら書き換える
  db.get(`SELECT * FROM users WHERE id=${id} `, async (err,row) => {

    // 指定したidの情報が存在しているか
    if(!row) {
      res.status(404).send({error: "指定されたユーザーが見つかりません"})
    } else {
      try {
        await run(
          // 選択したIDのユーザー情報を更新する関数
          `DELETE FROM users WHERE id=${id} `, db)
        res.status(200).send({message: "ユーザーを削除しました。"})
      } catch(e) {
        res.status(500).send({error: e})
      }
    }
  })
  db.close()
})


// localhostが指定されていたらその番号
// されてなかったら3000番
const port = process.env.PORT || 3000
app.listen(port)
console.log("Listen on port" + port)