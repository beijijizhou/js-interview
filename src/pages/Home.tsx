import { AIChat } from './AIChat'
import JsCompiler from './Complier/JsCompiler'

export default function Home() {
  return (
    <div className="flex w-full">
      <div className="w-1/2">
        <JsCompiler />
      </div>
      <div className="w-1/2">
        <AIChat />
      </div>
    </div>

  )
}
