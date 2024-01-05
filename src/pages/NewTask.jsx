import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import axios from 'axios'
import { url } from '../const'
import { Header } from '../components/Header'
import './newTask.scss'
import { useNavigate } from 'react-router-dom'

export function NewTask() {
  const [selectListId, setSelectListId] = useState()
  const [lists, setLists] = useState([])
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [limit, setLimit] = useState('') //期限用のstate
  const [nowTime, setNowtime] = useState('') //現在時刻のstate
  const [errorMessage, setErrorMessage] = useState('')
  const [cookies] = useCookies()
  const navigate = useNavigate()
  const handleTitleChange = (e) => setTitle(e.target.value)
  const handleDetailChange = (e) => setDetail(e.target.value)
  const handleSelectList = (id) => setSelectListId(id)
  const handlelimitChange = (e) => {
    //期限設定の取得とset
    setLimit(`${e.target.value}:00Z`)
  }

  const onCreateTask = () => {
    const data = {
      title,
      detail,
      done: false,
      limit, //期限
    }

    if (Date.now() < new Date(limit) - 3600000 * 9) {
      axios
        .post(`${url}/lists/${selectListId}/tasks`, data, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then(() => {
          navigate('/')
        })
        .catch((err) => {
          setErrorMessage(`タスクの作成に失敗しました。${err}`)
        })
    } else {
      setErrorMessage(
        `タスクの作成に失敗しました。過去の日時を入力しないでください`
      )
    }
  }

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data)
        setSelectListId(res.data[0]?.id)
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`)
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
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label>リスト</label>
          <br />
          <select
            onChange={(e) => handleSelectList(e.target.value)}
            className="new-task-select-list"
          >
            {lists.map((list, key) => (
              <option key={key} className="list-item" value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          <br />
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="new-task-title"
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="new-task-detail"
          />
          <br />
          <label>期限設定</label>
          <br />
          <input
            type="datetime-local"
            min={nowTime}
            onChange={handlelimitChange}
            className="new-task-limit"
          />
          <br />
          <button
            type="button"
            className="new-task-button"
            onClick={onCreateTask}
          >
            作成
          </button>
        </form>
      </main>
    </div>
  )
}
