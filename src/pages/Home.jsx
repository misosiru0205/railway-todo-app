import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import axios from 'axios'
import { Header } from '../components/Header'
import { url } from '../const'
import './home.scss'

export function Home() {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo') // todo->未完了 done->完了
  const [lists, setLists] = useState([])
  const [selectListId, setSelectListId] = useState()
  const [tasks, setTasks] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [cookies] = useCookies()
  const [nowtime, setNowtime] = useState('') //時間表示用、無くてもいい
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value)
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data)
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`)
      })
  }, [])

  useEffect(() => {
    const listId = lists[0]?.id
    if (typeof listId !== 'undefined') {
      setSelectListId(listId)
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks)
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`)
        })
    }
  }, [lists])

  const handleSelectList = (id) => {
    setSelectListId(id)
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks)
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`)
      })
  }

  useEffect(() => { //現在時刻取得用、別に無くてもいい
    function setTime() {
      const LocalSeconds = Date.now()
      const LocalTime = new Date(LocalSeconds)
      setNowtime(
        `現在時刻 : ${LocalTime.getFullYear()}-${
          LocalTime.getMonth() + 1
        }-${LocalTime.getDate()}  ${LocalTime.getHours()}:${LocalTime.getMinutes()}:${LocalTime.getSeconds()}`
      )
    }

    const val = setInterval(() => {
      setTime()
    }, 1000)

    return () => clearInterval(val)
  }, [])

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab" role="tablist"/*ロールの追加*/>
            {lists.map((list, key) => {
              const isActive = list.id === selectListId
              return (
                <li//ロールの追加
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  role="presentation"
                  key={key}
                >
                  <button //buttonとロールの追加 clickイベントの移動
                    aria-label={list.title}
                    role="tab"
                    className="list-tab-button"
                    onClick={() => handleSelectList(list.id)}
                  >
                    {list.title}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <p>{nowtime}</p>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

// 表示するタスク
function Tasks(props) {
  const { tasks, selectListId, isDoneDisplay } = props
  if (tasks === null) return <></>

  if (isDoneDisplay === 'done') {
    return (
      <ul>
        {tasks
          .filter((task) => task.done === true)
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                {task.done ? '完了' : '未完了'}
              </Link>
            </li>
          ))}
      </ul>
    )
  }

  //日時表示変換
  function TaskLimit(taskLimit) {
    const param = new Date(taskLimit) - 3600000 * 9 //受け取ったlimitはUTCなので―9時間分にしておく
    const limit = new Date(param)//日本時に変換
    const year = limit.getFullYear()
    const month = `0${limit.getMonth() + 1}`.slice(-2)//0を足し、sliceで右から二つの数を取り出す
    const date = `0${limit.getDate()}`.slice(-2)
    const hours = `0${limit.getHours()}`.slice(-2)
    const minutes = `0${limit.getMinutes()}`.slice(-2)
    return `期限 : ${year}-${month}-${date}  ${hours}:${minutes}`//ユーザーに見やすいように表示
  }

  function TimeLeft(taskLimit) {//残り期限用
    const LimitSeconds = new Date(taskLimit) - 3600000 * 9
    const LocalSeconds = Date.now()
    const LeftSeconds = Math.floor((LimitSeconds - LocalSeconds) / 1000)
    const seconds = `0${Math.floor(LeftSeconds % 60)}`.slice(-2)
    const minutes = `0${Math.floor((LeftSeconds / 60) % 60)}`.slice(-2)
    const hours = Math.floor((LeftSeconds / 60 / 60) % 24)
    const date = Math.floor(LeftSeconds / 60 / 60 / 24)

    if (LimitSeconds > LocalSeconds) {
      if (date === 0) {
        return `期限まで ${hours}:${minutes}:${seconds}`
      } else {
        return `期限まで ${date}日${`0${hours}`.slice(
          -2
        )}:${minutes}:${seconds}`
      }
    } else {
      return '期限切れ'
    }
  }

  return (
    <ul>
      {tasks
        .filter((task) => task.done === false)
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              {task.done ? '完了' : '未完了'}
              <br />
              {TaskLimit(task.limit)}{/**タスク期限用 */}
              <br />
              {TimeLeft(task.limit)}{/**残り時間用 */}
            </Link>
          </li>
        ))}
    </ul>
  )
}
