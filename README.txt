# YAPPIFY-AI

Voice-first AI productivity powered by your own Gemini API key.

YAPPIFY-AI was built from a simple frustration: speaking ideas out loud is often the fastest way to think, but turning those ideas into structured, useful outputs usually requires multiple tools, subscriptions, and unnecessary friction.

YAPPIFY-AI provides a streamlined workflow for capturing spoken thoughts and transforming them into transcripts, prompts, translations, and structured AI-ready content.

Rather than requiring users to create accounts, purchase subscriptions, or hand over their data, YAPPIFY-AI follows a Bring Your Own Key (BYOK) approach. Users connect their own Gemini API key and retain control over how the application is used.

---

## Why YAPPIFY-AI Exists

Many AI tools have become increasingly subscription-heavy.

Users are often required to:

* Create accounts
* Purchase monthly subscriptions
* Trust third parties with their API usage
* Store sensitive information on external servers

YAPPIFY-AI takes a different approach.

The goal is to provide a lightweight AI workspace where users can leverage Google's Gemini models using their own API key while maintaining ownership and visibility over how the application operates.

The source code is publicly available for review so users can verify how API keys are handled and understand exactly how the application functions.

---

## Core Features

### Speech-to-Text

Capture voice recordings and generate transcripts quickly using AI-powered speech recognition.

Useful for:

* Brain dumps
* Meeting notes
* Content ideation
* Personal knowledge capture
* Voice journaling

---

### Promptify

Transform unstructured thoughts into structured prompts that can be used with AI systems.

Examples:

* Blog outlines
* Content briefs
* Marketing plans
* Research prompts
* Business workflows

Instead of spending time manually organizing ideas, users can speak naturally and let YAPPIFY-AI create a cleaner starting point.

---

### Translation

Convert transcripts into other languages while preserving context and meaning.

Useful for:

* International communication
* Multilingual content creation
* Language learning workflows

---

### Upload Processing

Upload existing transcript files and process them through the same AI workflows available to voice recordings.

---

### Custom Modes

Create reusable custom instructions and workflows tailored to specific use cases.

Examples:

* Blog generation
* Meeting summaries
* Social media planning
* Research analysis
* Customer feedback processing

Custom modes are stored locally within the browser.

---

## Privacy-First Design

Privacy is a foundational principle of YAPPIFY-AI.

### Bring Your Own Key (BYOK)

Users provide their own Gemini API key.

Benefits:

* Users control their own API usage
* No subscription billing through YAPPIFY-AI
* Transparent cost ownership
* Direct relationship with the AI provider

### Local Storage

Custom instructions and user preferences are stored locally within the browser.

### No User Accounts

YAPPIFY-AI does not require account creation.

### Open Source Transparency

The repository is public so developers and users can inspect the implementation and understand how the application handles API interactions.

---

## Tech Stack

* React
* TypeScript
* Vite
* Google Gemini API

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/tmshahz/yappify-ai-2.0.git
cd yappify-ai-2.0
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Live Application

YAPPIFY-AI can be accessed at:

https://yappify-ai.com

---

## Roadmap

Planned improvements include:

* Additional AI workflows
* Expanded transcription capabilities
* Improved prompt engineering tools
* Enhanced customization options
* Workflow automation features

---

## About the Project

YAPPIFY-AI started as a personal solution.

The initial goal was simple: create a faster way to move from spoken ideas to useful outputs.

Over time, that evolved into a broader productivity tool focused on helping users think, capture, organize, and transform information using modern AI systems while maintaining control over their own API access.

The project remains actively developed and continuously refined based on real-world usage.

---

## License

MIT License
