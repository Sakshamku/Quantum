import { useState, useRef, useEffect, useCallback } from "react";
import { Context } from "./ContextStore";
import runChat from "../config";
import DOMPurify from "dompurify";

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompt, setPrevPrompt] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState(""); // final HTML
    const [displayedData, setDisplayedData] = useState(""); // typing effect HTML
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    const toastTimeout = useRef(null);
    const animationFrameRef = useRef(null);
    const scrollTargetRef = useRef(null);
    const responseCache = useRef(new Map());
    const copyContentMap = useRef(new Map()); // safer way to store code

    // ----------- Scroll Function (optimized) -----------
    const scrollToBottom = useCallback(() => {
        if (scrollTargetRef.current) {
            scrollTargetRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }
    }, []);

    // ----------- Toast Function -----------
    const showToast = (message) => {
        setToast(message);
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToast(null), 3000);
    };

    // ----------- Markdown Parser -----------
    const parseMarkdown = useCallback((text) => {
        const blocks = text.split(/\n\n+/);
        let htmlOutput = "";
        let codeIdCounter = 0;

        const escapeHtml = (unsafe) =>
            unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        for (const block of blocks) {
            // Code blocks
            if (/^```([\w+-]*)/.test(block)) {
                const [langLine, ...codeLines] = block.split("\n");
                const language = langLine.match(/^```([\w+-]*)/)[1] || "";
                const codeContent = codeLines.join("\n").replace(/```$/, "");
                const escapedCode = escapeHtml(codeContent);

                const codeId = `code-${codeIdCounter++}`;
                copyContentMap.current.set(codeId, codeContent);

                htmlOutput += `
                <div class="code-block">
                    <div class="code-header">
                        <span class="language-tag">${language || "code"}</span>
                        <button class="copy-button" data-id="${codeId}">Copy</button>
                    </div>
                    <pre><code>${escapedCode}</code></pre>
                </div>
            `;
                continue;
            }

            // Headings
            if (/^#{1,6}\s/.test(block)) {
                const level = Math.min(6, block.match(/^#+/)[0].length);
                let content = block.replace(/^#+\s*/, "");
                content = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                htmlOutput += `<h${level} class="heading-${level}">${content}</h${level}>`;
                continue;
            }

            // Lists
            const listItems = block.split("\n");
            const isOrdered = /^\s*\d+\.\s/.test(listItems[0]);
            const isUnordered = /^\s*[-*]\s/.test(listItems[0]);
            const isBoldList = listItems.every((item) =>
                /^\s*\*\*.*\*\*\s*$/.test(item)
            );

            if (isOrdered || isUnordered || isBoldList) {
                const listType = isOrdered ? "ol" : "ul";
                const listClass = isOrdered ? "numbered-list" : "bullet-list";

                let listHtml = "";
                for (const item of listItems) {
                    let content = item;
                    if (isBoldList) {
                        content = item.replace(/\*\*(.+?)\*\*/, "$1");
                        listHtml += `<li><strong>${content}</strong></li>`;
                    } else {
                        content = item.replace(/^\s*\d+\.\s|\s*[-*]\s/, "");
                        content = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                        listHtml += `<li>${content}</li>`;
                    }
                }

                htmlOutput += `<${listType} class="${listClass}">${listHtml}</${listType}>`;
                continue;
            }

            // Special blocks
            const specialBlocks = [
                { pattern: /^Note:/i, className: "note-box" },
                { pattern: /^Warning:/i, className: "warning-box" },
                { pattern: /^Tip:/i, className: "tip-box" }
            ];

            const specialBlock = specialBlocks.find((sb) =>
                sb.pattern.test(block)
            );
            if (specialBlock) {
                let content = block.replace(specialBlock.pattern, "");
                content = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                htmlOutput += `<div class="${specialBlock.className}">${content}</div>`;
                continue;
            }

            // Blockquotes
            if (/^>\s/.test(block)) {
                let quoteContent = block.replace(/^>\s*/gm, "");
                quoteContent = quoteContent.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                htmlOutput += `<blockquote>${quoteContent}</blockquote>`;
                continue;
            }

            // Paragraphs
            let processedBlock = block
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // bold first
                .replace(/\*(.+?)\*/g, "<em>$1</em>") // italic
                .replace(/_(.+?)_/g, "<em>$1</em>")
                .replace(/`(.+?)`/g, '<code class="inline-code">$1</code>');

            htmlOutput += `<p>${processedBlock}</p>`;
        }

        return htmlOutput;
    }, []);


    // ----------- Typing Effect (on plain text) -----------
    useEffect(() => {
        if (!resultData || loading) return;

        // Reset displayed data
        setDisplayedData("");
        let index = 0;
        const chars = resultData.split("");

        const typeNext = () => {
            if (index < chars.length) {
                // Build the current string
                const currentString = chars.slice(0, index + 1).join("");
                setDisplayedData(currentString);
                index++;
                animationFrameRef.current = requestAnimationFrame(typeNext);
            }
        };

        animationFrameRef.current = requestAnimationFrame(typeNext);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [resultData, loading]);

    // ----------- Attach Copy Button Events -----------
    useEffect(() => {
        const buttons = document.querySelectorAll(".copy-button");
        buttons.forEach((button) => {
            button.onclick = async (e) => {
                e.preventDefault();
                const id = button.getAttribute("data-id");
                const codeContent = copyContentMap.current.get(id);
                try {
                    await navigator.clipboard.writeText(codeContent);
                    showToast("Code copied to clipboard!");
                } catch {
                    showToast("Failed to copy code");
                }
            };
        });
    }, [resultData]);

    // ----------- Send Prompt -----------
    const onSent = async (prompt) => {
        const normalizedPrompt = (prompt || input).trim();
        if (!normalizedPrompt) {
            setError("Please enter a message");
            return;
        }

        // Check cache
        if (responseCache.current.has(normalizedPrompt)) {
            const cached = responseCache.current.get(normalizedPrompt);
            setResultData(cached);
            setShowResult(true);
            setRecentPrompt(normalizedPrompt);
            setPrevPrompt((prev) => [...prev, normalizedPrompt]);
            return;
        }

        setError(null);
        setResultData("");
        setDisplayedData("");
        setLoading(true);
        setShowResult(true);
        setRecentPrompt(normalizedPrompt);
        setPrevPrompt((prev) => [...prev, normalizedPrompt]);

        try {
            const apiTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("API timeout")), 30000)
            );

            const response = await Promise.race([
                runChat(normalizedPrompt),
                apiTimeout
            ]);

            if (!response || !response.trim()) {
                throw new Error("Empty response");
            }

            const htmlOutput = parseMarkdown(response);
            const sanitizedOutput = DOMPurify.sanitize(htmlOutput);

            setResultData(sanitizedOutput);
            responseCache.current.set(normalizedPrompt, sanitizedOutput);
            setInput("");
        } catch (err) {
            const errorMsg =
                err.message === "API timeout"
                    ? "Request timed out. Please try again."
                    : "Failed to get response. Please try again.";

            setError(errorMsg);
            console.error("API call failed:", err);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    };

    // ----------- Context Value -----------
    const contextValue = {
        prevPrompt,
        setPrevPrompt,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        setShowResult,
        loading,
        resultData,
        displayedData,
        input,
        setInput,
        error,
        toast,
        scrollTargetRef,
        scrollToBottom
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;