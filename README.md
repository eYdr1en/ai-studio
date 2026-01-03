# AI Studio

A stunning AI image generation studio powered by FLUX.2 Turbo via HuggingFace Inference and fal-ai.

![AI Studio](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat-square&logo=tailwindcss)

## Features

- **FLUX.2 Turbo** - Ultra-fast, high-quality image generation
- **Adjustable Quality** - Control inference steps (1-20) for speed/quality balance
- **Modern UI** - Beautiful dark theme with glassmorphism effects
- **One-Click Download** - Save generated images instantly
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- [Next.js 15](https://nextjs.org) - React framework with App Router
- [HuggingFace Inference](https://huggingface.co/docs/huggingface.js) - AI model inference
- [fal-ai FLUX.2](https://fal.ai) - Image generation provider
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [TailwindCSS v4](https://tailwindcss.com) - Styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- HuggingFace account with API token

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   
   Get your HuggingFace token at: https://huggingface.co/settings/tokens

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-studio&env=HF_TOKEN&envDescription=HuggingFace%20API%20Token&envLink=https://huggingface.co/settings/tokens)

### Manual Deployment

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the `HF_TOKEN` environment variable
4. Deploy!

### Vercel AI Gateway (Optional)

To use Vercel AI Gateway for enhanced reliability and analytics:

1. Enable AI Gateway in your Vercel project settings
2. The application will automatically route through the gateway

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `HF_TOKEN` | HuggingFace API token with Inference access | Yes |

## Usage Tips

- **Be descriptive**: Include details about lighting, style, mood, and colors
- **Add style keywords**: "digital art", "oil painting", "photography", "cinematic"
- **Optimal steps**: 4-8 steps usually provide the best speed/quality balance
- **FLUX.2 Turbo** is optimized for fast generation - higher steps won't always mean better quality

## Project Structure

```
ai-studio/
├── src/
│   ├── app/
│   │   ├── api/generate/    # Image generation API route
│   │   ├── layout.tsx       # Root layout with fonts
│   │   ├── page.tsx         # Main studio page
│   │   └── globals.css      # Custom theme & animations
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── studio/          # Studio-specific components
│   └── lib/
│       └── utils.ts         # Utility functions
├── public/                   # Static assets
└── package.json
```

## License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ using Next.js and HuggingFace
