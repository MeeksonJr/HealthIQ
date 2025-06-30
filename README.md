# HealthIQ 🩺

HealthIQ is a full-stack AI-powered health assistant that helps users understand their medical reports, prescriptions, food labels, and medications just by uploading a photo or document. It uses OCR and AI to scan, break down, and explain complex health data in simple and helpful ways.

## Features

- Upload medical reports, prescriptions, or food labels (PDF or image)
- OCR scanning with Google Cloud Vision API
- AI-powered breakdown using Gemini and Groq
- Pull ingredient and drug info using:
  - OpenFDA
  - USDA FoodData Central
  - OCR.Space
- Warnings, risks, ingredient facts, and health tips
- Vector search powered by Pinecone
- User auth and data storage using Supabase
- Framer Motion animations for smooth UI
- PayPal integration (sandbox mode for testing)

## Tech Stack

- Next.js + TypeScript
- TailwindCSS + Framer Motion
- Supabase (Auth + DB)
- Google Cloud Vision OCR
- OpenFDA API, USDA API, OCR.Space API
- Gemini + Groq + Hugging Face
- Pinecone for vector search
- PayPal (Sandbox for dev)

## Project Story

HealthIQ was inspired by my own life. I was born in Guinea and moved to New York when I was six. I didn’t speak English and had to learn quickly. I struggled in school and especially with understanding medical documents and paperwork. My parents had it even harder, and I remember seeing how confusing it all was.

Over time I learned the language, got into tech, and wanted to build something that could help people like us. HealthIQ is a tool that lets you scan any medical paper, prescription, or food label, and it tells you what it actually means. Simple and clear. It gives tips, warnings, ingredient details, and more — powered by AI and OCR.

This project is personal to me. It’s something I wish existed for my family when we first came here.

## How to Run Locally

1. Clone the repo  
2. Create a `.env.local` file with the following:
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=............
NEXT_PUBLIC_SUPABASE_ANON_KEY=........
# OCR.space API Configuration
OCR_SPACE_API_KEY=.................

# AI Model API Keys
HUGGING_FACE_API_KEY=...........
GEMINI_API_KEY=................
GROQ_API_KEY=......................

# PayPal Integration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=.........................
PAYPAL_SECRET_KEY=.................
```
Run the project:


🏆 Inspirational Story Prize Submission
HealthIQ comes from a real place. Being an immigrant, struggling with language, and watching my family feel lost when reading medical documents motivated me to build this app. I wanted to help people understand their health better using the tools we now have — AI, OCR, and modern web tech.

📫 Contact
Built by Mo (MeeksonJr)
Email: d.mohamed1504@gmail.com
Instagram: @md_meekson_jr

