import { useState } from 'react'
import './App.css'

interface Todo {
  id: number
  text: string
  completed: boolean
  important: boolean
  urgent: boolean
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos')
    return savedTodos ? JSON.parse(savedTodos) : []
  })
  const [input, setInput] = useState('')
  const [draggedTodoId, setDraggedTodoId] = useState<number | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

  const handleDoubleClick = (todo: Todo) => {
    setEditingTodoId(todo.id)
    setEditingText(todo.text)
  }

  const handleEditBlur = () => {
    if (editingTodoId !== null) {
      handleEditSave(editingTodoId, editingText)
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent, todoId: number) => {
    if (e.key === 'Enter') {
      handleEditSave(todoId, editingText)
    } else if (e.key === 'Escape') {
      setEditingTodoId(null)
      setEditingText('')
    }
  }

  const handleEditSave = (todoId: number, newText: string) => {
    const trimmedText = newText.trim()
    if (trimmedText) {
      setTodos(todos.map(todo =>
        todo.id === todoId ? { ...todo, text: trimmedText } : todo
      ))
    }
    setEditingTodoId(null)
    setEditingText('')
  }

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTodoId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    target.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
  }

  const handleDrop = (e: React.DragEvent, important: boolean, urgent: boolean) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')

    if (draggedTodoId !== null) {
      const updatedTodos = todos.map(todo =>
        todo.id === draggedTodoId
          ? { ...todo, important, urgent }
          : todo
      )
      setTodos(updatedTodos)
      setDraggedTodoId(null)
    }
  }

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (trimmedInput) {
      const numberMatch = trimmedInput.match(/^[1-4]\s*/)
      let todoText = trimmedInput
      let important = false
      let urgent = false

      if (numberMatch) {
        const number = parseInt(numberMatch[0])
        todoText = trimmedInput.substring(numberMatch[0].length)
        
        switch(number) {
          case 1: // 重要且紧急
            important = true
            urgent = true
            break
          case 2: // 重要不紧急
            important = true
            break
          case 3: // 紧急不重要
            urgent = true
            break
          // case 4 或无数字: 不重要不紧急（默认值）
        }
      }

      setTodos([...todos, { 
        id: Date.now(), 
        text: todoText,
        completed: false,
        important: important,
        urgent: urgent
      }])
      setInput('')
    }
  }

  const handleToggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <div className="todo-container">
      <h1>四象限待办事项清单</h1>
      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="添加新的待办事项"
          className="todo-input"
        />
        <button type="submit" className="add-button">添加</button>
      </form>
      <div className="quadrant-container">
        <div
          className="quadrant"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, true, true)}
        >
          <h2>重要且紧急</h2>
          <ul className="todo-list">
            {todos.filter(todo => todo.important && todo.urgent).map(todo => (
              <li
                key={todo.id}
                className="todo-item"
                draggable={editingTodoId !== todo.id}
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDoubleClick={() => handleDoubleClick(todo)}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="todo-checkbox"
                />
                {editingTodoId === todo.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={handleEditBlur}
                    onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                    className="edit-input"
                    autoFocus
                  />
                ) : (
                  <span className={todo.completed ? 'completed' : ''}>{todo.text}</span>
                )}
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="delete-button"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="quadrant"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, true, false)}
        >
          <h2>重要不紧急</h2>
          <ul className="todo-list">
            {todos.filter(todo => todo.important && !todo.urgent).map(todo => (
              <li
                key={todo.id}
                className="todo-item"
                draggable={editingTodoId !== todo.id}
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDoubleClick={() => handleDoubleClick(todo)}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="todo-checkbox"
                />
                {editingTodoId === todo.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={handleEditBlur}
                    onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                    className="edit-input"
                    autoFocus
                  />
                ) : (
                  <span className={todo.completed ? 'completed' : ''}>{todo.text}</span>
                )}
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="delete-button"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="quadrant"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, false, true)}
        >
          <h2>紧急不重要</h2>
          <ul className="todo-list">
            {todos.filter(todo => !todo.important && todo.urgent).map(todo => (
              <li
                key={todo.id}
                className="todo-item"
                draggable={editingTodoId !== todo.id}
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDoubleClick={() => handleDoubleClick(todo)}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="todo-checkbox"
                />
                {editingTodoId === todo.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={handleEditBlur}
                    onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                    className="edit-input"
                    autoFocus
                  />
                ) : (
                  <span className={todo.completed ? 'completed' : ''}>{todo.text}</span>
                )}
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="delete-button"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="quadrant"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, false, false)}
        >
          <h2>不重要不紧急</h2>
          <ul className="todo-list">
            {todos.filter(todo => !todo.important && !todo.urgent).map(todo => (
              <li
                key={todo.id}
                className="todo-item"
                draggable={editingTodoId !== todo.id}
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDoubleClick={() => handleDoubleClick(todo)}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="todo-checkbox"
                />
                {editingTodoId === todo.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={handleEditBlur}
                    onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                    className="edit-input"
                    autoFocus
                  />
                ) : (
                  <span className={todo.completed ? 'completed' : ''}>{todo.text}</span>
                )}
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="delete-button"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
