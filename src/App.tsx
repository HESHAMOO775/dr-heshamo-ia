import { useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { askGemini } from './gemini'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState<{role: string, text: string}[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    onAuthStateChanged(auth, setUser)
  }, [])

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      alert('فشل تسجيل الدخول')
    }
  }

  const handleSend = async () => {
    if (!message.trim()) return
    const userMsg = {role: 'user', text: message}
    setChat(prev => [...prev, userMsg])
    setMessage('')
    setLoading(true)
    try {
      const reply = await askGemini(message)
      setChat(prev => [...prev, {role: 'bot', text: reply}])
    } catch {
      setChat(prev => [...prev, {role: 'bot', text: 'صار خطأ'}])
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="login">
        <h1>دكتور هشامو AI</h1>
        <button onClick={handleLogin}>تسجيل الدخول بجوجل</button>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1>دكتور هشامو AI</h1>
        <button onClick={() => signOut(auth)}>خروج</button>
      </header>
      <div className="chat">
        {chat.map((m, i) => (
          <div key={i} className={m.role}>{m.text}</div>
        ))}
        {loading && <div className="bot">جاري الكتابة...</div>}
      </div>
      <div className="input">
        <input 
          value={message} 
          onChange={e => setMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="اكتب سؤالك..."
        />
        <button onClick={handleSend} disabled={loading}>إرسال</button>
      </div>
    </div>
  )
}

export default App
