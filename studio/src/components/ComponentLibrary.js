// ============================================================
// VIBEAI – COMPONENT LIBRARY
// ============================================================
/**
 * Draggable Component Library für App Builder
 * 
 * Features:
 * - Vorgefertigte UI Components
 * - Drag & Drop Support
 * - Component Templates
 * - Kategorisierung
 * 
 * Components:
 * - Layout: Container, Row, Column, Card
 * - Input: Button, Input, Checkbox, Select
 * - Display: Text, Heading, Image, Icon
 * - Navigation: Navbar, Sidebar, Tabs
 */

export const COMPONENT_LIBRARY = {
    layout: [
        {
            type: "container",
            label: "Container",
            icon: "📦",
            description: "Box container for grouping",
            defaultProps: {
                padding: "16px",
                backgroundColor: "#ffffff",
                borderRadius: "8px"
            },
            template: {
                type: "container",
                text: "",
                props: { padding: "16px", backgroundColor: "#ffffff" },
                children: []
            }
        },
        {
            type: "row",
            label: "Row",
            icon: "↔️",
            description: "Horizontal layout",
            template: {
                type: "container",
                text: "",
                props: { display: "flex", flexDirection: "row", gap: "8px" },
                children: []
            }
        },
        {
            type: "column",
            label: "Column",
            icon: "↕️",
            description: "Vertical layout",
            template: {
                type: "container",
                text: "",
                props: { display: "flex", flexDirection: "column", gap: "8px" },
                children: []
            }
        },
        {
            type: "card",
            label: "Card",
            icon: "🃏",
            description: "Card with shadow",
            template: {
                type: "container",
                text: "",
                props: {
                    padding: "20px",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                },
                children: []
            }
        }
    ],

    input: [
        {
            type: "button",
            label: "Button",
            icon: "🔘",
            description: "Action button",
            template: {
                type: "button",
                text: "Click me",
                props: {
                    color: "#007acc",
                    size: "medium",
                    variant: "primary"
                }
            }
        },
        {
            type: "input",
            label: "Input",
            icon: "✏️",
            description: "Text input field",
            template: {
                type: "input",
                text: "",
                props: {
                    placeholder: "Enter text...",
                    type: "text",
                    size: "medium"
                }
            }
        },
        {
            type: "checkbox",
            label: "Checkbox",
            icon: "☑️",
            description: "Toggle checkbox",
            template: {
                type: "checkbox",
                text: "Option",
                props: {
                    checked: false,
                    color: "#007acc"
                }
            }
        },
        {
            type: "select",
            label: "Select",
            icon: "🔽",
            description: "Dropdown select",
            template: {
                type: "select",
                text: "",
                props: {
                    options: ["Option 1", "Option 2", "Option 3"],
                    placeholder: "Choose..."
                }
            }
        }
    ],

    display: [
        {
            type: "text",
            label: "Text",
            icon: "📄",
            description: "Simple text",
            template: {
                type: "text",
                text: "Text content",
                props: {
                    fontSize: "14px",
                    color: "#333333"
                }
            }
        },
        {
            type: "heading",
            label: "Heading",
            icon: "📝",
            description: "Large heading",
            template: {
                type: "heading",
                text: "Heading",
                props: {
                    level: "h1",
                    size: "large",
                    color: "#222222"
                }
            }
        },
        {
            type: "image",
            label: "Image",
            icon: "🖼️",
            description: "Image display",
            template: {
                type: "image",
                text: "",
                props: {
                    src: "https://via.placeholder.com/300x200",
                    alt: "Image",
                    width: "300px",
                    height: "auto"
                }
            }
        },
        {
            type: "icon",
            label: "Icon",
            icon: "⭐",
            description: "Icon/Emoji",
            template: {
                type: "text",
                text: "⭐",
                props: {
                    fontSize: "32px"
                }
            }
        }
    ],

    navigation: [
        {
            type: "navbar",
            label: "Navbar",
            icon: "🧭",
            description: "Navigation bar",
            template: {
                type: "container",
                text: "",
                props: {
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    backgroundColor: "#2d2d2d",
                    color: "#ffffff"
                },
                children: [
                    {
                        type: "heading",
                        text: "Logo",
                        props: { size: "medium", color: "#ffffff" }
                    },
                    {
                        type: "container",
                        props: { display: "flex", gap: "16px" },
                        children: [
                            { type: "text", text: "Home", props: { color: "#ffffff" } },
                            { type: "text", text: "About", props: { color: "#ffffff" } },
                            { type: "text", text: "Contact", props: { color: "#ffffff" } }
                        ]
                    }
                ]
            }
        },
        {
            type: "tabs",
            label: "Tabs",
            icon: "📑",
            description: "Tab navigation",
            template: {
                type: "container",
                text: "",
                props: {
                    display: "flex",
                    gap: "8px",
                    borderBottom: "2px solid #e0e0e0"
                },
                children: [
                    { type: "button", text: "Tab 1", props: { variant: "text" } },
                    { type: "button", text: "Tab 2", props: { variant: "text" } },
                    { type: "button", text: "Tab 3", props: { variant: "text" } }
                ]
            }
        }
    ],

    forms: [
        {
            type: "login-form",
            label: "Login Form",
            icon: "🔐",
            description: "Complete login form",
            template: {
                type: "container",
                text: "",
                props: {
                    padding: "32px",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    maxWidth: "400px"
                },
                children: [
                    {
                        type: "heading",
                        text: "Welcome Back",
                        props: { size: "large", color: "#222222" }
                    },
                    {
                        type: "input",
                        text: "",
                        props: { placeholder: "Email", type: "email" }
                    },
                    {
                        type: "input",
                        text: "",
                        props: { placeholder: "Password", type: "password" }
                    },
                    {
                        type: "button",
                        text: "Login",
                        props: { color: "#007acc", size: "large" }
                    }
                ]
            }
        },
        {
            type: "signup-form",
            label: "Signup Form",
            icon: "📝",
            description: "Complete signup form",
            template: {
                type: "container",
                text: "",
                props: {
                    padding: "32px",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    maxWidth: "400px"
                },
                children: [
                    {
                        type: "heading",
                        text: "Create Account",
                        props: { size: "large" }
                    },
                    {
                        type: "input",
                        props: { placeholder: "Full Name" }
                    },
                    {
                        type: "input",
                        props: { placeholder: "Email", type: "email" }
                    },
                    {
                        type: "input",
                        props: { placeholder: "Password", type: "password" }
                    },
                    {
                        type: "button",
                        text: "Sign Up",
                        props: { color: "#4caf50", size: "large" }
                    }
                ]
            }
        }
    ]
};

// Alle Kategorien
export const CATEGORIES = [
    { id: "layout", label: "Layout", icon: "📐" },
    { id: "input", label: "Input", icon: "✏️" },
    { id: "display", label: "Display", icon: "👁️" },
    { id: "navigation", label: "Navigation", icon: "🧭" },
    { id: "forms", label: "Forms", icon: "📋" }
];

// Component by Type
export function getComponentTemplate(type) {
    for (const category of Object.values(COMPONENT_LIBRARY)) {
        const component = category.find(c => c.type === type);
        if (component) {
            return { ...component.template };
        }
    }
    return null;
}

// All Components
export function getAllComponents() {
    return Object.values(COMPONENT_LIBRARY).flat();
}
