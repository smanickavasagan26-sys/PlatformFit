export const posts = [
  {
    id: "platformfit-app-spec",
    title: "PlatformFit: Building a High-Performance Visual Asset Optimizer",
    slug: "platformfit-app-spec",
    category: "Web Development",
    summary: "A deep dive into the design and implementation of PlatformFit, a client-side tool for cropping, compressing, and exporting social media assets.",
    readTime: "10 min read",
    date: "July 5, 2026",
    featured: true,
    author: {
      name: "Devin Miller",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      role: "Lead Engineer"
    },
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    content: `# PlatformFit — App Specification

> **Purpose of this document:** This is a complete, self-contained spec for an AI coding agent (or human developer) to build the app without needing further clarification. If anything below is ambiguous, prefer the simplest interpretation that matches the "V1 Scope" section.

---

## 1. One-Line Description

A single-page, 100% client-side web tool that lets users drop in an image, crop it to the exact dimensions required by a specific platform (LinkedIn, X/Twitter, Open Graph, App Store, etc.), compress it, preview the before/after visually, and export it — with no backend, no accounts, and no file ever leaving the browser.

## 2. Product Positioning

This is **not** "another image compressor." Compression tools (Squoosh, TinyPNG) already dominate that space and do it better/for free. The actual differentiator and the feature to build first is the **platform preset crop grid** — solving "what exact pixel size does platform X need?" Compression and the before/after slider are supporting features, not the headline.

Target user: indie hackers, solo founders, and technical bloggers who post across multiple platforms and don't have a designer on hand.

## 3. V1 Feature Scope

Build exactly these features for V1. Do not add batch upload, AVIF export, HEIC input, ads, or localStorage-saved prefs unless explicitly asked later — they are intentionally deferred to V2.

| # | Feature | Included in V1? |
|---|---|---|
| 1 | Drag-and-drop / click-to-upload single image | ✅ |
| 2 | Platform preset tabs (fixed list below) | ✅ |
| 3 | Crop overlay locked to selected preset's aspect ratio | ✅ |
| 4 | Compression quality slider | ✅ |
| 5 | Live before/after split-screen slider preview | ✅ |
| 6 | Live file-size ticker (shows KB savings in real time) | ✅ |
| 7 | Export as WebP (download) | ✅ |
| 8 | Copy result to clipboard | ✅ |
| 9 | Remember last-used preset + quality via localStorage | ✅ |
| 10 | Batch upload (multiple images) + zip export | ❌ V2 |
| 11 | AVIF export | ❌ V2 |
| 12 | HEIC input support | ❌ V2 |
| 13 | Ads / analytics scripts | ❌ V2 |
| 14 | User accounts / backend / database | ❌ V2 |

## 4. Platform Presets (fixed list for V1)

| Preset Label | Aspect Ratio | Target Pixel Size |
|---|---|---|
| OG Share Card | 1.91:1 | 1200 × 630 |
| X / Twitter Post | 16:9 | 1200 × 675 |
| X / Twitter Header | 3:1 | 1500 × 500 |
| LinkedIn Banner | 4:1 | 1584 × 396 |
| LinkedIn Post | 1:1 | 1200 × 1200 |
| App Store Screenshot | 16:10 | 1280 × 800 |
| Square (Generic) | 1:1 | 1080 × 1080 |

Each tab, when clicked, should set the crop overlay's aspect ratio to match and pre-fill the target pixel size shown as a label (e.g. "1200 × 630px") so the user knows what they're producing.

## 5. User Workflow (exact sequence)

1. **User lands on the page.**
   → Empty state shows a large dashed drop-zone with the text "Drop an image, or click to upload" and the row of preset tabs above it (default: OG Share Card selected).

2. **User drops or selects an image file (.png, .jpg, .jpeg, .webp).**
   → Image loads into an in-memory \`<img>\` via \`URL.createObjectURL()\`.
   → Workspace appears immediately: no loading spinner, no upload delay (nothing is uploaded).

3. **User clicks a preset tab (e.g. "LinkedIn Banner").**
   → Crop overlay updates to that aspect ratio instantly.
   → User can drag/resize the crop box within the image bounds.

4. **User drags the quality slider (0–100).**
   → On every change (debounced ~100ms), the cropped region is redrawn to an offscreen \`<canvas>\`, then \`canvas.toBlob(cb, 'image/webp', qualityValue)\` is called.
   → The before/after split-screen updates: dragging the split handle reveals more of the "after" (compressed) layer via clip-path.
   → A live ticker shows: original size → new size → % saved.

5. **User clicks "Download" or "Copy to Clipboard".**
   → **Download**: triggers a browser download of the WebP blob, filename like \`platformfit-{preset-slug}-{timestamp}.webp\`
   → **Copy**: uses \`navigator.clipboard.write()\` with a \`ClipboardItem\` to place the image blob directly on the system clipboard.

6. **On next visit, the last-used preset and quality slider value are restored from localStorage automatically.**

## 6. Tech Stack

- **Framework:** React (Vite, not Next.js — no SSR/backend is needed, so keep it a pure static SPA)
- **Styling:** Tailwind CSS
- **Cropping:** \`react-easy-crop\` or \`Cropper.js\` (either is fine)
- **State/Persistence:** React state for all in-session data. \`localStorage\` for exactly two persisted keys:
  - \`platformfit_last_preset\` (string, preset id)
  - \`platformfit_last_quality\` (number, 0–100)
- **Image processing:** Native browser APIs only — \`Canvas\`, \`canvas.toBlob()\`, \`URL.createObjectURL()\`.
- **Clipboard:** \`navigator.clipboard.write()\` with \`ClipboardItem\`.

## 7. Key Implementation Notes / Gotchas

- **Debounce the slider.** Redrawing to canvas on every single slider tick (60fps drag) will be janky. Debounce \`toBlob\` calls to roughly every 100ms, but keep the CSS \`clip-path\` reveal on the compare slider fully real-time.
- **EXIF/metadata stripping is automatic.** Because the image is drawn onto a canvas and re-exported, EXIF/GPS/camera metadata is dropped naturally.
- **Size safeguard.** If the compressed WebP blob ends up larger than the original file, fall back to offering the original file for download and show a small notice like "Original was already optimal."
- **Copy-to-clipboard fallback.** \`ClipboardItem\` with image types isn't supported in every browser (notably older Firefox). If \`navigator.clipboard.write\` or \`ClipboardItem\` is unavailable, hide the "Copy" button.
`
  },
  {
    id: "why-market-demand-matters",
    title: "Why Market Demand Matters More Than Code for Startups",
    slug: "why-market-demand-matters",
    category: "Startup",
    summary: "Great code won't save a bad idea. Learn why market validation and customer development are essential before building anything.",
    readTime: "5 min read",
    date: "July 2, 2026",
    featured: true,
    author: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      role: "Product Strategist"
    },
    coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    content: `# Why Market Demand Matters More Than Code for Startups
  
Great code won't save a bad idea. In the startup ecosystem, builders often fall in love with the engineering process. We design elegant architectures, write clean abstractions, and implement flawless testing suites. But if nobody actually wants the product, all of that beautiful code is essentially worthless.

## The Builder's Fallacy
Developers naturally gravitate toward writing code because it's comfortable and highly controllable. When you sit in front of an editor, you know that if you write correct logic, the compiler will reward you.

Conversely, talking to customers is messy, unpredictable, and full of rejection. It’s much easier to hide behind your IDE for six months and pretend you are building a business. This is the **Builder's Fallacy**: *If I build it, they will come.*

But they won't. Not unless you've proven there is a hair-on-fire problem they are willing to pay to solve.

## The Cost of Building First
When you build without validation, you incur:
1. **Opportunity Cost**: Months spent coding could have been spent exploring other, high-demand ideas.
2. **Sunk Cost Bias**: Once you write 10,000 lines of code, you will find it incredibly painful to pivot, even if customer feedback clearly dictates it.
3. **Emotional Burnout**: Launching to cricket noises is the number one killer of side projects and startups.

## How to Validate Demand Before Coding
* **Conduct Customer Interviews**: Talk to at least 15 people in your target audience. Don't ask them if they *would* buy your idea. Ask them how they currently solve the problem and how much they've spent trying.
* **Create a Smoke Test Landing Page**: Build a clean, single-page site outlining your product value proposition with an email signup. Check the signup conversion rate.
* **Run Pre-sales**: The ultimate validation is money. If you can get five people to pre-order or pay a deposit for your tool, you have green-lit the build.

## Conclusion
Code is not your product; it is merely the delivery mechanism for a solution. Validate the problem first, then write the code to solve it.`
  },
  {
    id: "ai-agents-vs-assistants",
    title: "AI Agents vs AI Assistants: Key Differences Explained",
    slug: "ai-agents-vs-assistants",
    category: "AI",
    summary: "Understand the difference between AI agents and AI assistants with real-world examples. Learn which one you need for your project.",
    readTime: "5 min read",
    date: "June 28, 2026",
    featured: true,
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      role: "AI Researcher"
    },
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    content: `# AI Agents vs AI Assistants: Key Differences Explained

Artificial Intelligence has shifted from static answering systems to proactive systems. Two terms dominate this new paradigm: **AI Assistants** and **AI Agents**. While they sound similar, they represent entirely different levels of automation, autonomy, and capability.

## Defining the Contenders

### What is an AI Assistant?
An AI Assistant is a reactive tool designed to help users with specific, short-term tasks. It responds to direct instructions and operates within a narrow conversation window.
* **Examples**: ChatGPT (in standard mode), Siri, Google Assistant.
* **Core Behavior**: "Answer my question," "Rewrite this paragraph," or "Draft an email."

### What is an AI Agent?
An AI Agent is an autonomous system designed to achieve a high-level goal with minimal human intervention. It can create its own plan, use external tools, browse the web, execute code, and reflect on its own errors to self-correct.
* **Examples**: AutoGPT, Devin, custom code interpreters executing multi-step goals.
* **Core Behavior**: "Research the top 10 competitors, compile a spreadsheet, and draft a personalized outreach campaign for each."

---

## Key Comparison Metrics

| Feature | AI Assistant | AI Agent |
|---|---|---|
| **Initiative** | Reactive (waits for prompt) | Proactive (works until goal is met) |
| **Planning** | Single-turn responses | Multi-step reasoning & looping |
| **Tool Usage** | Restricted to standard integrations | Arbitrary APIs, terminals, browsers |
| **Autonomy** | Low (requires constant human feedback) | High (runs in background for hours) |

## Architecture of an AI Agent
An agent typically consists of:
1. **Core LLM**: The brain that makes decisions.
2. **Memory**: Short-term memory (conversation history) and long-term memory (vector databases of documents/logs).
3. **Tools**: Capabilities like a web browser, code runner, or terminal.
4. **Planning Loop**: Re-evaluates state, checks if the goal has been achieved, and decides the next action (ReAct framework).

## Which One Do You Need?
If you need immediate answers, creative brainstorms, or formatting help, an **AI Assistant** is faster and less prone to looping errors. 

If you have a complex, time-consuming workflow with defined rules (like lead generation, QA testing, or deployment checks), setting up an **AI Agent** will save hundreds of hours of manual labor.`
  },
  {
    id: "best-notion-alternatives",
    title: "Best Notion Alternatives: AI-Powered Tools Compared",
    slug: "best-notion-alternatives",
    category: "Productivity",
    summary: "Compare top Notion alternatives with AI capabilities: Taskade, ClickUp, Coda, and how they help you manage knowledge.",
    readTime: "5 min read",
    date: "June 25, 2026",
    featured: true,
    author: {
      name: "Marcus Aurelius",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
      role: "Productivity Analyst"
    },
    coverImage: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80",
    content: `# Best Notion Alternatives: AI-Powered Tools Compared

Notion is the powerhouse of personal and workspace organization. However, as teams scale and the demand for AI integration grows, several alternatives have emerged that place AI collaboration at the core of their features.

## 1. Taskade: The Collaborative AI Agent Workspace
Taskade is built from the ground up to utilize AI agents. Unlike Notion where AI is an add-on assistant, Taskade allows you to deploy autonomous agents directly within your project trees to write outlines, generate task lists, and run audits automatically.
* **Best For**: High-velocity teams that want autonomous AI assistance.
* **Pricing**: Highly competitive free tier.

## 2. Coda: The Document-App Hybrid
Coda combines the simplicity of a doc with the power of an interactive database. Coda's AI is deeply integrated into tables, allowing you to run formulas, summarize rows, and auto-enrich data via web scraping within a table column.
* **Best For**: Advanced data modelers and spreadsheet wizards.

## 3. ClickUp: The All-In-One Hub
ClickUp is a powerful project management app. ClickUp Brain (its AI module) connects your tasks, documents, and company wikis, making it easy to ask questions like "Who is working on the marketing specs?" and get instant dashboard summaries.
* **Best For**: Large teams needing comprehensive task tracking alongside docs.`
  },
  {
    id: "what-software-startup-field",
    title: "What Software Startup Field Should You Build? 20+ Fields Analyzed",
    slug: "what-software-startup-field",
    category: "Startup",
    summary: "Discover which software startup fields are growing in 2026. Analysing 20+ fields including developer tools and B2B SaaS.",
    readTime: "5 min read",
    date: "June 20, 2026",
    featured: true,
    author: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      role: "Product Strategist"
    },
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    content: `# What Software Startup Field Should You Build? 20+ Fields Analyzed

Finding the right domain is half the battle for a solo founder or small product team. In 2026, technology is shifting rapidly. Here is our breakdown of three major fields showing strong growth and low barriers to entry.

## 1. Developer Tools (DevTools)
Engineers are willing to pay for tools that save time or streamline workflows.
* **Sub-fields**: Local developer sandboxes, visual environment checkers, automatic spec-to-code pipelines.
* **Why it works**: Short sales cycles, high retention, and developer-to-developer word of mouth.

## 2. Niche B2B SaaS
Broad horizontal software (like generic CRM) is oversaturated. Micro-SaaS targeting specific industries is highly profitable.
* **Examples**: Scheduling software specifically for mobile veterinarians, inventory management for boutique plant stores.
* **Why it works**: Neglected by venture capital, allowing bootstrappers to dominate through direct sales.

## 3. Visual Optimization Utilities
As content marketing shifts towards video and high-fidelity graphics, lightweight browsers tools that solve specific design specs (like PlatformFit) have explosive viral loops on LinkedIn and Twitter.
`
  },
  {
    id: "host-website-free",
    title: "Host a Website Free: Firebase, Vercel & Groq for Students",
    slug: "host-website-free",
    category: "Web Development",
    summary: "Build and deploy a real-time web app completely free using Firebase, Vercel, and Groq. A complete student guide.",
    readTime: "5 min read",
    date: "June 15, 2026",
    featured: true,
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      role: "AI Researcher"
    },
    coverImage: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80",
    content: `# Host a Website Free: Firebase, Vercel & Groq for Students

Students often have great ideas but lack the budget to deploy them. Fortunately, the current web hosting ecosystem offers incredible free tiers that let you run production-quality web apps for $0.

## The Modern Stack for Student Apps
1. **Frontend Hosting (Vercel)**: Connect a GitHub repository and deploy your React or Next.js app in seconds. Vercel handles SSL, global CDN distribution, and custom domains on their free tier.
2. **Database & Auth (Firebase)**: Firebase Firestore gives you a real-time NoSQL database with 50,000 free reads/day, plus authentication (Email, Google, GitHub logins) out of the box.
3. **AI Inference (Groq Developer API)**: Groq offers ultra-fast Llama-3 inference through a highly generous developer tier, making it easy to create AI chatbot tools or summary widgets.
`
  }
];

export const categories = [
  { id: "all", name: "All", count: 10, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" },
  { id: "devops", name: "DevOps", count: 1, image: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80" },
  { id: "productivity", name: "Productivity", count: 4, image: "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?auto=format&fit=crop&w=600&q=80" },
  { id: "programming", name: "Programming", count: 2, image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80" },
  { id: "business", name: "Business", count: 3, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" },
  { id: "startup", name: "Startup", count: 5, image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" },
  { id: "web-development", name: "Web Development", count: 2, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80" },
  { id: "open-source", name: "Open-Source Alternatives to Popular SaaS Tools", count: 1, image: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80" }
];
