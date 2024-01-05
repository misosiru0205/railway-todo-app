import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import { useNavigate, useParams } from 'react-router-dom'
import { url } from '../const'
import { Header } from '../components/Header'
import './editTask.scss'

export function EditTask() {
  const navigate = useNavigate()
  const { listId, taskId } = useParams()
  const [cookies] = useCookies()
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [isDone, setIsDone] = useState()
  const [limit, setLimit] = useState('') //期限の再設定用ステート
  const [nowTime, setNowtime] = useState('') //現在時刻のstate
  const [errorMessage, setErrorMessage] = useState('')
  const handleTitleChange = (e) => setTitle(e.target.value)
  const handleDetailChange = (e) => setDetail(e.target.value)
  const handleIsDoneChange = (e) => setIsDone(e.target.value === 'done')
  const handlelimitChange = (e) => {
    //再設定した期限の取得とset
    setLimit(`${e.target.value}:00Z`)
  }
  const onUpdateTask = () => {
    console.log(isDone)
    const data = {
      title,
      detail,
      done: isDone,
      limit,
    }

    if (Date.now() < new Date(limit) - 3600000 * 9 || isDone === true) {
      //期限切れ日時防止用 と完了時に通せるようにする 
      axios
        .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          console.log(res.data)
          navigate('/')
        })
        .catch((err) => {
          setErrorMessage(`更新に失敗しました。${err}`)
        })
    } else {
      setErrorMessage(`更新に失敗しました。過去の日時を入力しないでください`)
    }
  }

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/')
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`)
      })
  }

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data
        setTitle(task.title)
        setDetail(task.detail)
        setIsDone(task.done)
        setLimit(task.limit) //受け取ったタスクの期限をセット
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`)
      })
  }, [])

  useEffect(() => {
    //現在時刻の取得
    const timeNow = () => {
      const LocalSeconds = Date.now()
      const LocalTime = new Date(LocalSeconds)
      const year = LocalTime.getFullYear() //年の変換
      const month = `0${LocalTime.getMonth() + 1}`.slice(-2) //月の変換と0埋め
      const date = `0${LocalTime.getDate()}`.slice(-2) //日の変換と0埋め
      const hours = `0${LocalTime.getHours()}`.slice(-2) //時の変換と0埋め
      const minutes = `0${LocalTime.getMinutes()}`.slice(-2) //分の変換と0埋め
      setNowtime(`${year}-${month}-${date}T${hours}:${minutes}`) //stateへの更新
    }

    const val = setInterval(() => {
      // 1秒ごとにdatenowの更新
      timeNow()
    }, 1000)

    return () => clearInterval(val)
  }, [])

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <label>期限変更</label>
          {/**期限変更用 受け取ったlimitを使って最初の期限を表示 */}
          <br />
          <input
            type="datetime-local"
            min={nowTime}
            value={limit.slice(0, 16)}
            onChange={handlelimitChange}
            className="edit-task-limit"
          />
          <br />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? 'checked' : ''}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? 'checked' : ''}
            />
            完了
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  )
}
