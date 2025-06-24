
import { Message, useGeminiChat } from './useGeminiChat';

export default function MessageComponent(msg: Message) {
    const {
        messages
    } = useGeminiChat();
    const handleEdit = (id: number) => {
        // Implement your edit logic here
        console.log(`Edit message with ID: `, messages[id]);
    };
    return (
        <>
            <div className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed">
                {msg.content}
            </div>
            {msg.role === 'user' && <button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1 rounded-md shadow-sm"
                onClick={() => handleEdit(msg.id!)}
            >
                Edit
            </button>}
        </>
    )
}
