import { AIChat } from './AIChat'
import JsCompiler from './Complier/JsCompiler'

export default function Home() {
  return (
    <div>Home
      <JsCompiler />
      <AIChat />
    </div>
  )
}
