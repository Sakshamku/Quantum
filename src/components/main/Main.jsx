import React, { useContext, useState, useEffect, useRef } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../Context/Context'


export const Main = () => {

    const {
        onSent,
        recentPrompt,
        showResult,
        loading,
        displayedData,
        input,
        setInput,
    } = useContext(Context);

    const resultContainerRef = useRef(null);

    // Auto-scroll to bottom when new content is added
    useEffect(() => {
        if (resultContainerRef.current) {
            resultContainerRef.current.scrollTop = resultContainerRef.current.scrollHeight;
        }
    }, [displayedData, loading]);

    return (
        <div className='main'>
            <div className="nav">
                <p>Quantum</p>
                <img src={assets.user_icon} alt="" />
            </div>

            <div className="main-container">
                {!showResult ? (
                    <>
                        <div className="greet">
                            <p><span>Hello, Learner.</span></p>
                            <p>How can I help you today?</p>
                        </div>
                        <div className="cards">
                            <div
                                className="card"
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    onSent("Suggest beautiful places to see on an upcoming road trip")
                                }}
                            >
                                <p>Suggest beautiful places to see on an upcoming road trip</p>
                                <img src={assets.compass_icon} alt="" />
                            </div>
                            <div className="card" onClick={() => onSent("Briefly summarize this concept: urban planning")}>
                                <p>Briefly summarize this concept: urban planning</p>
                                <img src={assets.bulb_icon} alt="" />
                            </div>
                            <div className="card" onClick={() => onSent("Brainstorm team bonding activities for our retreat")}>
                                <p>Brainstorm team bonding activities for our retreat</p>
                                <img src={assets.message_icon} alt="" />
                            </div>
                            <div className="card" onClick={() => onSent("Improve the readability of the following code")}>
                                <p>Improve the readability of the following code</p>
                                <img src={assets.code_icon} alt="" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className='result'>
                        <div className="result-title">
                            <img src={assets.user_icon} alt="" />
                            <p>{recentPrompt}</p>
                        </div>
                        <div
                            className="result-data"
                            ref={resultContainerRef}
                        >
                            <div className="gemini-response">
                                <div className="response-content">
                                    {loading ? (
                                        <div className="quantum-loader">
                                            <div className="quantum-field">
                                                <div className="particle particle-1"></div>
                                                <div className="particle particle-2"></div>
                                                <div className="particle particle-3"></div>
                                                <div className="particle particle-4"></div>
                                                <div className="particle particle-5"></div>
                                            </div>
                                            <div className="loader-text">Thinking...</div>
                                        </div>
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: displayedData }} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Moved outside main-container */}
            <div className="main-bottom">
                <div className="search-box">
                    <input
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        type="text"
                        placeholder='Enter a prompt here'
                    />
                    <div className='search-icons'
                        onKeyDown={(e) => {
                            // Trigger onSent when Enter is pressed and input exists
                            if (e.key === 'Enter' && input) {
                                onSent();
                                e.preventDefault(); // Prevent form submission/newline insertion
                            }
                        }}
                    >
                        {input ? (
                            <img className='send-button'
                                onClick={() => onSent()}
                                src={assets.send_icon}
                                alt="Send"
                            />
                        ) : null}
                    </div>

                </div>
                <p className='bottom-info'>
                    I aim to be accurate, but may be wrong or incomplete — please verify important details with trusted sources.
                </p>
            </div>
        </div >
    )
}