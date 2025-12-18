import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography, Box } from "@mui/material";

interface ChatMessageProps {
    text: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ text }) => {
    return (
        <Box
            sx={{
                "& pre": {
                    backgroundColor: "#f5f7fa",
                    padding: 1,
                    borderRadius: 1,
                    overflowX: "auto",
                },
                "& code": {
                    backgroundColor: "#eef1f5",
                    padding: "2px 4px",
                    borderRadius: 0.5,
                    fontSize: "0.85em",
                },
                "& table": {
                    borderCollapse: "collapse",
                },
                "& th, & td": {
                    border: "1px solid #ddd",
                    padding: "6px 8px",
                },
            }}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => (
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {children}
                        </Typography>
                    ),
                }}
            >
                {text}
            </ReactMarkdown>
        </Box>
    );
};