import React, { useContext, useState } from 'react'
import './sidebar.css';
import { assets } from '../../assets/assets'
import { Context } from '../../Context/Context';

export const Sidebar = () => {
    const [extended, setExtended] = useState(false);
    const { onSent, prevPrompt, setRecentPrompt, setShowResult, setInput } = useContext(Context);

    const loadPrompt = async (prompt) => {
        setRecentPrompt(prompt);
        setInput(prompt);  // Set the input to the selected prompt
        setShowResult(true);  // Ensure results are shown
        await onSent(prompt);  // Send the prompt
    }

    return (
        <div className={`sidebar ${extended ? 'extended' : ''}`}>
            <div className="top">
                <div className="top-content">
                    <div className="menu-container">
                        <img
                            className="menu"
                            src={assets.menu_icon}
                            alt="Menu"
                            onClick={() => setExtended(prev => !prev)}
                        />
                    </div>

                    <div className="new-chat" onClick={() => window.location.reload()}>
                        <img src={assets.plus_icon} alt="New chat" />
                        {extended ? <p>New chat</p> : null}
                    </div>

                    {extended && (
                        <div className="recent-container">
                            <p className='recent-title'>Recent</p>
                            <div className="recent">
                                {prevPrompt.map((prompt, index) => (
                                    <div
                                        key={index}
                                        onClick={() => loadPrompt(prompt)}
                                        className='recent-entry'
                                    >
                                        <img src={assets.message_icon} alt="History" />
                                        <p>{prompt.slice(0, 18)} ...</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bottom">
                <div className="bottom-item">
                    <img src={assets.question_icon} alt="Help" />
                    {extended ? <p>Help</p> : null}
                </div>
                <div className="bottom-item">
                    <img src={assets.history_icon} alt="Activity" />
                    {extended ? <p>Activity</p> : null}
                </div>
                <div className="bottom-item">
                    <img src={assets.setting_icon} alt="Settings" />
                    {extended ? <p>Settings</p> : null}
                </div>
            </div>
        </div>
    )
}